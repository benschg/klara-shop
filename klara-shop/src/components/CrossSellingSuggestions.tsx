import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  IconButton,
  Chip,
  Skeleton,
  Grid,
} from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import type { CrossSellingSuggestion } from '../services/crossSellingService';
import { useCartStore } from '../stores/cartStore';

interface CrossSellingSuggestionsProps {
  suggestions: CrossSellingSuggestion[];
  loading: boolean;
  onDismiss?: (category: string) => void;
}

export const CrossSellingSuggestions: React.FC<CrossSellingSuggestionsProps> = ({
  suggestions,
  loading,
  onDismiss,
}) => {
  const { addItem } = useCartStore();

  const handleAddToCart = (article: any) => {
    addItem({
      id: article.id,
      articleNumber: article.articleNumber,
      name: article.name,
      price: article.price,
      imageUrl: article.imageUrl,
    });
  };

  if (loading) {
    return (
      <Box sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Empfehlungen werden geladen...
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, sm: 4 }} key={i}>
              <Card>
                <Skeleton variant="rectangular" height={120} />
                <CardContent>
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={16} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" color="primary">
          Das könnte dir auch gefallen
        </Typography>
      </Box>

      {suggestions.map((suggestion, index) => (
        <Box key={suggestion.category} sx={{ mb: index < suggestions.length - 1 ? 3 : 0 }}>
          {/* Suggestion Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip 
                label={suggestion.category} 
                size="small" 
                color="primary" 
                variant="outlined" 
              />
              <Typography variant="body2" color="text.secondary">
                {suggestion.message}
              </Typography>
            </Box>
            {onDismiss && (
              <IconButton 
                size="small" 
                onClick={() => onDismiss(suggestion.category)}
                sx={{ ml: 1 }}
              >
                <Close fontSize="small" />
              </IconButton>
            )}
          </Box>

          {/* Articles */}
          {suggestion.articles && suggestion.articles.length > 0 ? (
            <Grid container spacing={2}>
              {suggestion.articles.map((article) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                      },
                    }}
                  >
                    {article.imageUrl && (
                      <CardMedia
                        component="img"
                        height="120"
                        image={article.imageUrl}
                        alt={article.name}
                        sx={{ 
                          objectFit: 'cover',
                          bgcolor: 'grey.100',
                        }}
                      />
                    )}
                    <CardContent sx={{ flexGrow: 1, p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography 
                        variant="subtitle2" 
                        component="h3"
                        gutterBottom
                        sx={{ 
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          lineHeight: 1.2,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {article.name}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mb: 1, fontSize: '0.75rem' }}
                      >
                        #{article.articleNumber}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography 
                          variant="body1" 
                          color="primary" 
                          sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}
                        >
                          CHF {article.price.toFixed(2)}
                        </Typography>
                        
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => handleAddToCart(article)}
                          sx={{ 
                            minWidth: 'auto',
                            px: 1.5,
                            fontSize: '0.75rem',
                          }}
                        >
                          Hinzufügen
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
                Keine Artikel in der Kategorie "{suggestion.category}" verfügbar
              </Typography>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};