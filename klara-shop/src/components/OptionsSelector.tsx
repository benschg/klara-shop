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

type Option = {
  name: string;
  values: string[];
};

interface OptionsSelectorProps {
  options: Option[];
  onSelectionChange?: (selections: Record<string, string>) => void;
}

export const OptionsSelector: React.FC<OptionsSelectorProps> = ({ 
  options, 
  onSelectionChange 
}) => {
  const [selections, setSelections] = useState<Record<string, string>>({});

  // Update parent when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selections);
    }
  }, [selections, onSelectionChange]);

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
              {option.values.map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
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
        </Box>
      )}
    </Box>
  );
};