import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import type { Address } from '../types/checkout';

interface AddressFormProps {
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

export const AddressForm: React.FC<AddressFormProps> = ({ 
  address, 
  onChange, 
  errors = {}, 
  title 
}) => {
  const handleChange = (field: keyof Address) => (
    event: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    onChange({
      ...address,
      [field]: event.target.value as string,
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
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
          <TextField
            fullWidth
            label="Straße *"
            value={address.street}
            onChange={handleChange('street')}
            error={!!errors.street}
            helperText={errors.street}
            variant="outlined"
          />
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
            helperText={errors.postalCode}
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
    </Box>
  );
};