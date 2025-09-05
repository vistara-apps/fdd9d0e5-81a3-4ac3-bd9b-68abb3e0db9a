'use client';

import { useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { AppShell } from '@/components/layout/AppShell';
import { StoreMetrics } from '@/components/features/StoreMetrics';
import { RecommendationEngine } from '@/components/features/RecommendationEngine';
import { PaymentDemo } from '@/components/features/PaymentDemo';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Zap, ShoppingBag, Users, BarChart3, CreditCard } from 'lucide-react';

export default function HomePage() {
  const { setFrameReady } = useMiniKit();

  useEffect(() => {
    setFrameReady();
  }, [setFrameReady]);

  const handleProductInteraction = (productId: string, type: string) => {
    console.log(`Product interaction: ${productId} - ${type}`);
    // Here you would typically send this data to your analytics service
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-4 bg-gradient-to-r from-primary to-accent rounded-2xl">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient">
            Welcome to RetailRune
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Personalized on-chain shopping experiences powered by AI. 
            Transform your retail store with intelligent recommendations and customer engagement.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center group hover:scale-105">
            <div className="p-4 bg-primary/20 rounded-full w-fit mx-auto mb-4">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              AI Recommendations
            </h3>
            <p className="text-text-secondary mb-4">
              Generate personalized product recommendations for your customers
            </p>
            <Button variant="primary" size="sm">
              Generate Now
            </Button>
          </Card>

          <Card className="text-center group hover:scale-105">
            <div className="p-4 bg-accent/20 rounded-full w-fit mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Product Catalog
            </h3>
            <p className="text-text-secondary mb-4">
              Manage your product inventory and pricing
            </p>
            <Button variant="accent" size="sm">
              View Products
            </Button>
          </Card>

          <Card className="text-center group hover:scale-105">
            <div className="p-4 bg-green-400/20 rounded-full w-fit mx-auto mb-4">
              <Users className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Customer Insights
            </h3>
            <p className="text-text-secondary mb-4">
              Analyze customer behavior and preferences
            </p>
            <Button variant="secondary" size="sm">
              View Analytics
            </Button>
          </Card>
        </div>

        {/* Store Metrics */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-text-primary">Store Performance</h2>
          </div>
          <StoreMetrics />
        </div>

        {/* x402 Payment Demo */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <CreditCard className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-text-primary">x402 Payment Integration</h2>
          </div>
          <PaymentDemo
            onPaymentSuccess={(result) => {
              console.log('Payment successful:', result);
            }}
            onPaymentError={(error) => {
              console.error('Payment failed:', error);
            }}
          />
        </div>

        {/* AI Recommendations Demo */}
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold text-text-primary">Live Recommendations</h2>
          </div>
          <RecommendationEngine
            userId="demo_user"
            context="in_store"
            onInteraction={handleProductInteraction}
          />
        </div>

        {/* Feature Highlights */}
        <Card>
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            Why Choose RetailRune?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">AI-Powered Recommendations</h3>
                  <p className="text-text-secondary text-sm">
                    Advanced machine learning algorithms analyze customer behavior to provide personalized product suggestions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-accent/20 rounded-lg flex-shrink-0">
                  <ShoppingBag className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Seamless Integration</h3>
                  <p className="text-text-secondary text-sm">
                    Easy integration with existing POS systems and inventory management tools.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-400/20 rounded-lg flex-shrink-0">
                  <Users className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Customer Engagement</h3>
                  <p className="text-text-secondary text-sm">
                    Increase customer satisfaction and loyalty through personalized shopping experiences.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-400/20 rounded-lg flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">Real-time Analytics</h3>
                  <p className="text-text-secondary text-sm">
                    Track performance metrics and customer insights in real-time to optimize your strategy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
