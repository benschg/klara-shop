import React from 'react';
import { Alert, Box, Typography } from '@mui/material';

export const DebugInfo: React.FC = () => {
  const apiKey = import.meta.env.VITE_KLARA_API_KEY;
  const apiBaseUrl = import.meta.env.VITE_KLARA_API_BASE_URL;

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6">Debug Information</Typography>
      <Alert severity={apiKey ? "success" : "warning"} sx={{ mb: 1 }}>
        API Key: {apiKey ? "✅ Configured" : "❌ Missing (check .env file)"}
      </Alert>
      <Alert severity="info">
        API Base URL: {apiBaseUrl || "https://api.klara.ch (default)"}
      </Alert>
    </Box>
  );
};