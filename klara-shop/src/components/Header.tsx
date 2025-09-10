import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Box,
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useBranding } from '../contexts/BrandingContext';

interface HeaderProps {
  onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onCartClick }) => {
  const { state } = useCart();
  const { branding } = useBranding();

  const renderIcon = (icon: string, iconType?: string, iconSize?: string) => {
    if (iconType === 'image') {
      return (
        <img 
          src={icon} 
          alt="Logo" 
          style={{ 
            height: iconSize || '24px',
            width: 'auto',
            objectFit: 'contain'
          }} 
        />
      );
    }
    return <span style={{ fontSize: '1.2em' }}>{icon}</span>;
  };

  const renderLogo = () => {
    if (!branding) return 'avec plaisir';
    
    const { logo } = branding;
    const logoStyle = {
      ...logo.style,
      textTransform: logo.style.textTransform as any,
    };
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {logo.showIcon && logo.iconPosition === 'left' && 
          renderIcon(logo.icon, logo.iconType, logo.iconSize)
        }
        <span style={logoStyle}>{logo.text}</span>
        {logo.showIcon && logo.iconPosition === 'right' && 
          renderIcon(logo.icon, logo.iconType, logo.iconSize)
        }
      </Box>
    );
  };

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {renderLogo()}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
            CHF {state.totalPrice.toFixed(2)}
          </Typography>
          
          <IconButton
            color="inherit"
            onClick={onCartClick}
            aria-label={`shopping cart with ${state.totalItems} items`}
          >
            <Badge badgeContent={state.totalItems} color="secondary" max={99}>
              <ShoppingCart />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};