import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CheckoutState, CheckoutStepId, Address, CheckoutFormErrors } from '../types/checkout';

interface CheckoutActions {
  // Navigation
  setCurrentStep: (step: CheckoutStepId) => void;
  nextStep: () => void;
  previousStep: () => void;
  
  // Customer Info
  setCustomerInfo: (email: string, phone: string) => void;
  
  // Addresses
  setShippingAddress: (address: Address) => void;
  setBillingAddress: (address: Address) => void;
  toggleSameAddress: () => void;
  
  // Delivery notes
  setDeliveryNotes: (notes: string) => void;
  
  // Validation and errors
  setErrors: (errors: CheckoutFormErrors) => void;
  clearErrors: () => void;
  validateCurrentStep: () => boolean;
  
  // Form submission
  setSubmitting: (isSubmitting: boolean) => void;
  
  // Reset
  resetCheckout: () => void;
}

type CheckoutStore = CheckoutState & CheckoutActions;

const initialAddress: Address = {
  firstName: '',
  lastName: '',
  street: '',
  houseNumber: '',
  postalCode: '',
  city: '',
  country: 'Switzerland',
};

const checkoutSteps = [
  { id: 'customer-info', title: 'Kontaktdaten', completed: false, active: true },
  { id: 'shipping-address', title: 'Versandadresse', completed: false, active: false },
  { id: 'billing-address', title: 'Rechnungsadresse', completed: false, active: false },
  { id: 'review', title: 'Übersicht', completed: false, active: false },
  { id: 'payment', title: 'Bezahlung', completed: false, active: false },
];

const initialState: CheckoutState = {
  currentStep: 'customer-info',
  steps: checkoutSteps,
  customerInfo: {
    email: '',
    phone: '',
  },
  shippingAddress: { ...initialAddress },
  billingAddress: { ...initialAddress },
  useSameAddressForBilling: true,
  deliveryNotes: '',
  errors: {},
  isSubmitting: false,
};

// Validation functions
const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) return 'E-Mail ist erforderlich';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Ungültige E-Mail-Adresse';
  return undefined;
};

const validatePhone = (phone: string): string | undefined => {
  // Phone is now optional - only validate if provided
  if (!phone.trim()) return undefined;
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) return 'Ungültige Telefonnummer';
  return undefined;
};

const validateAddress = (address: Address): Partial<Record<keyof Address, string>> => {
  const errors: Partial<Record<keyof Address, string>> = {};
  
  if (!address.firstName.trim()) errors.firstName = 'Vorname ist erforderlich';
  if (!address.lastName.trim()) errors.lastName = 'Nachname ist erforderlich';
  if (!address.street.trim()) errors.street = 'Straße ist erforderlich';
  if (!address.houseNumber.trim()) errors.houseNumber = 'Hausnummer ist erforderlich';
  if (!address.postalCode.trim()) errors.postalCode = 'PLZ ist erforderlich';
  if (!address.city.trim()) errors.city = 'Stadt ist erforderlich';
  if (!address.country.trim()) errors.country = 'Land ist erforderlich';
  
  // Swiss postal code validation
  if (address.country === 'Switzerland' && address.postalCode) {
    const swissPostalRegex = /^\d{4}$/;
    if (!swissPostalRegex.test(address.postalCode)) {
      errors.postalCode = 'Schweizer PLZ muss 4 Ziffern haben';
    }
  }
  
  return errors;
};

export const useCheckoutStore = create<CheckoutStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Navigation
      setCurrentStep: (step: CheckoutStepId) => {
        set((state) => {
          const steps = state.steps.map((s) => ({
            ...s,
            active: s.id === step,
          }));
          return { ...state, currentStep: step, steps };
        });
      },

      nextStep: () => {
        const state = get();
        const currentIndex = state.steps.findIndex(s => s.id === state.currentStep);
        if (currentIndex < state.steps.length - 1) {
          const nextStep = state.steps[currentIndex + 1];
          get().setCurrentStep(nextStep.id as CheckoutStepId);
          
          // Mark current step as completed
          set((state) => {
            const steps = state.steps.map((s, index) => 
              index === currentIndex ? { ...s, completed: true } : s
            );
            return { ...state, steps };
          });
        }
      },

      previousStep: () => {
        const state = get();
        const currentIndex = state.steps.findIndex(s => s.id === state.currentStep);
        if (currentIndex > 0) {
          const prevStep = state.steps[currentIndex - 1];
          get().setCurrentStep(prevStep.id as CheckoutStepId);
        }
      },

      // Customer Info
      setCustomerInfo: (email: string, phone: string) => {
        set((state) => ({
          ...state,
          customerInfo: { email, phone },
        }));
      },

      // Addresses
      setShippingAddress: (address: Address) => {
        set((state) => {
          const newState = { ...state, shippingAddress: address };
          // If using same address, update billing too
          if (state.useSameAddressForBilling) {
            newState.billingAddress = address;
          }
          return newState;
        });
      },

      setBillingAddress: (address: Address) => {
        set((state) => ({
          ...state,
          billingAddress: address,
        }));
      },

      toggleSameAddress: () => {
        set((state) => {
          const useSameAddress = !state.useSameAddressForBilling;
          return {
            ...state,
            useSameAddressForBilling: useSameAddress,
            billingAddress: useSameAddress ? state.shippingAddress : state.billingAddress,
          };
        });
      },

      // Delivery notes
      setDeliveryNotes: (notes: string) => {
        set((state) => ({
          ...state,
          deliveryNotes: notes,
        }));
      },

      // Validation and errors
      setErrors: (errors: CheckoutFormErrors) => {
        set((state) => ({ ...state, errors }));
      },

      clearErrors: () => {
        set((state) => ({ ...state, errors: {} }));
      },

      validateCurrentStep: () => {
        const state = get();
        const errors: CheckoutFormErrors = {};

        switch (state.currentStep) {
          case 'customer-info': {
            const emailError = validateEmail(state.customerInfo.email);
            const phoneError = validatePhone(state.customerInfo.phone);
            
            if (emailError || phoneError) {
              errors.customerInfo = {
                email: emailError,
                phone: phoneError,
              };
            }
            break;
          }

          case 'shipping-address': {
            const addressErrors = validateAddress(state.shippingAddress);
            if (Object.keys(addressErrors).length > 0) {
              errors.shippingAddress = addressErrors;
            }
            break;
          }

          case 'billing-address': {
            if (!state.useSameAddressForBilling) {
              const addressErrors = validateAddress(state.billingAddress);
              if (Object.keys(addressErrors).length > 0) {
                errors.billingAddress = addressErrors;
              }
            }
            break;
          }

          default:
            break;
        }

        const hasErrors = Object.keys(errors).length > 0;
        if (hasErrors) {
          get().setErrors(errors);
        } else {
          get().clearErrors();
        }

        return !hasErrors;
      },

      // Form submission
      setSubmitting: (isSubmitting: boolean) => {
        set((state) => ({ ...state, isSubmitting }));
      },

      // Reset
      resetCheckout: () => {
        set({ ...initialState });
      },
    }),
    {
      name: 'avec-plaisir-checkout',
      version: 1,
      partialize: (state) => ({
        customerInfo: state.customerInfo,
        shippingAddress: state.shippingAddress,
        billingAddress: state.billingAddress,
        useSameAddressForBilling: state.useSameAddressForBilling,
        deliveryNotes: state.deliveryNotes,
        currentStep: state.currentStep,
      }),
    }
  )
);