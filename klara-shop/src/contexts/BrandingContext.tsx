import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { BrandingConfig } from '../types/branding';

interface BrandingContextType {
  branding: BrandingConfig | null;
  loading: boolean;
  error: string | null;
  reloadBranding: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

interface BrandingProviderProps {
  children: ReactNode;
  configPath?: string;
}

export const BrandingProvider: React.FC<BrandingProviderProps> = ({ 
  children, 
  configPath = '/src/config/branding.json' 
}) => {
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBranding = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Import the branding config
      const brandingModule = await import('../config/branding.json');
      setBranding(brandingModule.default);
      
      // Apply CSS custom properties for theming
      if (brandingModule.default) {
        applyBrandingToCss(brandingModule.default);
      }
    } catch (err) {
      console.error('Error loading branding configuration:', err);
      setError(err instanceof Error ? err.message : 'Failed to load branding');
    } finally {
      setLoading(false);
    }
  };

  const applyBrandingToCss = (config: BrandingConfig) => {
    const root = document.documentElement;
    
    // Apply color variables
    root.style.setProperty('--brand-primary', config.colors.primary.main);
    root.style.setProperty('--brand-primary-light', config.colors.primary.light);
    root.style.setProperty('--brand-primary-dark', config.colors.primary.dark);
    root.style.setProperty('--brand-secondary', config.colors.secondary.main);
    root.style.setProperty('--brand-secondary-light', config.colors.secondary.light);
    root.style.setProperty('--brand-secondary-dark', config.colors.secondary.dark);
    root.style.setProperty('--brand-accent', config.colors.accent.main);
    root.style.setProperty('--brand-background', config.colors.background.default);
    root.style.setProperty('--brand-background-paper', config.colors.background.paper);
    root.style.setProperty('--brand-text-primary', config.colors.text.primary);
    root.style.setProperty('--brand-text-secondary', config.colors.text.secondary);
    
    // Apply typography variables
    root.style.setProperty('--brand-font-family', config.typography.primaryFont.family);
    root.style.setProperty('--brand-heading-font-family', config.typography.headingFont.family);
    
    // Apply theme variables
    root.style.setProperty('--brand-border-radius', config.theme.borderRadius);
    root.style.setProperty('--brand-elevation-low', config.theme.elevation.low);
    root.style.setProperty('--brand-elevation-medium', config.theme.elevation.medium);
    root.style.setProperty('--brand-elevation-high', config.theme.elevation.high);
  };

  const reloadBranding = async () => {
    await loadBranding();
  };

  useEffect(() => {
    loadBranding();
  }, []);

  return (
    <BrandingContext.Provider value={{ branding, loading, error, reloadBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = (): BrandingContextType => {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};