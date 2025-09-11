import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CrossSellingService, type CrossSellingSuggestion } from '../services/crossSellingService';

// Cart item type
export type CartItem = {
  id: string;
  articleNumber: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  customText?: string;
  accountingTags?: string[];
  cartItemId: string; // Unique identifier for this specific cart item instance
  selectedVariant?: {
    id: string;
    number: string;
    name: string;
    options: string[];
  };
};

// Cart store state
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  suggestions: CrossSellingSuggestion[];
  suggestionsLoading: boolean;
  showSuggestionToast: boolean;
  currentSuggestionToast: CrossSellingSuggestion | null;
}

// Cart store actions
interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity' | 'cartItemId'> & { quantity?: number }) => void;
  removeItemById: (cartItemId: string) => void;
  updateQuantityById: (cartItemId: string, quantity: number) => void;
  updateCustomTextById: (cartItemId: string, customText: string) => void;
  // Keep legacy methods for backward compatibility
  removeItem: (id: string, selectedVariant?: { id: string }, customText?: string) => void;
  updateQuantity: (id: string, quantity: number, selectedVariant?: { id: string }, customText?: string) => void;
  updateCustomText: (id: string, customText: string, selectedVariant?: { id: string }, originalCustomText?: string) => void;
  clearCart: () => void;
  getCartItemKey: (id: string, selectedVariant?: { id: string }, customText?: string) => string;
  refreshSuggestions: () => Promise<void>;
  dismissSuggestion: (category: string) => void;
  showSuggestionToastFor: (item: CartItem) => Promise<void>;
  closeSuggestionToast: () => void;
}

// Combined cart store type
type CartStore = CartState & CartActions;

// Create a unique key for cart items based on id, variant, and custom text
const getCartItemKey = (id: string, selectedVariant?: { id: string }, customText?: string): string => {
  let key = id;
  
  // Add variant ID if present
  if (selectedVariant?.id) {
    key += `#variant:${selectedVariant.id}`;
  }
  
  // Add custom text if present to keep items with different texts separate
  if (customText && customText.trim()) {
    key += `#text:${customText.trim()}`;
  }
  
  return key;
};

// Calculate totals helper
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  return { totalItems, totalPrice };
};

// Create the cart store with persistence
export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      totalItems: 0,
      totalPrice: 0,
      suggestions: [],
      suggestionsLoading: false,
      showSuggestionToast: false,
      currentSuggestionToast: null,

      // Actions
      addItem: (item) => {
        const { quantity = 1, ...itemData } = item;
        const itemKey = getCartItemKey(itemData.id, itemData.selectedVariant, itemData.customText);
        
        set((state) => {
          const existingItemIndex = state.items.findIndex(item => 
            getCartItemKey(item.id, item.selectedVariant, item.customText) === itemKey
          );

          let newItems: CartItem[];
          
          if (existingItemIndex >= 0) {
            // Update existing item quantity
            newItems = state.items.map((item, index) => 
              index === existingItemIndex 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            );
          } else {
            // Add new item with unique cartItemId
            const cartItemId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            newItems = [...state.items, { ...itemData, quantity, cartItemId }];
          }

          const { totalItems, totalPrice } = calculateTotals(newItems);

          return {
            ...state,
            items: newItems,
            totalItems,
            totalPrice,
          };
        });
        
        // Show suggestion toast for the added item
        const addedItem = { ...itemData, quantity };
        setTimeout(() => get().showSuggestionToastFor(addedItem), 300);
      },

      removeItem: (id, selectedVariant, customText) => {
        const itemKey = getCartItemKey(id, selectedVariant, customText);
        
        set((state) => {
          const newItems = state.items.filter(item => 
            getCartItemKey(item.id, item.selectedVariant, item.customText) !== itemKey
          );

          const { totalItems, totalPrice } = calculateTotals(newItems);

          return {
            ...state,
            items: newItems,
            totalItems,
            totalPrice,
          };
        });
        
        // Refresh suggestions after removing item
        setTimeout(() => get().refreshSuggestions(), 100);
      },

      updateQuantity: (id, quantity, selectedVariant, customText) => {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          get().removeItem(id, selectedVariant, customText);
          return;
        }

        const itemKey = getCartItemKey(id, selectedVariant, customText);
        
        set((state) => {
          const newItems = state.items.map(item => 
            getCartItemKey(item.id, item.selectedVariant, item.customText) === itemKey
              ? { ...item, quantity }
              : item
          );

          const { totalItems, totalPrice } = calculateTotals(newItems);

          return {
            ...state,
            items: newItems,
            totalItems,
            totalPrice,
          };
        });
        
        // Refresh suggestions after updating quantity
        setTimeout(() => get().refreshSuggestions(), 100);
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
          suggestions: [],
          suggestionsLoading: false,
        });
      },

      refreshSuggestions: async () => {
        set((state) => ({ ...state, suggestionsLoading: true }));
        
        try {
          const suggestions = await CrossSellingService.getSuggestionsForCart(get().items);
          set((state) => ({ 
            ...state, 
            suggestions,
            suggestionsLoading: false 
          }));
        } catch (error) {
          console.error('Failed to refresh suggestions:', error);
          set((state) => ({ 
            ...state, 
            suggestionsLoading: false 
          }));
        }
      },

      dismissSuggestion: (category: string) => {
        set((state) => ({
          ...state,
          suggestions: state.suggestions.filter(s => s.category !== category)
        }));
      },

      showSuggestionToastFor: async (item: CartItem) => {
        try {
          // Create a temporary cart with just this item to get suggestions
          const tempCartItems = [item];
          const suggestions = await CrossSellingService.getSuggestionsForCart(tempCartItems);
          
          if (suggestions.length > 0) {
            // Show the first (highest priority) suggestion as toast
            const topSuggestion = suggestions[0];
            set((state) => ({
              ...state,
              currentSuggestionToast: topSuggestion,
              showSuggestionToast: true,
            }));
          }
        } catch (error) {
          console.error('Failed to show suggestion toast:', error);
        }
      },

      closeSuggestionToast: () => {
        set((state) => ({
          ...state,
          showSuggestionToast: false,
          currentSuggestionToast: null,
        }));
      },

      updateCustomText: (id: string, customText: string, selectedVariant?: { id: string }, originalCustomText?: string) => {
        const originalItemKey = getCartItemKey(id, selectedVariant, originalCustomText);
        
        set((state) => ({
          ...state,
          items: state.items.map(item => 
            getCartItemKey(item.id, item.selectedVariant, item.customText) === originalItemKey
              ? { ...item, customText }
              : item
          )
        }));
      },

      // New ID-based methods for better performance
      removeItemById: (cartItemId: string) => {
        set((state) => {
          const newItems = state.items.filter(item => item.cartItemId !== cartItemId);
          const { totalItems, totalPrice } = calculateTotals(newItems);

          return {
            ...state,
            items: newItems,
            totalItems,
            totalPrice,
          };
        });
        
        // Refresh suggestions after removing item
        setTimeout(() => get().refreshSuggestions(), 100);
      },

      updateQuantityById: (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItemById(cartItemId);
          return;
        }

        set((state) => {
          const newItems = state.items.map(item => 
            item.cartItemId === cartItemId
              ? { ...item, quantity }
              : item
          );

          const { totalItems, totalPrice } = calculateTotals(newItems);

          return {
            ...state,
            items: newItems,
            totalItems,
            totalPrice,
          };
        });
        
        // Refresh suggestions after updating quantity
        setTimeout(() => get().refreshSuggestions(), 100);
      },

      updateCustomTextById: (cartItemId: string, customText: string) => {
        set((state) => ({
          ...state,
          items: state.items.map(item => 
            item.cartItemId === cartItemId
              ? { ...item, customText }
              : item
          )
        }));
      },

      getCartItemKey: (id: string, selectedVariant?: { id: string }, customText?: string) => getCartItemKey(id, selectedVariant, customText),
    }),
    {
      name: 'avec-plaisir-cart', // localStorage key
      version: 2, // version for migrations
      // Optional: Add data migration if needed
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Migration to version 2 - Add cartItemId to existing items
          if (persistedState?.items) {
            persistedState.items = persistedState.items.map((item: any) => {
              if (!item.cartItemId) {
                item.cartItemId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              }
              return item;
            });
          }
        }
        return persistedState as CartStore;
      },
      // Optional: Customize what gets persisted
      partialize: (state) => ({
        items: state.items, // This includes customText
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
        suggestions: state.suggestions,
        // Don't persist toast state - it should be ephemeral
      }),
    }
  )
);