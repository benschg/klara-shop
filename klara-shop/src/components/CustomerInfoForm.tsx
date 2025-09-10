import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
} from '@mui/material';

interface CustomerInfoFormProps {
  email: string;
  phone: string;
  onChange: (field: 'email' | 'phone', value: string) => void;
  errors?: {
    email?: string;
    phone?: string;
  };
}

export const CustomerInfoForm: React.FC<CustomerInfoFormProps> = ({ 
  email, 
  phone, 
  onChange, 
  errors = {} 
}) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Kontaktdaten
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Wir benötigen Ihre Kontaktdaten für die Bestellbestätigung und eventuelle Rückfragen.
      </Typography>
      
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="E-Mail-Adresse *"
            type="email"
            value={email}
            onChange={(e) => onChange('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email || 'Für die Bestellbestätigung'}
            variant="outlined"
            autoComplete="email"
          />
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Telefonnummer (optional)"
            type="tel"
            value={phone}
            onChange={(e) => onChange('phone', e.target.value)}
            error={!!errors.phone}
            helperText={errors.phone || 'Für eventuelle Rückfragen zur Bestellung (optional)'}
            variant="outlined"
            autoComplete="tel"
            placeholder="+41 XX XXX XX XX"
          />
        </Grid>
      </Grid>
    </Box>
  );
};