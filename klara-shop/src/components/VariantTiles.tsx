import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { ApiService } from '../services/apiService';

// Inline type definition to avoid import issues
type Variant = {
  id?: string;
  number?: string;
  barcode?: string;
  nameDE?: string;
  nameEN?: string;
  active?: boolean;
  pricePeriods?: Array<{
    validFrom?: string;
    validTo?: string;
    price?: number;
    currency?: string;
  }>;
  variantOptionValues?: string[];
  imageHrefs?: string[]; // Add imageHrefs to check if variants have their own images
};

interface VariantTilesProps {
  articleId: string;
  articleOptions?: Array<{
    name: string;
    values: string[];
  }>;
  onVariantChange?: (imageIndex: number) => void;
  onVariantPriceChange?: (variantPrice: number | null, selectedVariant: Variant | null) => void;
  totalImages?: number;
}

export const VariantTiles: React.FC<VariantTilesProps> = ({ 
  articleId, 
  articleOptions,
  onVariantChange, 
  onVariantPriceChange,
  totalImages = 0 
}) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  // Helper function to get variant price (moved up for debug use)
  const getVariantPrice = (variant: Variant) => {
    if (!variant.pricePeriods || variant.pricePeriods.length === 0) {
      return null;
    }
    
    // Get the first price period (assuming no date validation needed based on your data)
    return variant.pricePeriods[0]?.price || null;
  };

  useEffect(() => {
    const loadVariants = async () => {
      
      try {
        setLoading(true);
        setError(null);
        
        const fetchedVariants = await ApiService.getArticleVariants(articleId);
        
        
        if (!fetchedVariants || fetchedVariants.length === 0) {
          setVariants([]);
          return;
        }
        
        
        setVariants(fetchedVariants);
      } catch (err) {
        if (err instanceof Error && !err.message.includes('500')) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      loadVariants();
    } else {
    }
  }, [articleId]);

  // Get available options values based on article options structure and variants
  const availableOptionValues = useMemo(() => {
    if (!articleOptions || !variants.length) return {};
    
    const optionMap: Record<string, Set<string>> = {};
    
    // Initialize option sets
    articleOptions.forEach(option => {
      optionMap[option.name] = new Set<string>();
    });
    
    // Collect actual values from variants
    variants.forEach(variant => {
      if (variant.variantOptionValues && variant.variantOptionValues.length === articleOptions.length) {
        articleOptions.forEach((option, index) => {
          if (variant.variantOptionValues && variant.variantOptionValues[index]) {
            optionMap[option.name].add(variant.variantOptionValues[index]);
          }
        });
      }
    });
    
    // Convert Sets to arrays, preserving original order from article options
    const result: Record<string, string[]> = {};
    articleOptions.forEach(option => {
      if (optionMap[option.name]) {
        // Keep the original order from article.options, filter to only include values that exist in variants
        result[option.name] = option.values.filter(value => optionMap[option.name].has(value));
      }
    });
    
    
    return result;
  }, [articleOptions, variants]);

  // Find the selected variant based on selected options
  const selectedVariant = useMemo(() => {
    if (!articleOptions || !variants.length) return null;
    
    // Check if all options are selected
    const allOptionsSelected = articleOptions.every(option => selectedOptions[option.name]);
    if (!allOptionsSelected) return null;
    
    // Find matching variant
    const matchingVariant = variants.find(variant => {
      if (!variant.variantOptionValues || variant.variantOptionValues.length !== articleOptions.length) {
        return false;
      }
      
      return articleOptions.every((option, index) => {
        return variant.variantOptionValues![index] === selectedOptions[option.name];
      });
    });
    
    
    return matchingVariant || null;
  }, [articleOptions, variants, selectedOptions]);


  // Update parent price when variant selection changes
  useEffect(() => {
    if (selectedVariant) {
      // Handle price change
      if (onVariantPriceChange) {
        const variantPrice = getVariantPrice(selectedVariant);
        
        
        onVariantPriceChange(variantPrice, selectedVariant);
      }
    } else {
      // No variant selected, clear pricing
      if (onVariantPriceChange) {
        onVariantPriceChange(null, null);
      }
    }
  }, [selectedVariant, onVariantPriceChange]);

  const handleOptionChange = (optionName: string) => (event: SelectChangeEvent<string>) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: event.target.value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={1}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
          Loading variants...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 1 }}>
        Failed to load variants
      </Alert>
    );
  }

  // Show fallback if no article options are defined
  if (!articleOptions || articleOptions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        No variant options defined
      </Typography>
    );
  }

  if (variants.length === 0 && !loading) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Variants not available
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      {/* Dynamic option selectors based on article options */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {articleOptions.map((option) => (
          <FormControl key={option.name} size="small" sx={{ minWidth: 120 }}>
            <InputLabel id={`${option.name}-select-label`}>{option.name}</InputLabel>
            <Select
              labelId={`${option.name}-select-label`}
              id={`${option.name}-select`}
              value={selectedOptions[option.name] || ''}
              label={option.name}
              onChange={handleOptionChange(option.name)}
            >
              <MenuItem value="">
                <em>Select {option.name}</em>
              </MenuItem>
              {(availableOptionValues[option.name] || []).map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Box>
    </Box>
  );
};