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
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string, selectedVariant?: { id: string }) => void;
  updateQuantity: (id: string, quantity: number, selectedVariant?: { id: string }) => void;
  clearCart: () => void;
  getCartItemKey: (id: string, selectedVariant?: { id: string }) => string;
  refreshSuggestions: () => Promise<void>;
  dismissSuggestion: (category: string) => void;
  showSuggestionToastFor: (item: CartItem) => Promise<void>;
  closeSuggestionToast: () => void;
}

// Combined cart store type
type CartStore = CartState & CartActions;

// Create a unique key for cart items based on id and variant
const getCartItemKey = (id: string, selectedVariant?: { id: string }): string => {
  let key = id;
  
  // Add variant ID if present
  if (selectedVariant?.id) {
    key += `#variant:${selectedVariant.id}`;
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
        const itemKey = getCartItemKey(itemData.id, itemData.selectedVariant);
        
        set((state) => {
          const existingItemIndex = state.items.findIndex(item => 
            getCartItemKey(item.id, item.selectedVariant) === itemKey
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
            // Add new item
            newItems = [...state.items, { ...itemData, quantity }];
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

      removeItem: (id, selectedVariant) => {
        const itemKey = getCartItemKey(id, selectedVariant);
        
        set((state) => {
          const newItems = state.items.filter(item => 
            getCartItemKey(item.id, item.selectedVariant) !== itemKey
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

      updateQuantity: (id, quantity, selectedVariant) => {
        if (quantity <= 0) {
          // Remove item if quantity is 0 or negative
          get().removeItem(id, selectedVariant);
          return;
        }

        const itemKey = getCartItemKey(id, selectedVariant);
        
        set((state) => {
          const newItems = state.items.map(item => 
            getCartItemKey(item.id, item.selectedVariant) === itemKey
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

      getCartItemKey,
    }),
    {
      name: 'avec-plaisir-cart', // localStorage key
      version: 1, // version for migrations
      // Optional: Add data migration if needed
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          // Add any necessary data transformations here
        }
        return persistedState as CartStore;
      },
      // Optional: Customize what gets persisted
      partialize: (state) => ({
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
        suggestions: state.suggestions,
        // Don't persist toast state - it should be ephemeral
      }),
    }
  )
);