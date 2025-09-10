export interface Address {
  firstName: string;
  lastName: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface CheckoutData {
  customerInfo: {
    email: string;
    phone: string;
  };
  shippingAddress: Address;
  billingAddress: Address;
  useSameAddressForBilling: boolean;
  deliveryNotes?: string;
}

export interface CheckoutStep {
  id: string;
  title: string;
  completed: boolean;
  active: boolean;
}

export type CheckoutStepId = 'customer-info' | 'shipping-address' | 'billing-address' | 'review' | 'payment';

export interface CheckoutFormErrors {
  customerInfo?: {
    email?: string;
    phone?: string;
  };
  shippingAddress?: Partial<Record<keyof Address, string>>;
  billingAddress?: Partial<Record<keyof Address, string>>;
  deliveryNotes?: string;
}

export interface CheckoutState extends CheckoutData {
  currentStep: CheckoutStepId;
  steps: CheckoutStep[];
  errors: CheckoutFormErrors;
  isSubmitting: boolean;
}