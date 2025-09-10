import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Divider,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import { Close, ShoppingCart } from '@mui/icons-material';
import { CheckoutStepper } from './CheckoutStepper';
import { CustomerInfoForm } from './CustomerInfoForm';
import { AddressFormWithAutocomplete } from './AddressFormWithAutocomplete';
import { useCheckoutStore } from '../stores/checkoutStore';
import { useCartStore } from '../stores/cartStore';
import { useBranding } from '../contexts/BrandingContext';

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
}

export const CheckoutDialog: React.FC<CheckoutDialogProps> = ({ open, onClose }) => {
  const { branding } = useBranding();
  const { items, totalPrice, clearCart } = useCartStore();
  const {
    currentStep,
    steps,
    customerInfo,
    shippingAddress,
    billingAddress,
    useSameAddressForBilling,
    deliveryNotes,
    errors,
    isSubmitting,
    setCurrentStep,
    nextStep,
    previousStep,
    setCustomerInfo,
    setShippingAddress,
    setBillingAddress,
    toggleSameAddress,
    setDeliveryNotes,
    validateCurrentStep,
    setSubmitting,
    resetCheckout,
  } = useCheckoutStore();

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  const handleBack = () => {
    previousStep();
  };

  const handleClose = () => {
    resetCheckout();
    onClose();
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    
    // Simulate order processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here would be the actual order submission logic
      console.log('Order placed:', {
        items,
        customerInfo,
        shippingAddress,
        billingAddress: useSameAddressForBilling ? shippingAddress : billingAddress,
        deliveryNotes,
        totalPrice,
      });
      
      // Clear cart and reset checkout
      clearCart();
      resetCheckout();
      onClose();
      
      // Show success message (you might want to show a success dialog instead)
      alert('Bestellung erfolgreich aufgegeben! Sie erhalten eine Bestätigung per E-Mail.');
      
    } catch (error) {
      console.error('Order submission failed:', error);
      alert('Fehler beim Aufgeben der Bestellung. Bitte versuchen Sie es erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'customer-info':
        return customerInfo.email.trim() !== ''; // Only email is required
      case 'shipping-address':
        return Object.values(shippingAddress).every(value => value.trim() !== '');
      case 'billing-address':
        return useSameAddressForBilling || Object.values(billingAddress).every(value => value.trim() !== '');
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'customer-info':
        return (
          <CustomerInfoForm
            email={customerInfo.email}
            phone={customerInfo.phone}
            onChange={(field, value) => {
              if (field === 'email') {
                setCustomerInfo(value, customerInfo.phone);
              } else {
                setCustomerInfo(customerInfo.email, value);
              }
            }}
            errors={errors.customerInfo}
          />
        );

      case 'shipping-address':
        return (
          <AddressFormWithAutocomplete
            address={shippingAddress}
            onChange={setShippingAddress}
            errors={errors.shippingAddress}
            title="Versandadresse"
          />
        );

      case 'billing-address':
        return (
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={useSameAddressForBilling}
                  onChange={toggleSameAddress}
                  color="primary"
                />
              }
              label="Rechnungsadresse ist dieselbe wie Versandadresse"
              sx={{ mb: 2 }}
            />
            
            {!useSameAddressForBilling && (
              <AddressFormWithAutocomplete
                address={billingAddress}
                onChange={setBillingAddress}
                errors={errors.billingAddress}
                title="Rechnungsadresse"
              />
            )}
          </Box>
        );

      case 'review':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Bestellübersicht
            </Typography>
            
            {/* Order Items */}
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShoppingCart fontSize="small" />
                Ihre Artikel ({items.length})
              </Typography>
              
              <List dense>
                {items.map((item) => (
                  <ListItem key={`${item.id}-${JSON.stringify(item.selectedOptions)}`} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        src={item.imageUrl}
                        alt={item.name}
                        sx={{ width: 40, height: 40 }}
                      >
                        <ShoppingCart />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Menge: {item.quantity} × CHF {item.price.toFixed(2)}
                          </Typography>
                          {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              {Object.entries(item.selectedOptions)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(', ')}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                    <Typography variant="body1" fontWeight="medium">
                      CHF {(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Gesamtsumme
                </Typography>
                <Typography variant="h6" color="primary">
                  CHF {totalPrice.toFixed(2)}
                </Typography>
              </Box>
            </Paper>

            {/* Customer Info Summary */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Kontaktdaten
              </Typography>
              <Typography variant="body2">E-Mail: {customerInfo.email}</Typography>
              <Typography variant="body2">Telefon: {customerInfo.phone}</Typography>
            </Paper>

            {/* Address Summary */}
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Versandadresse
              </Typography>
              <Typography variant="body2">
                {shippingAddress.firstName} {shippingAddress.lastName}<br />
                {shippingAddress.street} {shippingAddress.houseNumber}<br />
                {shippingAddress.postalCode} {shippingAddress.city}<br />
                {shippingAddress.country}
              </Typography>
              
              {!useSameAddressForBilling && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Rechnungsadresse
                  </Typography>
                  <Typography variant="body2">
                    {billingAddress.firstName} {billingAddress.lastName}<br />
                    {billingAddress.street} {billingAddress.houseNumber}<br />
                    {billingAddress.postalCode} {billingAddress.city}<br />
                    {billingAddress.country}
                  </Typography>
                </>
              )}
            </Paper>

            {/* Delivery Notes */}
            <TextField
              fullWidth
              label="Lieferhinweise (optional)"
              multiline
              rows={3}
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Besondere Anweisungen für die Lieferung..."
              variant="outlined"
              sx={{ mb: 2 }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {branding?.logo?.showIcon && (
            <img 
              src={branding.logo.icon} 
              alt="Logo" 
              style={{ height: '24px', width: 'auto' }} 
            />
          )}
          <Typography variant="h6">
            Kasse
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <CheckoutStepper steps={steps} currentStep={currentStep} />
        {renderCurrentStep()}
      </DialogContent>

      <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
        <Button
          onClick={handleBack}
          disabled={currentStep === 'customer-info' || isSubmitting}
          variant="outlined"
        >
          Zurück
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {currentStep === 'review' ? (
            <Button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              variant="contained"
              size="large"
              color="primary"
            >
              {isSubmitting ? 'Wird bearbeitet...' : `Bestellen - CHF ${totalPrice.toFixed(2)}`}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              variant="contained"
              size="large"
            >
              Weiter
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};