import React, { useState, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { ArticleGrid } from './components/ArticleGrid';
import { Header } from './components/Header';
import { SuggestionToast } from './components/SuggestionToast';
import { ToastProvider } from './contexts/ToastContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { useBrandedTheme } from './hooks/useBrandedTheme';
import { useCartStore } from './stores/cartStore';

// Lazy load components
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const CartDrawer = React.lazy(() => import('./components/CartDrawer').then(module => ({ default: module.CartDrawer })));

const ThemedApp: React.FC = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const brandedTheme = useBrandedTheme();
  const { showSuggestionToast, currentSuggestionToast, closeSuggestionToast } = useCartStore();

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
              <Suspense fallback={null}>
                <CartDrawer open={cartOpen} onClose={handleCartClose} />
              </Suspense>
            </>
          } />
          <Route path="/checkout" element={
            <Suspense fallback={
              <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
              </Box>
            }>
              <CheckoutPage />
            </Suspense>
          } />
        </Routes>
        
        {/* Suggestion Toast - appears globally */}
        <SuggestionToast
          open={showSuggestionToast}
          suggestion={currentSuggestionToast}
          onClose={closeSuggestionToast}
        />
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
