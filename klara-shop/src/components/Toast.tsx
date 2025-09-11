import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  Slide,
  Box,
  Typography,
  Avatar,
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import type { SlideProps } from '@mui/material/Slide';

interface ToastProps {
  open: boolean;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
  productImage?: string;
  productName?: string;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

export const Toast: React.FC<ToastProps> = ({
  open,
  message,
  type = 'success',
  duration = 4000,
  onClose,
  productImage,
  productName,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (open) {
      setShow(true);
    }
  }, [open]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 200); // Allow transition to complete
  };

  if (type === 'success' && productImage && productName) {
    // Custom cart success toast with product info
    return (
      <Snackbar
        open={show}
        autoHideDuration={duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        TransitionComponent={SlideTransition}
      >
        <Alert 
          onClose={handleClose} 
          severity={type}
          sx={{ 
            minWidth: 300,
            alignItems: 'center',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
            }
          }}
          icon={<ShoppingCart sx={{ color: 'success.main' }} />}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            {productImage && (
              <Avatar
                src={productImage}
                alt={productName}
                sx={{ width: 48, height: 48, borderRadius: 1 }}
                variant="rounded"
              />
            )}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {message}
              </Typography>
              {productName && (
                <Typography variant="caption" color="text.secondary">
                  {productName}
                </Typography>
              )}
            </Box>
          </Box>
        </Alert>
      </Snackbar>
    );
  }

  // Standard toast
  return (
    <Snackbar
      open={show}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      TransitionComponent={SlideTransition}
    >
      <Alert onClose={handleClose} severity={type}>
        {message}
      </Alert>
    </Snackbar>
  );
};