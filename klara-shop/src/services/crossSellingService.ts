import productCustomizationData from '../data/productCustomization.json';
import type { CartItem } from '../stores/cartStore';
import { ApiService } from './apiService';

export interface CrossSellingSuggestion {
  category: string;
  priority: number;
  message: string;
  articles?: Array<{
    id: string;
    name: string;
    price: number;
    imageUrl?: string;
    articleNumber: string;
  }>;
}

export class CrossSellingService {
  private static getSuggestionsForCategories(categories: string[]): CrossSellingSuggestion[] {
    const suggestions: CrossSellingSuggestion[] = [];
    
    categories.forEach(category => {
      const categorySuggestions = productCustomizationData.crossSelling.categories[category as keyof typeof productCustomizationData.crossSelling.categories];
      if (categorySuggestions) {
        suggestions.push(...categorySuggestions.suggest);
      }
    });
    
    return suggestions;
  }
  
  private static getSuggestionsForArticles(): CrossSellingSuggestion[] {
    const suggestions: CrossSellingSuggestion[] = [];
    
    // For now, we don't have article-specific cross-selling suggestions
    // This could be extended later if needed
    return suggestions;
  }
  
  private static getExistingCategoriesInCart(cartItems: CartItem[]): Set<string> {
    const existingCategories = new Set<string>();
    
    cartItems.forEach(item => {
      // This would need to be enhanced with actual article category data
      // For now, we'll use a simple name-based heuristic
      const name = item.name.toLowerCase();
      if (name.includes('karte') || name.includes('card')) {
        existingCategories.add('Karten');
      }
      if (name.includes('praline') || name.includes('schokolade')) {
        existingCategories.add('Pralinen');
      }
      if (name.includes('vase')) {
        existingCategories.add('Vasen');
      }
      if (name.includes('geschenkpapier') || name.includes('verpackung')) {
        existingCategories.add('Geschenkverpackung');
      }
    });
    
    return existingCategories;
  }
  
  public static async getSuggestionsForCart(cartItems: CartItem[]): Promise<CrossSellingSuggestion[]> {
    if (cartItems.length < productCustomizationData.crossSelling.rules.showAfterItemsInCart) {
      return [];
    }
    
    // Extract categories and article names from cart items
    const categories = new Set<string>();
    const articleNames: string[] = [];
    
    cartItems.forEach(item => {
      articleNames.push(item.name);
      
      // Simple heuristic to identify flower-related items
      const name = item.name.toLowerCase();
      
      if (name.includes('schnittblumen')) {
        categories.add('Schnittblumen');
      }
      if (name.includes('blumen') || name.includes('strauß') || name.includes('bouquet')) {
        categories.add('Blumen');
      }
      if (name.includes('rosen') || name.includes('rose')) {
        categories.add('Rosen');
      }
      if (name.includes('blumenstrauß') || name.includes('blumenstrauss')) {
        categories.add('Blumenstrauss');
      }
    });
    
    // Get suggestions based on categories and articles
    const categorySuggestions = this.getSuggestionsForCategories(Array.from(categories));
    const articleSuggestions = this.getSuggestionsForArticles();
    
    // Combine and deduplicate suggestions
    const allSuggestions = [...categorySuggestions, ...articleSuggestions];
    const uniqueSuggestions = new Map<string, CrossSellingSuggestion>();
    
    allSuggestions.forEach(suggestion => {
      const key = suggestion.category;
      if (!uniqueSuggestions.has(key) || 
          (uniqueSuggestions.get(key)?.priority || 999) > suggestion.priority) {
        uniqueSuggestions.set(key, suggestion);
      }
    });
    
    // Filter out categories already in cart if rule is enabled
    let filteredSuggestions = Array.from(uniqueSuggestions.values());
    
    if (productCustomizationData.crossSelling.rules.hideIfCategoryAlreadyInCart) {
      const existingCategories = this.getExistingCategoriesInCart(cartItems);
      filteredSuggestions = filteredSuggestions.filter(
        suggestion => !existingCategories.has(suggestion.category)
      );
    }
    
    // Sort by priority and limit results
    const sortedSuggestions = filteredSuggestions
      .sort((a, b) => a.priority - b.priority)
      .slice(0, productCustomizationData.crossSelling.rules.maxSuggestions);
    
    // Fetch actual articles for each suggested category
    try {
      const suggestionsWithArticles = await Promise.all(
        sortedSuggestions.map(async (suggestion) => {
          try {
            // Fetch articles from the suggested category (same params as main page)
            const articles = await ApiService.getArticles({ 
              limit: 100, // Get more articles to have enough after filtering
              sellInOnlineShop: true // Only get online shop articles
            });
            
            // Filter articles by category using accountingTags (same as main page)
            const categoryArticles = articles.filter(article => {
              // Apply online shop filter (same as main page)
              // Note: onlineShopCategories might not be available in all API responses
              // This is a placeholder for proper category filtering
              const hasOnlineShopCategories = (article as any).onlineShopCategories?.length > 0;
              if (!hasOnlineShopCategories && article.accountingTags?.length === 0) {
                return false;
              }
              
              // Then apply category filter
              // First try to match by accountingTags (same as main page)
              if (article.accountingTags && article.accountingTags.includes(suggestion.category)) {
                return true;
              }
              
              // Fallback to name matching for backward compatibility
              const name = article.nameDE.toLowerCase();
              const category = suggestion.category.toLowerCase();
              
              if (category.includes('karte') || category.includes('card')) {
                return name.includes('karte') || name.includes('card');
              }
              if (category.includes('praline')) {
                return name.includes('praline') || name.includes('schokolade');
              }
              if (category.includes('vase')) {
                return name.includes('vase');
              }
              if (category.includes('geschenkpapier') || category.includes('verpackung')) {
                return name.includes('geschenkpapier') || name.includes('verpackung');
              }
              
              return false;
            }).slice(0, 5);
            
            // Convert image URL to use proxy if in development
            const getProxiedImageUrl = (url: string) => {
              if (import.meta.env.DEV && url.startsWith("https://api.klara.ch")) {
                return url.replace("https://api.klara.ch", "/api");
              }
              return url;
            };

            return {
              ...suggestion,
              articles: categoryArticles.map(article => ({
                id: article.id || '',
                name: article.nameDE,
                price: article.pricePeriods?.[0]?.price || 0,
                imageUrl: article.imageHrefs?.[0] ? getProxiedImageUrl(article.imageHrefs[0]) : undefined,
                articleNumber: article.articleNumber
              }))
            };
          } catch (error) {
            // Return suggestion without articles if fetch fails
            return { ...suggestion, articles: [] };
          }
        })
      );
      
      return suggestionsWithArticles;
    } catch (error) {
      console.error('Error fetching suggestion articles:', error);
      return sortedSuggestions;
    }
  }
  
  public static getFallbackSuggestion(category: string): string | null {
    const fallback = productCustomizationData.crossSelling.fallbackSuggestions[category as keyof typeof productCustomizationData.crossSelling.fallbackSuggestions];
    return fallback?.message || null;
  }
}