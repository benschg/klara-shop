import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

type OptionValue = {
  name: string;
  price?: number; // Additional price for this option value
};

type Option = {
  name: string;
  values: (string | OptionValue)[]; // Support both simple strings and objects with pricing
};

interface OptionsSelectorProps {
  options: Option[];
  basePrice?: number;
  onSelectionChange?: (selections: Record<string, string>) => void;
  onPriceChange?: (additionalPrice: number, totalPrice: number) => void;
}

export const OptionsSelector: React.FC<OptionsSelectorProps> = ({ 
  options, 
  basePrice = 0,
  onSelectionChange,
  onPriceChange 
}) => {
  const [selections, setSelections] = useState<Record<string, string>>({});

  // Helper function to get option value object
  const getOptionValue = (option: Option, valueName: string): OptionValue | null => {
    const value = option.values.find(v => {
      if (typeof v === 'string') return v === valueName;
      return v.name === valueName;
    });
    
    if (!value) return null;
    if (typeof value === 'string') return { name: value };
    return value;
  };

  // Helper function to get display name for option value
  const getValueDisplayName = (value: string | OptionValue): string => {
    return typeof value === 'string' ? value : value.name;
  };

  // Helper function to get additional price for current selections
  const getAdditionalPrice = (): number => {
    return options.reduce((total, option) => {
      const selectedValueName = selections[option.name];
      if (!selectedValueName) return total;
      
      const optionValue = getOptionValue(option, selectedValueName);
      return total + (optionValue?.price || 0);
    }, 0);
  };

  // Helper function to get total price
  const getTotalPrice = (): number => {
    return basePrice + getAdditionalPrice();
  };

  // Update parent when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selections);
    }
    if (onPriceChange) {
      const additionalPrice = getAdditionalPrice();
      const totalPrice = getTotalPrice();
      onPriceChange(additionalPrice, totalPrice);
    }
  }, [selections, onSelectionChange, onPriceChange, basePrice]);

  const handleSelectionChange = (optionName: string) => (event: SelectChangeEvent<string>) => {
    setSelections(prev => ({
      ...prev,
      [optionName]: event.target.value
    }));
  };

  const isSelectionComplete = () => {
    return options.every(option => selections[option.name]);
  };

  const getSelectedVariantName = () => {
    if (!isSelectionComplete()) return null;
    
    return options.map(option => selections[option.name]).join(' / ');
  };

  if (!options || options.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        No options available
      </Typography>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Options
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {options.map((option) => (
          <FormControl key={option.name} size="small" fullWidth>
            <InputLabel id={`${option.name}-select-label`}>{option.name}</InputLabel>
            <Select
              labelId={`${option.name}-select-label`}
              id={`${option.name}-select`}
              value={selections[option.name] || ''}
              label={option.name}
              onChange={handleSelectionChange(option.name)}
            >
              <MenuItem value="">
                <em>Select {option.name}</em>
              </MenuItem>
              {option.values.map((value) => {
                const displayName = getValueDisplayName(value);
                const price = typeof value === 'object' ? value.price : undefined;
                
                return (
                  <MenuItem key={displayName} value={displayName}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>{displayName}</span>
                      {price && price > 0 && (
                        <span style={{ color: '#1976d2', fontWeight: 'bold' }}>
                          +CHF {price.toFixed(2)}
                        </span>
                      )}
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        ))}
      </Box>

      {isSelectionComplete() && (
        <Box sx={{ 
          p: 2, 
          mt: 2, 
          border: 1, 
          borderColor: 'primary.main', 
          borderRadius: 1, 
          bgcolor: 'primary.50' 
        }}>
          <Typography variant="body2" gutterBottom>
            <strong>Selected:</strong> {getSelectedVariantName()}
          </Typography>
          
          {basePrice > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Base price: CHF {basePrice.toFixed(2)}
              </Typography>
              
              {getAdditionalPrice() > 0 && (
                <Typography variant="body2" color="primary">
                  Options: +CHF {getAdditionalPrice().toFixed(2)}
                </Typography>
              )}
              
              <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                Total: CHF {getTotalPrice().toFixed(2)}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};