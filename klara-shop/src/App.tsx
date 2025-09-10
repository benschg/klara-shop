import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ArticleGrid } from './components/ArticleGrid';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { useBrandedTheme } from './hooks/useBrandedTheme';

const ThemedApp: React.FC = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const brandedTheme = useBrandedTheme();

  const handleCartOpen = () => {
    setCartOpen(true);
  };

  const handleCartClose = () => {
    setCartOpen(false);
  };

  if (!brandedTheme) {
    return <div>Loading branding...</div>;
  }

  return (
    <ThemeProvider theme={brandedTheme}>
      <CssBaseline />
      <Header onCartClick={handleCartOpen} />
      <ArticleGrid />
      <CartDrawer open={cartOpen} onClose={handleCartClose} />
    </ThemeProvider>
  );
};

function App() {
  return (
    <BrandingProvider>
      <CartProvider>
        <ToastProvider>
          <ThemedApp />
        </ToastProvider>
      </CartProvider>
    </BrandingProvider>
  );
}

export default App
