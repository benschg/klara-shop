import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { Toast } from '../components/Toast';

interface ToastData {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  productImage?: string;
  productName?: string;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  showCartSuccessToast: (message: string, productName?: string, productImage?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [currentToast, setCurrentToast] = useState<ToastData | null>(null);

  const showToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Date.now().toString();
    setCurrentToast({ ...toast, id });
  };

  const showCartSuccessToast = (message: string, productName?: string, productImage?: string) => {
    showToast({
      message,
      type: 'success',
      productName,
      productImage,
      duration: 4000,
    });
  };

  const handleCloseToast = () => {
    setCurrentToast(null);
  };

  const contextValue: ToastContextType = {
    showToast,
    showCartSuccessToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {currentToast && (
        <Toast
          open={true}
          message={currentToast.message}
          type={currentToast.type}
          duration={currentToast.duration}
          onClose={handleCloseToast}
          productImage={currentToast.productImage}
          productName={currentToast.productName}
        />
      )}
    </ToastContext.Provider>
  );
};