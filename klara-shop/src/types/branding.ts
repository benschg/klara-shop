export interface BrandingConfig {
  brandName: string;
  typography: {
    primaryFont: {
      family: string;
      fallbacks: string[];
    };
    headingFont: {
      family: string;
      fallbacks: string[];
    };
    brandFont: {
      family: string;
      weight: string;
      style: string;
      transform: string;
    };
  };
  colors: {
    primary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    accent: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    background: {
      default: string;
      paper: string;
      alt: string;
    };
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
  };
  logo: {
    type: string;
    text: string;
    icon: string;
    iconType?: string;
    showIcon: boolean;
    iconPosition: string;
    iconSize?: string;
    style: {
      fontSize: string;
      fontWeight: string;
      textTransform: string;
      letterSpacing: string;
    };
  };
  theme: {
    borderRadius: string;
    elevation: {
      low: string;
      medium: string;
      high: string;
    };
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  header: {
    backgroundColor: string;
    textColor: string;
    elevation: string;
    height: string;
  };
  cards: {
    backgroundColor: string;
    borderRadius: string;
    elevation: string;
    padding: string;
  };
  buttons: {
    primary: {
      backgroundColor: string;
      color: string;
      hoverBackgroundColor: string;
    };
    secondary: {
      backgroundColor: string;
      color: string;
      hoverBackgroundColor: string;
    };
  };
}