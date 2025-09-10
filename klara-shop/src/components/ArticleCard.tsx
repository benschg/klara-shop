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
import { useCartStore } from '../stores/cartStore';
import { useToast } from '../contexts/ToastContext';
// Article type definition
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
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [variantPrice, setVariantPrice] = useState<number | null>(null);
  const addItem = useCartStore(state => state.addItem);
  const { showCartSuccessToast } = useToast();
  
  const handleVariantImageChange = (imageIndex: number) => {
    if (imageIndex >= 0 && imageIndex < images.length) {
      setCurrentImageIndex(imageIndex);
    }
  };


  const handleVariantPriceChange = (price: number | null, variant: any) => {
    setVariantPrice(price);
    setSelectedVariant(variant);
    console.log(`=== ARTICLE CARD VARIANT PRICE DEBUG ===`);
    console.log('Variant price received:', price);
    console.log('Selected variant:', variant);
    console.log(`=== END ARTICLE CARD VARIANT PRICE DEBUG ===`);
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

  const basePrice = getCurrentPrice();
  // Priority: Variant price > Base price (simplified - no separate option pricing)
  const displayPrice = variantPrice !== null ? variantPrice : basePrice;

  // Debug price calculation
  console.log(`=== SIMPLIFIED PRICE CALCULATION DEBUG for Article ${article.id} ===`);
  console.log('basePrice:', basePrice);
  console.log('variantPrice:', variantPrice);
  console.log('displayPrice (final):', displayPrice);
  console.log(`=== END SIMPLIFIED PRICE CALCULATION DEBUG ===`);

  // Check if variant is required and selected
  const hasVariants = article.hasVariant;
  const variantSelected = selectedVariant !== null;

  const handleAddToCart = async () => {
    if (!article.id || !displayPrice || isAddingToCart) return;
    
    // Check if variant is required but not selected
    if (hasVariants && !variantSelected) {
      alert('Bitte wähle eine Variante aus bevor du das Produkt in den Warenkorb legst.');
      return;
    }

    setIsAddingToCart(true);

    const cartItem = {
      id: article.id,
      articleNumber: selectedVariant?.number || article.articleNumber, // Use variant number if available
      name: selectedVariant?.nameDE || getDisplayName(), // Use variant name if available
      price: displayPrice,
      imageUrl: images.length > 0 ? getProxiedImageUrl(images[currentImageIndex]) : undefined,
      selectedVariant: selectedVariant ? {
        id: selectedVariant.id,
        number: selectedVariant.number,
        name: selectedVariant.nameDE,
        options: selectedVariant.variantOptionValues
      } : undefined,
    };

    // Add to cart
    addItem(cartItem);
    
    // Show success toast with product info
    const variantText = selectedVariant?.variantOptionValues?.length > 0 
      ? ` (${selectedVariant.variantOptionValues.join(', ')})`
      : '';
    
    showCartSuccessToast(
      `In den Warenkorb gelegt!`,
      `${cartItem.name}${variantText}`,
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

        {/* Show variant selector for articles with variants (consolidates options and variants) */}
        {(() => {
          const showVariants = article.hasVariant && article.id;
          console.log(`=== VARIANT TILES RENDER CHECK for Article ${article.id} ===`);
          console.log('hasVariant:', article.hasVariant);
          console.log('article.id:', article.id);
          console.log('has options (legacy):', article.options?.length || 0);
          console.log('showVariants:', showVariants);
          console.log(`=== END VARIANT TILES RENDER CHECK ===`);
          
          return showVariants ? (
            <VariantTiles 
              articleId={article.id!} 
              articleOptions={article.options} // Pass the option structure
              onVariantChange={handleVariantImageChange}
              onVariantPriceChange={handleVariantPriceChange}
              totalImages={images.length}
            />
          ) : null;
        })()}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          {displayPrice && (
            <Typography variant="h6" color="primary">
              CHF {displayPrice.toFixed(2)}
            </Typography>
          )}
          
          <Button 
            variant="contained" 
            size="small"
            onClick={handleAddToCart}
            disabled={!displayPrice || (hasVariants && !variantSelected) || isAddingToCart}
            startIcon={
              isAddingToCart ? (
                <CircularProgress size={16} color="inherit" />
              ) : hasVariants && !variantSelected ? null : (
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
              : hasVariants && !variantSelected 
                ? 'Variante wählen' 
                : 'In den Warenkorb'
            }
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};