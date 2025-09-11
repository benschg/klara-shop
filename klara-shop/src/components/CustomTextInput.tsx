import React, { useState, useEffect } from 'react';
import {
  TextField,
  Box,
  Alert,
} from '@mui/material';
import { TextCustomizationService, type TextCustomizationConfig } from '../services/textCustomizationService';

interface CustomTextInputProps {
  article: {
    nameDE: string;
    accountingTags?: string[];
  };
  value?: string;
  onChange: (text: string) => void;
  variant?: 'outlined' | 'filled' | 'standard';
  size?: 'small' | 'medium';
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({
  article,
  value = '',
  onChange,
  variant = 'outlined',
  size = 'medium',
}) => {
  const [customText, setCustomText] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<TextCustomizationConfig | null>(null);

  // Get customization config for this article
  useEffect(() => {
    const textConfig = TextCustomizationService.getCustomizationConfig(article);
    setConfig(textConfig);
  }, [article]);

  // Update internal state when external value changes
  useEffect(() => {
    setCustomText(value);
  }, [value]);

  // Validate and update text
  const handleTextChange = (newText: string) => {
    setCustomText(newText);
    
    if (config) {
      const validation = TextCustomizationService.validateCustomText(newText, config);
      if (!validation.isValid) {
        setError(validation.error || null);
      } else {
        setError(null);
      }
      
      // Always call onChange, even with validation errors
      // Parent can decide whether to use invalid text
      onChange(newText);
    }
  };

  // Don't render if customization is not enabled for this article
  if (!config || !config.enabled) {
    return null;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <TextField
        label={config.label}
        placeholder={config.placeholder}
        value={customText}
        onChange={(e) => handleTextChange(e.target.value)}
        variant={variant}
        size={size}
        fullWidth
        multiline={config.maxLength > 100}
        rows={config.maxLength > 100 ? 3 : 1}
        inputProps={{
          maxLength: config.maxLength,
        }}
        error={!!error}
        helperText={
          error || 
          (config.maxLength > 50 ? `${customText.length}/${config.maxLength} Zeichen` : undefined)
        }
        required={config.required}
        sx={{
          '& .MuiInputBase-root': {
            backgroundColor: 'background.default',
          },
        }}
      />
      
      {config.required && !customText && (
        <Alert severity="info" sx={{ mt: 1, fontSize: '0.875rem' }}>
          Dieses Feld ist erforderlich
        </Alert>
      )}
    </Box>
  );
};