import React from 'react';
import {
  Snackbar,
  Alert,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
} from '@mui/material';
import { Close, ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { CrossSellingSuggestion } from '../services/crossSellingService';
import { useCartStore } from '../stores/cartStore';

interface SuggestionToastProps {
  open: boolean;
  suggestion: CrossSellingSuggestion | null;
  onClose: () => void;
}

export const SuggestionToast: React.FC<SuggestionToastProps> = ({
  open,
  suggestion,
  onClose,
}) => {
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  const handleAddToCart = (article: any) => {
    addItem({
      id: article.id,
      articleNumber: article.articleNumber,
      name: article.name,
      price: article.price,
      imageUrl: article.imageUrl,
    });
  };

  const handleCategoryClick = (category: string) => {
    onClose();
    navigate(`/?category=${encodeURIComponent(category)}`);
  };

  if (!suggestion) return null;

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      autoHideDuration={8000}
      sx={{ maxWidth: '95vw', width: '100%' }}
    >
      <Alert
        severity="info"
        sx={{
          width: '100%',
          maxWidth: { xs: '100%', sm: '600px', md: '800px', lg: '1000px' },
          '& .MuiAlert-message': {
            width: '100%',
            p: 0,
          },
          '& .MuiAlert-action': {
            alignItems: 'flex-start',
            pt: 1,
          },
        }}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={onClose}
          >
            <Close fontSize="small" />
          </IconButton>
        }
      >
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, mb: 0.5 }}>
              {suggestion.message}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Kategorie:
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={() => handleCategoryClick(suggestion.category)}
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  color: 'primary.main',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                  p: 0,
                  minWidth: 'auto',
                }}
              >
                {suggestion.category}
              </Button>
            </Box>
          </Box>

          {/* Articles */}
          {suggestion.articles && suggestion.articles.length > 0 ? (
            <Grid container spacing={1.5}>
              {suggestion.articles.slice(0, 5).map((article) => (
                <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }} key={article.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      minHeight: '200px',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: 2,
                      },
                    }}
                  >
                    {article.imageUrl ? (
                      <CardMedia
                        component="img"
                        height="120"
                        image={article.imageUrl}
                        alt={article.name}
                        sx={{ 
                          objectFit: 'cover',
                          bgcolor: 'grey.100',
                        }}
                        onError={(e) => {
                          // Hide image if it fails to load
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Box 
                        sx={{ 
                          height: '120px', 
                          bgcolor: 'grey.200', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center' 
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Kein Bild
                        </Typography>
                      </Box>
                    )}
                    <CardContent sx={{ flexGrow: 1, p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography 
                        variant="subtitle1" 
                        component="h3"
                        gutterBottom
                        sx={{ 
                          fontSize: '0.95rem',
                          fontWeight: 600,
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 1.5,
                          minHeight: '2.6em',
                        }}
                      >
                        {article.name}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 2, fontSize: '0.8rem' }}
                      >
                        #{article.articleNumber}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography 
                          variant="h6" 
                          color="primary" 
                          sx={{ fontWeight: 'bold', fontSize: '1rem' }}
                        >
                          CHF {article.price.toFixed(2)}
                        </Typography>
                        
                        <Button
                          variant="contained"
                          size="medium"
                          onClick={() => {
                            handleAddToCart(article);
                            onClose();
                          }}
                          sx={{ 
                            minWidth: '40px',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            p: 0,
                          }}
                        >
                          <ShoppingCart />
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1, 
              textAlign: 'center' 
            }}>
              <Typography variant="body2" color="text.secondary">
                Schaue in der Kategorie "{suggestion.category}" nach passenden Artikeln
              </Typography>
            </Box>
          )}
        </Box>
      </Alert>
    </Snackbar>
  );
};