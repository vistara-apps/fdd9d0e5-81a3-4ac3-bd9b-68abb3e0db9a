'use client';

import { useState } from 'react';
import { usePayment } from '@/lib/hooks/usePayment';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CreditCard, Wallet, CheckCircle, XCircle, RefreshCw, DollarSign } from 'lucide-react';
import { TEST_ENDPOINTS } from '@/lib/payment';

interface PaymentDemoProps {
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: string) => void;
}

export function PaymentDemo({ onPaymentSuccess, onPaymentError }: PaymentDemoProps) {
  const {
    isLoading,
    error,
    isReady,
    balance,
    address,
    makePaymentRequest,
    refreshBalance,
    clearError,
  } = usePayment();

  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  // Test different x402 payment scenarios
  const runPaymentTest = async (testName: string, url: string, options: any = {}) => {
    setCurrentTest(testName);
    clearError();

    try {
      const startTime = Date.now();
      const result = await makePaymentRequest(url, options);
      const duration = Date.now() - startTime;

      const testResult = {
        name: testName,
        success: true,
        duration,
        status: result.status,
        paymentInfo: result.paymentInfo,
        timestamp: new Date().toISOString(),
      };

      setTestResults(prev => [testResult, ...prev]);
      onPaymentSuccess?.(result);
    } catch (err: any) {
      const testResult = {
        name: testName,
        success: false,
        error: err.message,
        timestamp: new Date().toISOString(),
      };

      setTestResults(prev => [testResult, ...prev]);
      onPaymentError?.(err.message);
    } finally {
      setCurrentTest(null);
    }
  };

  // Test scenarios
  const testScenarios = [
    {
      name: 'Basic Payment Test',
      description: 'Test basic x402 payment flow with $0.01 USDC',
      url: TEST_ENDPOINTS.basicPayment,
      options: { maxAmount: '0.01' },
    },
    {
      name: 'Premium Content Access',
      description: 'Access premium content for $0.05 USDC',
      url: TEST_ENDPOINTS.premiumContent,
      options: { maxAmount: '0.05' },
    },
    {
      name: 'AI Recommendations',
      description: 'Get AI-powered recommendations for $0.10 USDC',
      url: TEST_ENDPOINTS.aiRecommendations,
      options: { 
        maxAmount: '0.10',
        method: 'POST',
        data: { userId: 'demo_user', context: 'retail' }
      },
    },
  ];

  if (!isReady && !error) {
    return (
      <Card className="text-center p-8">
        <RefreshCw className="w-8 h-8 text-primary mx-auto mb-4 animate-spin" />
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          Initializing Payment Service
        </h3>
        <p className="text-text-secondary">
          Setting up x402 payment flow with wagmi and USDC on Base...
        </p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/5">
        <div className="flex items-start space-x-3">
          <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Payment Service Error
            </h3>
            <p className="text-red-300 mb-4">{error}</p>
            <div className="space-y-2 text-sm text-red-200">
              <p>• Ensure you have USDC on Base Sepolia for testing</p>
              <p>• Check your wallet connection and network</p>
              <p>• Verify environment variables are set correctly</p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearError}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wallet Status */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-text-primary flex items-center space-x-2">
            <Wallet className="w-5 h-5 text-primary" />
            <span>Wallet Status</span>
          </h3>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Connected</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-text-secondary mb-1">Address</p>
            <p className="text-sm font-mono text-text-primary break-all">
              {address}
            </p>
          </div>
          <div>
            <p className="text-sm text-text-secondary mb-1">Balance</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-mono text-text-primary">
                {balance ? `${balance} ETH` : 'Loading...'}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshBalance}
                disabled={isLoading}
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Tests */}
      <Card>
        <div className="flex items-center space-x-2 mb-6">
          <CreditCard className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-semibold text-text-primary">
            x402 Payment Flow Tests
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {testScenarios.map((scenario, index) => (
            <Card key={index} variant="default" className="p-4">
              <div className="flex items-start space-x-3">
                <DollarSign className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-text-primary mb-2">
                    {scenario.name}
                  </h4>
                  <p className="text-sm text-text-secondary mb-4">
                    {scenario.description}
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => runPaymentTest(scenario.name, scenario.url, scenario.options)}
                    disabled={isLoading || currentTest === scenario.name}
                    className="w-full"
                  >
                    {currentTest === scenario.name ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Run Test'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Test Results</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success
                      ? 'border-green-500/20 bg-green-500/5'
                      : 'border-red-500/20 bg-red-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {result.success ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className="font-medium text-text-primary">
                        {result.name}
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {result.success ? (
                    <div className="text-sm space-y-1">
                      <p className="text-green-300">
                        ✅ Payment completed in {result.duration}ms
                      </p>
                      {result.paymentInfo && (
                        <p className="text-text-secondary">
                          Transaction: {result.paymentInfo.transactionHash?.slice(0, 10)}...
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-red-300">
                      ❌ {result.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Implementation Notes */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <h4 className="font-semibold text-blue-400 mb-3">Implementation Notes</h4>
        <div className="space-y-2 text-sm text-blue-200">
          <p>✅ Using wagmi useWalletClient for wallet integration</p>
          <p>✅ x402-axios wrapper for automatic payment handling</p>
          <p>✅ USDC on Base Sepolia for testing (Base mainnet for production)</p>
          <p>✅ Transaction confirmation and error handling</p>
          <p>✅ End-to-end payment flow verification</p>
        </div>
      </Card>
    </div>
  );
}
