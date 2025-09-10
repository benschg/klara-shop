import React, { useState, useEffect } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';

export const TestComponent: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = () => {
    const results: string[] = [];
    
    // Test 1: Check environment variables
    const apiKey = import.meta.env.VITE_KLARA_API_KEY;
    const apiBaseUrl = import.meta.env.VITE_KLARA_API_BASE_URL;
    
    results.push(`✅ Environment check:`);
    results.push(`   - API Key: ${apiKey ? '✅ Present' : '❌ Missing'}`);
    results.push(`   - Base URL: ${apiBaseUrl || 'https://api.klara.ch (default)'}`);
    
    // Test 2: Test fetch capability
    results.push(`✅ Network test:`);
    
    fetch('https://jsonplaceholder.typicode.com/posts/1')
      .then(response => response.json())
      .then(data => {
        setTestResults(prev => [...prev, `   - Network connectivity: ✅ Working`]);
      })
      .catch(error => {
        setTestResults(prev => [...prev, `   - Network connectivity: ❌ Failed`]);
      });

    // Test 3: Try Klara API
    if (apiKey) {
      results.push(`✅ Klara API test:`);
      
      const testUrl = `/api/core/latest/articles?limit=1`;
      
      fetch(testUrl, {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      })
        .then(response => {
          setTestResults(prev => [...prev, `   - API Status: ${response.status} ${response.statusText}`]);
          return response.text();
        })
        .then(data => {
          setTestResults(prev => [...prev, `   - Response: ${data.substring(0, 200)}...`]);
        })
        .catch(error => {
          setTestResults(prev => [...prev, `   - API Error: ${error.message}`]);
        });
    } else {
      results.push(`❌ Klara API test: Skipped (no API key)`);
    }
    
    setTestResults(results);
  };

  return (
    <Box sx={{ mb: 4, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        🔧 Debug Panel
      </Typography>
      
      <Button variant="contained" onClick={runTests} sx={{ mb: 2 }}>
        Run Diagnostics
      </Button>
      
      {testResults.length > 0 && (
        <Alert severity="info" sx={{ whiteSpace: 'pre-line' }}>
          {testResults.join('\n')}
        </Alert>
      )}
    </Box>
  );
};