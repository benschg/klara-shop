import React from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, FiberManualRecord } from '@mui/icons-material';
import type { CheckoutStep } from '../types/checkout';

interface CheckoutStepperProps {
  steps: CheckoutStep[];
  currentStep: string;
}

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ steps, currentStep }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  const getStepIcon = (index: number) => {
    const step = steps[index];
    
    if (step.completed) {
      return <CheckCircle color="primary" />;
    }
    
    if (step.active) {
      return <FiberManualRecord color="primary" />;
    }
    
    return <RadioButtonUnchecked color="disabled" />;
  };

  return (
    <Box sx={{ width: '100%', mb: 4 }}>
      <Stepper 
        activeStep={currentStepIndex} 
        orientation={isMobile ? 'vertical' : 'horizontal'}
        sx={{
          '& .MuiStep-root': {
            '& .MuiStepLabel-root': {
              cursor: 'default',
            },
          },
        }}
      >
        {steps.map((step, index) => (
          <Step key={step.id} completed={step.completed}>
            <StepLabel
              icon={getStepIcon(index)}
              sx={{
                '& .MuiStepLabel-label': {
                  color: step.active 
                    ? theme.palette.primary.main 
                    : step.completed 
                    ? theme.palette.text.primary 
                    : theme.palette.text.disabled,
                  fontWeight: step.active ? 600 : 400,
                },
              }}
            >
              {step.title}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};