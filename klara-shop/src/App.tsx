import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ArticleGrid } from './components/ArticleGrid';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [cartOpen, setCartOpen] = useState(false);

  const handleCartOpen = () => {
    setCartOpen(true);
  };

  const handleCartClose = () => {
    setCartOpen(false);
  };

  return (
    <CartProvider>
      <ToastProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Header onCartClick={handleCartOpen} />
          <ArticleGrid />
          <CartDrawer open={cartOpen} onClose={handleCartClose} />
        </ThemeProvider>
      </ToastProvider>
    </CartProvider>
  );
}

export default App
