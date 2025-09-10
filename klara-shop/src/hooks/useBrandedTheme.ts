import { createTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import { useBranding } from '../contexts/BrandingContext';
import type { BrandingConfig } from '../types/branding';

export const createBrandedTheme = (branding: BrandingConfig): Theme => {
  return createTheme({
    palette: {
      primary: {
        main: branding.colors.primary.main,
        light: branding.colors.primary.light,
        dark: branding.colors.primary.dark,
        contrastText: branding.colors.primary.contrastText,
      },
      secondary: {
        main: branding.colors.secondary.main,
        light: branding.colors.secondary.light,
        dark: branding.colors.secondary.dark,
        contrastText: branding.colors.secondary.contrastText,
      },
      background: {
        default: branding.colors.background.default,
        paper: branding.colors.background.paper,
      },
      text: {
        primary: branding.colors.text.primary,
        secondary: branding.colors.text.secondary,
        disabled: branding.colors.text.disabled,
      },
    },
    typography: {
      fontFamily: branding.typography.primaryFont.family,
      h1: {
        fontFamily: branding.typography.headingFont.family,
      },
      h2: {
        fontFamily: branding.typography.headingFont.family,
      },
      h3: {
        fontFamily: branding.typography.headingFont.family,
      },
      h4: {
        fontFamily: branding.typography.headingFont.family,
      },
      h5: {
        fontFamily: branding.typography.headingFont.family,
      },
      h6: {
        fontFamily: branding.typography.headingFont.family,
        fontWeight: branding.typography.brandFont.weight,
        textTransform: branding.typography.brandFont.transform as any,
        letterSpacing: branding.logo.style.letterSpacing,
      },
    },
    shape: {
      borderRadius: parseInt(branding.theme.borderRadius),
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: branding.header.backgroundColor,
            color: branding.header.textColor,
            boxShadow: branding.theme.elevation[branding.header.elevation as keyof typeof branding.theme.elevation],
            minHeight: branding.header.height,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: branding.cards.backgroundColor,
            borderRadius: branding.cards.borderRadius,
            boxShadow: branding.theme.elevation[branding.cards.elevation as keyof typeof branding.theme.elevation],
            padding: branding.cards.padding,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          contained: {
            '&.MuiButton-containedPrimary': {
              backgroundColor: branding.buttons.primary.backgroundColor,
              color: branding.buttons.primary.color,
              '&:hover': {
                backgroundColor: branding.buttons.primary.hoverBackgroundColor,
              },
            },
            '&.MuiButton-containedSecondary': {
              backgroundColor: branding.buttons.secondary.backgroundColor,
              color: branding.buttons.secondary.color,
              '&:hover': {
                backgroundColor: branding.buttons.secondary.hoverBackgroundColor,
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: branding.theme.borderRadius,
          },
          colorPrimary: {
            backgroundColor: branding.colors.primary.light,
            color: branding.colors.primary.contrastText,
          },
          colorSecondary: {
            backgroundColor: branding.colors.secondary.light,
            color: branding.colors.secondary.contrastText,
          },
        },
      },
    },
  });
};

export const useBrandedTheme = (): Theme | null => {
  const { branding } = useBranding();
  
  if (!branding) {
    return null;
  }
  
  return createBrandedTheme(branding);
};