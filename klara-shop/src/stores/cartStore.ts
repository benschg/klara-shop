import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

// Cart store actions
interface CartActions {
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string, selectedVariant?: { id: string }) => void;
  updateQuantity: (id: string, quantity: number, selectedVariant?: { id: string }) => void;
  clearCart: () => void;
  getCartItemKey: (id: string, selectedVariant?: { id: string }) => string;
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
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
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
      }),
    }
  )
);