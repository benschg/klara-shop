import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Box,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { ArrowBackIos, ArrowForwardIos, CheckCircle, ShoppingCart } from '@mui/icons-material';
import { VariantTiles } from './VariantTiles';
import { OptionsSelector } from './OptionsSelector';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
// Temporary inline type definition to fix import issue
type Article = {
  id?: string;
  nameDE: string;
  nameEN?: string;
  descriptionDE?: string;
  descriptionEN?: string;
  unitDE: string;
  unitEN?: string;
  barcode?: string;
  pricePeriods?: Array<{
    validFrom?: string;
    validTo?: string;
    price?: number;
    currency?: string;
  }>;
  imageHrefs?: string[];
  isArticleSet?: boolean;
  articleNumber: string;
  hasVariant?: boolean;
  productType?: {
    id?: string;
    name?: string;
  };
  accountingTags: string[];
  options?: Array<{
    name: string;
    values: string[];
  }>;
};

interface ArticleCardProps {
  article: Article;
  onImageError?: (imageUrl: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  onImageError 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCart();
  const { showCartSuccessToast } = useToast();
  
  const handleVariantImageChange = (imageIndex: number) => {
    if (imageIndex >= 0 && imageIndex < images.length) {
      setCurrentImageIndex(imageIndex);
    }
  };

  const handleOptionsSelectionChange = (selections: Record<string, string>) => {
    setSelectedOptions(selections);
  };
  const getDisplayName = () => {
    return article.nameEN || article.nameDE || 'Unnamed Article';
  };

  const getDisplayDescription = () => {
    return article.descriptionEN || article.descriptionDE || '';
  };

  const getDisplayUnit = () => {
    return article.unitEN || article.unitDE || '';
  };

  const getCurrentPrice = () => {
    if (!article.pricePeriods || article.pricePeriods.length === 0) {
      return null;
    }
    
    const currentDate = new Date();
    const validPeriod = article.pricePeriods.find(period => {
      if (!period.validFrom && !period.validTo) return true;
      
      const validFrom = period.validFrom ? new Date(period.validFrom) : null;
      const validTo = period.validTo ? new Date(period.validTo) : null;
      
      if (validFrom && currentDate < validFrom) return false;
      if (validTo && currentDate > validTo) return false;
      
      return true;
    });

    return validPeriod?.price || null;
  };

  const price = getCurrentPrice();

  // Check if options are required and all are selected
  const hasOptions = article.options && article.options.length > 0;
  const allOptionsSelected = hasOptions ? 
    article.options!.every(option => selectedOptions[option.name]) : true;

  const handleAddToCart = async () => {
    if (!article.id || !price || isAddingToCart) return;
    
    // Check if all required options are selected
    if (hasOptions && !allOptionsSelected) {
      alert('Bitte wähle alle Optionen aus bevor du das Produkt in den Warenkorb legst.');
      return;
    }

    setIsAddingToCart(true);

    const cartItem = {
      id: article.id,
      articleNumber: article.articleNumber,
      name: getDisplayName(),
      price: price,
      imageUrl: images.length > 0 ? getProxiedImageUrl(images[currentImageIndex]) : undefined,
      selectedOptions: hasOptions ? selectedOptions : undefined,
    };

    // Add to cart
    addItem(cartItem);
    
    // Show success toast with product info
    const selectedOptionsText = hasOptions && Object.keys(selectedOptions).length > 0 
      ? ` (${Object.entries(selectedOptions).map(([key, value]) => `${value}`).join(', ')})`
      : '';
    
    showCartSuccessToast(
      `In den Warenkorb gelegt!`,
      `${getDisplayName()}${selectedOptionsText}`,
      cartItem.imageUrl
    );

    // Reset button state after animation
    setTimeout(() => {
      setIsAddingToCart(false);
    }, 1000);
  };
  
  // Convert image URL to use proxy if in development
  const getProxiedImageUrl = (url: string) => {
    if (import.meta.env.DEV && url.startsWith('https://api.klara.ch')) {
      return url.replace('https://api.klara.ch', '/api');
    }
    return url;
  };
  
  const images = article.imageHrefs || [];
  const currentImageUrl = images.length > 0 ? getProxiedImageUrl(images[currentImageIndex]) : undefined;
  
  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };
  
  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {currentImageUrl && (
        <Box sx={{ position: 'relative', height: 200 }}>
          <CardMedia
            component="img"
            height="200"
            image={currentImageUrl}
            alt={getDisplayName()}
            onError={() => onImageError?.(currentImageUrl)}
            sx={{ objectFit: 'cover' }}
          />
          
          {/* Image navigation - only show if multiple images */}
          {images.length > 1 && (
            <>
              <IconButton
                onClick={handlePrevImage}
                sx={{
                  position: 'absolute',
                  left: 4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                  width: 32,
                  height: 32,
                }}
                size="small"
              >
                <ArrowBackIos fontSize="small" />
              </IconButton>
              
              <IconButton
                onClick={handleNextImage}
                sx={{
                  position: 'absolute',
                  right: 4,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  },
                  width: 32,
                  height: 32,
                }}
                size="small"
              >
                <ArrowForwardIos fontSize="small" />
              </IconButton>
              
              {/* Image indicator dots */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  display: 'flex',
                  gap: 0.5,
                }}
              >
                {images.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255, 255, 255, 0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </Box>
            </>
          )}
        </Box>
      )}
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography gutterBottom variant="h6" component="div">
          {getDisplayName()}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {getDisplayDescription()}
        </Typography>

        <Box sx={{ mt: 2, mb: 1 }}>
          {article.barcode && (
            <Typography variant="body2" color="text.secondary">
              Barcode: {article.barcode}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {article.productType?.name && (
            <Chip label={article.productType.name} size="small" variant="outlined" />
          )}
          
          
          {article.isArticleSet && (
            <Chip label="Article Set" size="small" color="secondary" />
          )}
        </Box>

        {/* Show options selector if article has options */}
        {article.options && article.options.length > 0 && (
          <OptionsSelector
            options={article.options}
            onSelectionChange={handleOptionsSelectionChange}
          />
        )}
        
        {/* Show variant tiles for articles with hasVariant but no options */}
        {article.hasVariant && article.id && (!article.options || article.options.length === 0) && (
          <VariantTiles 
            articleId={article.id} 
            onVariantChange={handleVariantImageChange}
            totalImages={images.length}
          />
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          {price && (
            <Typography variant="h6" color="primary">
              CHF {price.toFixed(2)}
            </Typography>
          )}
          
          <Button 
            variant="contained" 
            size="small"
            onClick={handleAddToCart}
            disabled={!price || (hasOptions && !allOptionsSelected) || isAddingToCart}
            startIcon={
              isAddingToCart ? (
                <CircularProgress size={16} color="inherit" />
              ) : hasOptions && !allOptionsSelected ? null : (
                <ShoppingCart fontSize="small" />
              )
            }
            sx={{
              transition: 'all 0.3s ease',
              '&.Mui-disabled': {
                opacity: isAddingToCart ? 0.8 : 0.5,
              },
              ...(isAddingToCart && {
                backgroundColor: 'success.main',
                '&:hover': {
                  backgroundColor: 'success.dark',
                },
              }),
            }}
          >
            {isAddingToCart 
              ? 'Hinzugefügt!' 
              : hasOptions && !allOptionsSelected 
                ? 'Optionen wählen' 
                : 'In den Warenkorb'
            }
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};