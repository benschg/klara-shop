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
  onVariantChange?: (imageIndex: number) => void;
  totalImages?: number;
}

export const VariantTiles: React.FC<VariantTilesProps> = ({ 
  articleId, 
  onVariantChange, 
  totalImages = 0 
}) => {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    const loadVariants = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedVariants = await ApiService.getArticleVariants(articleId);
        
        // Debug: Log variant option values structure
        console.log(`Loaded ${fetchedVariants.length} variants for article ${articleId}`);
        if (fetchedVariants.length > 0) {
          console.log('Sample variant options:', fetchedVariants[0]?.variantOptionValues);
        }
        
        setVariants(fetchedVariants);
      } catch (err) {
        // Log the error but don't show it to the user for API issues
        console.error('Error loading variants for article:', articleId, err);
        // Only set error for client-side issues, not server 500 errors
        if (err instanceof Error && !err.message.includes('500')) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    loadVariants();
  }, [articleId]);

  const getVariantPrice = (variant: Variant) => {
    if (!variant.pricePeriods || variant.pricePeriods.length === 0) {
      return null;
    }
    
    // Get the first price period (assuming no date validation needed based on your data)
    return variant.pricePeriods[0]?.price || null;
  };

  // Extract unique sizes and colors from variants
  const { sizes, colors } = useMemo(() => {
    const sizeSet = new Set<string>();
    const colorSet = new Set<string>();

    variants.forEach(variant => {
      if (variant.variantOptionValues && variant.variantOptionValues.length >= 2) {
        sizeSet.add(variant.variantOptionValues[0]); // First value is size
        colorSet.add(variant.variantOptionValues[1]); // Second value is color
      }
    });

    return {
      sizes: Array.from(sizeSet).sort(),
      colors: Array.from(colorSet).sort()
    };
  }, [variants]);

  // Find the selected variant
  const selectedVariant = useMemo(() => {
    if (!selectedSize || !selectedColor) return null;
    
    return variants.find(variant => 
      variant.variantOptionValues &&
      variant.variantOptionValues[0] === selectedSize &&
      variant.variantOptionValues[1] === selectedColor
    );
  }, [variants, selectedSize, selectedColor]);

  // Calculate which image to show based on variant selection
  const getImageIndexForVariant = (size: string, color: string) => {
    if (totalImages <= 1) return 0;
    
    // Create a simple mapping: different colors get different images
    const colorIndex = colors.indexOf(color);
    return colorIndex >= 0 && colorIndex < totalImages ? colorIndex : 0;
  };

  // Update parent image when variant selection changes
  useEffect(() => {
    if (selectedSize && selectedColor && onVariantChange && totalImages > 1) {
      const imageIndex = getImageIndexForVariant(selectedSize, selectedColor);
      onVariantChange(imageIndex);
    }
  }, [selectedSize, selectedColor, onVariantChange, totalImages, colors]);

  const handleSizeChange = (event: SelectChangeEvent<string>) => {
    setSelectedSize(event.target.value);
  };

  const handleColorChange = (event: SelectChangeEvent<string>) => {
    setSelectedColor(event.target.value);
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

  if (variants.length === 0 && !loading) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Variants not available
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Variants ({variants.length})
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <InputLabel id="size-select-label">Size</InputLabel>
          <Select
            labelId="size-select-label"
            id="size-select"
            value={selectedSize}
            label="Size"
            onChange={handleSizeChange}
          >
            <MenuItem value="">
              <em>Select Size</em>
            </MenuItem>
            {sizes.map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 80 }}>
          <InputLabel id="color-select-label">Color</InputLabel>
          <Select
            labelId="color-select-label"
            id="color-select"
            value={selectedColor}
            label="Color"
            onChange={handleColorChange}
          >
            <MenuItem value="">
              <em>Select Color</em>
            </MenuItem>
            {colors.map((color) => (
              <MenuItem key={color} value={color}>
                {color}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {selectedVariant && (
        <Box sx={{ p: 2, border: 1, borderColor: 'primary.main', borderRadius: 1, bgcolor: 'primary.50' }}>
          <Typography variant="body2" gutterBottom>
            <strong>Selected Variant:</strong> {selectedSize} / {selectedColor}
          </Typography>
          {selectedVariant.number && (
            <Typography variant="body2" color="text.secondary">
              Article Number: {selectedVariant.number}
            </Typography>
          )}
          {getVariantPrice(selectedVariant) && (
            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
              CHF {getVariantPrice(selectedVariant)!.toFixed(2)}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};