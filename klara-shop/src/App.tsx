import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ArticleGrid } from './components/ArticleGrid';
import { Header } from './components/Header';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutPage } from './pages/CheckoutPage';
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
      <Router>
        <Routes>
          <Route path="/" element={
            <>
              <Header onCartClick={handleCartOpen} />
              <ArticleGrid />
              <CartDrawer open={cartOpen} onClose={handleCartClose} />
            </>
          } />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

function App() {
  return (
    <BrandingProvider>
      <ToastProvider>
        <ThemedApp />
      </ToastProvider>
    </BrandingProvider>
  );
}

export default App
