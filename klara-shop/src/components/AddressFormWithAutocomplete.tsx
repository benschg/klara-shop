import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Autocomplete,
  CircularProgress,
  Paper,
  Chip,
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import type { Address } from '../types/checkout';
import { useAddressAutocomplete } from '../hooks/useAddressAutocomplete';
import { swissAddressService, type AddressSuggestion } from '../services/addressService';

interface AddressFormWithAutocompleteProps {
  address: Address;
  onChange: (address: Address) => void;
  errors?: Partial<Record<keyof Address, string>>;
  title: string;
}

const countries = [
  'Switzerland',
  'Germany',
  'Austria',
  'France',
  'Italy',
  'Liechtenstein',
];

export const AddressFormWithAutocomplete: React.FC<AddressFormWithAutocompleteProps> = ({ 
  address, 
  onChange, 
  errors = {}, 
  title 
}) => {
  const [streetInputValue, setStreetInputValue] = useState(address.street || '');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const isSwiss = address.country === 'Switzerland';
  
  const { 
    suggestions, 
    loading, 
    searchSuggestions, 
    clearSuggestions 
  } = useAddressAutocomplete({
    debounceMs: 300,
    minQueryLength: 2,
    maxSuggestions: 10,
  });

  // Sync streetInputValue when address changes
  useEffect(() => {
    setStreetInputValue(address.street || '');
  }, [address.street]);

  const handleChange = (field: keyof Address) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const newValue = event.target.value as string;
    onChange({
      ...address,
      [field]: newValue,
    });

    // Handle street field changes for autocomplete
    if (isSwiss && field === 'street') {
      setStreetInputValue(newValue);
      setShowAutocomplete(true);
      if (newValue.length >= 2) {
        searchSuggestions(newValue);
      } else {
        clearSuggestions();
      }
    }
  };

  const handleSuggestionSelect = (suggestion: AddressSuggestion | null) => {
    if (!suggestion) {
      clearSuggestions();
      setShowAutocomplete(false);
      return;
    }

    const updatedAddress = { ...address };

    if (suggestion.type === 'street' && suggestion.street) {
      // User selected a street - fill all fields
      updatedAddress.street = suggestion.street;
      updatedAddress.postalCode = suggestion.postalCode;
      updatedAddress.city = suggestion.city;
      updatedAddress.country = 'Switzerland';
      setStreetInputValue(suggestion.street);
    } else if (suggestion.type === 'locality') {
      // User selected a city/postal code
      updatedAddress.postalCode = suggestion.postalCode;
      updatedAddress.city = suggestion.city;
      updatedAddress.country = 'Switzerland';
    }

    onChange(updatedAddress);
    clearSuggestions();
    setShowAutocomplete(false);
  };

  const renderSuggestionOption = (props: any, option: AddressSuggestion) => (
    <Box component="li" {...props}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
        <LocationOn color={option.type === 'street' ? 'primary' : 'action'} fontSize="small" />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: option.type === 'street' ? 600 : 400 }}>
            {option.fullAddress}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
            <Chip 
              label={option.type === 'street' ? 'Straße' : 'Ort'} 
              size="small" 
              variant="outlined"
              color={option.type === 'street' ? 'primary' : 'default'}
            />
            <Chip 
              label={option.state} 
              size="small" 
              variant="outlined" 
              color="default"
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      
      {/* Manual Address Form */}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Vorname *"
            value={address.firstName}
            onChange={handleChange('firstName')}
            error={!!errors.firstName}
            helperText={errors.firstName}
            variant="outlined"
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Nachname *"
            value={address.lastName}
            onChange={handleChange('lastName')}
            error={!!errors.lastName}
            helperText={errors.lastName}
            variant="outlined"
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 8 }}>
          {isSwiss && showAutocomplete ? (
            <Autocomplete
              freeSolo
              options={suggestions}
              loading={loading}
              value={null}
              onChange={(_, newValue) => {
                if (typeof newValue === 'string') {
                  // User typed a custom value
                  onChange({ ...address, street: newValue });
                  setStreetInputValue(newValue);
                } else if (newValue) {
                  // User selected a suggestion
                  handleSuggestionSelect(newValue);
                }
              }}
              inputValue={streetInputValue}
              onInputChange={(_, newInputValue, reason) => {
                if (reason === 'input') {
                  setStreetInputValue(newInputValue);
                  onChange({ ...address, street: newInputValue });
                  if (newInputValue.length >= 2) {
                    searchSuggestions(newInputValue);
                  } else {
                    clearSuggestions();
                  }
                }
              }}
              onBlur={() => {
                setTimeout(() => setShowAutocomplete(false), 150);
              }}
              onFocus={() => {
                if (address.street.length >= 2) {
                  setShowAutocomplete(true);
                  searchSuggestions(address.street);
                }
              }}
              getOptionLabel={(option) => typeof option === 'string' ? option : option.fullAddress}
              renderOption={renderSuggestionOption}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Straße *"
                  variant="outlined"
                  fullWidth
                  error={!!errors.street}
                  helperText={errors.street || (suggestions.length > 0 ? 'Wählen Sie eine Adresse oder geben Sie manuell ein' : 'Beginnen Sie mit der Eingabe für Vorschläge')}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              PaperComponent={(props) => (
                <Paper {...props} sx={{ mt: 1, maxHeight: 300, overflow: 'auto' }} />
              )}
              noOptionsText="Keine Vorschläge gefunden - Sie können manuell eingeben"
            />
          ) : (
            <TextField
              fullWidth
              label="Straße *"
              value={address.street}
              onChange={handleChange('street')}
              onFocus={() => {
                if (isSwiss) {
                  setStreetInputValue(address.street);
                  setShowAutocomplete(true);
                  if (address.street.length >= 2) {
                    searchSuggestions(address.street);
                  }
                }
              }}
              error={!!errors.street}
              helperText={errors.street || (isSwiss ? 'Beginnen Sie mit der Eingabe für automatische Vervollständigung' : '')}
              variant="outlined"
            />
          )}
        </Grid>
        
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="Hausnummer *"
            value={address.houseNumber}
            onChange={handleChange('houseNumber')}
            error={!!errors.houseNumber}
            helperText={errors.houseNumber}
            variant="outlined"
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            fullWidth
            label="PLZ *"
            value={address.postalCode}
            onChange={handleChange('postalCode')}
            error={!!errors.postalCode}
            helperText={
              errors.postalCode || 
              (isSwiss && address.postalCode && !swissAddressService.isValidSwissPostalCode(address.postalCode)
                ? 'Schweizer PLZ muss 4 Ziffern haben'
                : undefined)
            }
            variant="outlined"
            inputProps={{ maxLength: 5 }}
          />
        </Grid>
        
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            fullWidth
            label="Stadt *"
            value={address.city}
            onChange={handleChange('city')}
            error={!!errors.city}
            helperText={errors.city}
            variant="outlined"
          />
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth variant="outlined" error={!!errors.country}>
            <InputLabel>Land *</InputLabel>
            <Select
              value={address.country}
              onChange={handleChange('country')}
              label="Land *"
            >
              {countries.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                  {country === 'Switzerland' && (
                    <Chip 
                      label="Autocomplete" 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      sx={{ ml: 1 }} 
                    />
                  )}
                </MenuItem>
              ))}
            </Select>
            {errors.country && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                {errors.country}
              </Typography>
            )}
          </FormControl>
        </Grid>
      </Grid>

      {/* Helpful info for Swiss addresses */}
      {isSwiss && (
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'primary.50', borderRadius: 1, border: 1, borderColor: 'primary.200' }}>
          <Typography variant="caption" color="primary.700">
            💡 Tipp: Nutzen Sie die Adresssuche oben für schnellere Eingabe von Schweizer Adressen
          </Typography>
        </Box>
      )}
    </Box>
  );
};