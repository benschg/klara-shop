import React from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { 
  CheckCircle, 
  FiberManualRecord,
  Person,
  LocalShipping,
  Receipt,
  Assignment,
  CreditCard
} from '@mui/icons-material';
import type { CheckoutStep } from '../types/checkout';

interface CheckoutStepperProps {
  steps: CheckoutStep[];
  currentStep: string;
}

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ steps, currentStep }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isVerySmall = useMediaQuery(theme.breakpoints.down('sm'));

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const getStepIcon = (index: number) => {
    const step = steps[index];
    
    // Define meaningful icons for each step type
    const getStepTypeIcon = (stepId: string) => {
      switch (stepId) {
        case 'customer-info':
          return Person;
        case 'shipping-address':
          return LocalShipping;
        case 'billing-address':
          return Receipt;
        case 'payment':
          return CreditCard;
        case 'review':
          return Assignment;
        default:
          return FiberManualRecord;
      }
    };
    
    const StepIcon = getStepTypeIcon(step.id);
    
    if (step.completed) {
      return <CheckCircle color="primary" />;
    }
    
    if (step.active) {
      return <StepIcon color="primary" />;
    }
    
    return <StepIcon color="disabled" />;
  };

  const getCurrentStepTitle = () => {
    const currentStepObj = steps.find(step => step.id === currentStep);
    return currentStepObj?.title || '';
  };

  return (
    <Box sx={{ width: '100%', mb: isMobile ? 2 : 4 }}>
      {/* Mobile step indicator - show current step name when labels are hidden */}
      {isVerySmall && (
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ 
            mb: 1, 
            color: 'text.secondary',
            fontSize: '0.875rem'
          }}
        >
          Schritt {currentStepIndex + 1} von {steps.length}: {getCurrentStepTitle()}
        </Typography>
      )}
      
      <Stepper 
        activeStep={currentStepIndex} 
        orientation="horizontal" // Always horizontal for better space efficiency
        sx={{
          '& .MuiStep-root': {
            '& .MuiStepLabel-root': {
              cursor: 'default',
              // Reduce padding on mobile
              ...(isMobile && {
                padding: '8px 4px',
              }),
            },
          },
          // Ensure connectors are visible and properly styled
          '& .MuiStepConnector-root': {
            '& .MuiStepConnector-line': {
              borderColor: theme.palette.divider,
              borderTopWidth: 2,
            },
            // Adjust connector positioning for mobile
            ...(isMobile && {
              marginLeft: '-8px',
              marginRight: '8px',
            }),
          },
          '& .MuiStepConnector-active .MuiStepConnector-line': {
            borderColor: theme.palette.primary.main,
          },
          '& .MuiStepConnector-completed .MuiStepConnector-line': {
            borderColor: theme.palette.primary.main,
          },
          // Reduce stepper padding on mobile
          ...(isMobile && {
            padding: '8px 0',
          }),
        }}
      >
        {steps.map((step, index) => (
          <Step key={step.id} completed={step.completed}>
            <StepLabel
              icon={getStepIcon(index)}
              sx={{
                // Stack icon above label for better space usage
                flexDirection: 'column',
                '& .MuiStepLabel-iconContainer': {
                  marginRight: 0,
                  marginBottom: isVerySmall ? 0 : '4px',
                  // Smaller icons on mobile
                  ...(isMobile && {
                    '& svg': {
                      fontSize: isVerySmall ? '1.25rem' : '1.5rem',
                    },
                  }),
                },
                '& .MuiStepLabel-labelContainer': {
                  '& .MuiStepLabel-label': {
                    color: step.active 
                      ? theme.palette.primary.main 
                      : step.completed 
                      ? theme.palette.text.primary 
                      : theme.palette.text.disabled,
                    fontWeight: step.active ? 600 : 400,
                    // Make text smaller and hide on very small screens
                    fontSize: isVerySmall ? '0.75rem' : isMobile ? '0.875rem' : '1rem',
                    textAlign: 'center',
                    // Hide text on very small screens, show only icons
                    ...(isVerySmall && {
                      display: 'none',
                    }),
                  },
                },
              }}
            >
              {isVerySmall ? '' : step.title} {/* Hide labels on very small screens */}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};