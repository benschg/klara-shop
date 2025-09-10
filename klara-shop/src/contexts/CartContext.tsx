import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Cart item type
export type CartItem = {
  id: string;
  articleNumber: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  selectedOptions?: Record<string, string>;
};

// Cart state
type CartState = {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
};

// Cart actions
type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string; selectedOptions?: Record<string, string> } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number; selectedOptions?: Record<string, string> } }
  | { type: 'CLEAR_CART' };

// Cart context type
type CartContextType = {
  state: CartState;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: string, selectedOptions?: Record<string, string>) => void;
  updateQuantity: (id: string, quantity: number, selectedOptions?: Record<string, string>) => void;
  clearCart: () => void;
  getCartItemKey: (id: string, selectedOptions?: Record<string, string>) => string;
};

// Create a unique key for cart items based on id and selected options
const getCartItemKey = (id: string, selectedOptions?: Record<string, string>): string => {
  if (!selectedOptions || Object.keys(selectedOptions).length === 0) {
    return id;
  }
  const optionsKey = Object.entries(selectedOptions)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
  return `${id}#${optionsKey}`;
};

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { quantity = 1, ...itemData } = action.payload;
      const itemKey = getCartItemKey(itemData.id, itemData.selectedOptions);
      
      const existingItemIndex = state.items.findIndex(item => 
        getCartItemKey(item.id, item.selectedOptions) === itemKey
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

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case 'REMOVE_ITEM': {
      const itemKey = getCartItemKey(action.payload.id, action.payload.selectedOptions);
      const newItems = state.items.filter(item => 
        getCartItemKey(item.id, item.selectedOptions) !== itemKey
      );

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case 'UPDATE_QUANTITY': {
      const itemKey = getCartItemKey(action.payload.id, action.payload.selectedOptions);
      
      if (action.payload.quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: action.payload });
      }

      const newItems = state.items.map(item => 
        getCartItemKey(item.id, item.selectedOptions) === itemKey
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      const totalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      return {
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider component
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string, selectedOptions?: Record<string, string>) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id, selectedOptions } });
  };

  const updateQuantity = (id: string, quantity: number, selectedOptions?: Record<string, string>) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity, selectedOptions } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const contextValue: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartItemKey,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};