import { CdpClient } from '@coinbase/cdp-sdk';
import { toAccount } from 'viem/accounts';
import { createWalletClient, createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { withPaymentInterceptor } from 'x402-axios';
import axios from 'axios';

// Payment configuration
export const PAYMENT_CONFIG = {
  // Use Base Sepolia for testing, Base mainnet for production
  chain: process.env.NODE_ENV === 'production' ? base : baseSepolia,
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.base.org',
  // USDC contract addresses
  usdcAddress: {
    [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base mainnet
    [baseSepolia.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
  },
};

export interface PaymentOptions {
  maxAmount?: string; // Maximum amount willing to pay (in USDC)
  timeout?: number; // Request timeout in milliseconds
}

export class X402PaymentService {
  private account: any;
  private axiosWithPayment: any;

  constructor() {
    this.initializeWallet();
  }

  private async initializeWallet() {
    try {
      // Try to use CDP SDK first (recommended)
      if (process.env.CDP_API_KEY_ID && process.env.CDP_API_KEY_SECRET) {
        const cdp = new CdpClient();
        const cdpAccount = await cdp.evm.createAccount();
        this.account = toAccount(cdpAccount);
      } else {
        // Fallback to private key if available
        if (process.env.PRIVATE_KEY) {
          const { privateKeyToAccount } = await import('viem/accounts');
          this.account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
        } else {
          console.warn('No wallet configuration found. Payment functionality will be limited.');
          return;
        }
      }

      // Create axios instance with x402 payment interceptor
      this.axiosWithPayment = axios.create();
      withPaymentInterceptor(this.axiosWithPayment, this.account);

      console.log('X402 Payment Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize X402 Payment Service:', error);
      throw error;
    }
  }

  /**
   * Make a paid request using x402 protocol
   */
  async makePaymentRequest(
    url: string,
    options: PaymentOptions & { method?: string; data?: any; headers?: any } = {}
  ) {
    if (!this.axiosWithPayment) {
      throw new Error('Payment service not initialized. Please check wallet configuration.');
    }

    const { maxAmount = '1.00', timeout = 30000, method = 'GET', data, headers } = options;

    try {
      console.log(`Making x402 payment request to: ${url}`);
      
      const response = await this.axiosWithPayment({
        url,
        method,
        data,
        headers,
        timeout,
        maxAmount,
      });

      // Extract payment response information
      const paymentResponse = response.headers['x-payment-response'];
      if (paymentResponse) {
        console.log('Payment completed:', JSON.parse(paymentResponse));
      }

      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
        paymentInfo: paymentResponse ? JSON.parse(paymentResponse) : null,
      };
    } catch (error: any) {
      console.error('Payment request failed:', error);
      
      // Handle specific x402 errors
      if (error.response?.status === 402) {
        throw new Error(`Payment required: ${error.response.data?.message || 'Payment failed'}`);
      }
      
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient USDC balance for payment');
      }
      
      if (error.code === 'PAYMENT_TIMEOUT') {
        throw new Error('Payment request timed out');
      }
      
      throw error;
    }
  }

  /**
   * Get wallet balance (USDC)
   */
  async getBalance(): Promise<string> {
    if (!this.account) {
      throw new Error('Wallet not initialized');
    }

    try {
      const publicClient = createPublicClient({
        chain: PAYMENT_CONFIG.chain,
        transport: http(PAYMENT_CONFIG.rpcUrl),
      });

      // Get ETH balance (simplified for demo)
      // In a real implementation, you'd want to query USDC balance using ERC-20 contract
      const balance = await publicClient.getBalance({
        address: this.account.address,
      });

      return balance.toString();
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }

  /**
   * Get wallet address
   */
  getAddress(): string {
    if (!this.account) {
      throw new Error('Wallet not initialized');
    }
    return this.account.address;
  }

  /**
   * Check if payment service is ready
   */
  isReady(): boolean {
    return !!this.account && !!this.axiosWithPayment;
  }
}

// Singleton instance
let paymentService: X402PaymentService | null = null;

export function getPaymentService(): X402PaymentService {
  if (!paymentService) {
    paymentService = new X402PaymentService();
  }
  return paymentService;
}

// Test endpoints for x402 payment flow
export const TEST_ENDPOINTS = {
  // Local test endpoint for development
  basicPayment: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/x402/test`,
  // These are example endpoints - replace with actual x402-enabled services
  premiumContent: 'https://api.example.com/x402/premium',
  aiRecommendations: 'https://api.example.com/x402/ai-recommendations',
};
