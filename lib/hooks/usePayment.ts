'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWalletClient } from 'wagmi';
import { getPaymentService, PaymentOptions } from '@/lib/payment';

export interface PaymentState {
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
  balance: string | null;
  address: string | null;
}

export interface PaymentResult {
  data: any;
  status: number;
  headers: any;
  paymentInfo: any;
}

export function usePayment() {
  const { data: walletClient } = useWalletClient();
  const [state, setState] = useState<PaymentState>({
    isLoading: true,
    error: null,
    isReady: false,
    balance: null,
    address: null,
  });

  const paymentService = getPaymentService();

  // Initialize payment service and get wallet info
  useEffect(() => {
    const initializePayment = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Wait for payment service to be ready
        let retries = 0;
        const maxRetries = 10;
        
        while (!paymentService.isReady() && retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 500));
          retries++;
        }

        if (!paymentService.isReady()) {
          throw new Error('Payment service failed to initialize');
        }

        const address = paymentService.getAddress();
        const balance = await paymentService.getBalance();

        setState({
          isLoading: false,
          error: null,
          isReady: true,
          balance,
          address,
        });
      } catch (error: any) {
        console.error('Payment initialization error:', error);
        setState({
          isLoading: false,
          error: error.message || 'Failed to initialize payment service',
          isReady: false,
          balance: null,
          address: null,
        });
      }
    };

    initializePayment();
  }, [walletClient]);

  // Make a payment request
  const makePaymentRequest = useCallback(
    async (
      url: string,
      options: PaymentOptions & { method?: string; data?: any; headers?: any } = {}
    ): Promise<PaymentResult> => {
      if (!state.isReady) {
        throw new Error('Payment service not ready');
      }

      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        
        const result = await paymentService.makePaymentRequest(url, options);
        
        setState(prev => ({ ...prev, isLoading: false }));
        
        return result;
      } catch (error: any) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error.message || 'Payment request failed' 
        }));
        throw error;
      }
    },
    [state.isReady, paymentService]
  );

  // Refresh balance
  const refreshBalance = useCallback(async () => {
    if (!state.isReady) return;

    try {
      const balance = await paymentService.getBalance();
      setState(prev => ({ ...prev, balance }));
    } catch (error: any) {
      console.error('Failed to refresh balance:', error);
      setState(prev => ({ 
        ...prev, 
        error: error.message || 'Failed to refresh balance' 
      }));
    }
  }, [state.isReady, paymentService]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    makePaymentRequest,
    refreshBalance,
    clearError,
  };
}
