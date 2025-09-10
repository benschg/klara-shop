import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Divider,
  TextField,
  Avatar,
  Chip,
} from '@mui/material';
import { Delete, Add, Remove, Close } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import type { CartItem } from '../contexts/CartContext';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ open, onClose }) => {
  const { state, updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity, item.selectedOptions);
    }
  };

  const handleRemoveItem = (item: CartItem) => {
    removeItem(item.id, item.selectedOptions);
  };

  const formatSelectedOptions = (options?: Record<string, string>) => {
    if (!options || Object.keys(options).length === 0) return '';
    return Object.entries(options)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  const drawerWidth = 400;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: drawerWidth },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Warenkorb ({state.totalItems})
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {state.items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Dein Warenkorb ist leer
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Füge Artikel hinzu, um mit dem Einkaufen zu beginnen
            </Typography>
          </Box>
        ) : (
          <>
            <List>
              {state.items.map((item, index) => (
                <React.Fragment key={`${item.id}-${index}`}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <Box sx={{ display: 'flex', width: '100%', gap: 2 }}>
                      {item.imageUrl && (
                        <Avatar
                          src={item.imageUrl}
                          alt={item.name}
                          sx={{ width: 60, height: 60, borderRadius: 1 }}
                          variant="rounded"
                        />
                      )}
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'medium' }}>
                          {item.name}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          #{item.articleNumber}
                        </Typography>
                        
                        {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                          <Chip 
                            label={formatSelectedOptions(item.selectedOptions)}
                            size="small"
                            variant="outlined"
                            sx={{ mb: 1 }}
                          />
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Remove fontSize="small" />
                          </IconButton>
                          
                          <TextField
                            size="small"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value > 0) {
                                handleQuantityChange(item, value);
                              }
                            }}
                            sx={{ 
                              width: 60,
                              '& .MuiInputBase-input': { textAlign: 'center' }
                            }}
                            inputProps={{ min: 1, type: 'number' }}
                          />
                          
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          >
                            <Add fontSize="small" />
                          </IconButton>
                          
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(item)}
                            color="error"
                            sx={{ ml: 'auto' }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'medium' }}>
                          CHF {(item.price * item.quantity).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                  {index < state.items.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ px: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Total
                </Typography>
                <Typography variant="h6" color="primary">
                  CHF {state.totalPrice.toFixed(2)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                sx={{ mb: 1 }}
                onClick={() => {
                  // TODO: Implement checkout
                  alert('Checkout functionality would be implemented here');
                }}
              >
                Zur Kasse
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={onClose}
              >
                Weiter einkaufen
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};