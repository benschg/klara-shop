import { useState, useEffect, useCallback } from 'react';
import { swissAddressService, type AddressSuggestion } from '../services/addressService';

interface UseAddressAutocompleteProps {
  currentAddress?: {
    postalCode?: string;
    city?: string;
  };
  debounceMs?: number;
  minQueryLength?: number;
  maxSuggestions?: number;
}

interface UseAddressAutocompleteReturn {
  suggestions: AddressSuggestion[];
  loading: boolean;
  error: string | null;
  searchSuggestions: (query: string) => void;
  clearSuggestions: () => void;
}

export const useAddressAutocomplete = ({
  currentAddress,
  debounceMs = 300,
  minQueryLength = 2,
  maxSuggestions = 10
}: UseAddressAutocompleteProps = {}): UseAddressAutocompleteReturn => {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    setLoading(false);
  }, []);

  const searchSuggestions = useCallback(async (query: string) => {
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Clear suggestions if query is too short
    if (query.length < minQueryLength) {
      clearSuggestions();
      return;
    }

    // Set up debounced search
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        const results = await swissAddressService.getAddressSuggestions(query, currentAddress);
        setSuggestions(results.slice(0, maxSuggestions));
      } catch (err) {
        console.error('Address autocomplete error:', err);
        setError('Fehler beim Laden der Adressvorschläge');
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    setDebounceTimer(timer);
  }, [currentAddress, debounceMs, minQueryLength, maxSuggestions, debounceTimer, clearSuggestions]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return {
    suggestions,
    loading,
    error,
    searchSuggestions,
    clearSuggestions,
  };
};