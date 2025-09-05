'use client';

import { useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { AppShell } from '@/components/layout/AppShell';
import { StoreMetrics } from '@/components/features/StoreMetrics';
import { RecommendationEngine } from '@/components/features/RecommendationEngine';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Zap, ShoppingBag, Users, BarChart3 } from 'lucide-react';

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
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-4 bg-gradient-to-r from-primary to-accent rounded-2xl shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-heading-1 text-gradient mb-4">
            Welcome to RetailRune
          </h1>
          <p className="text-body-large text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Personalized on-chain shopping experiences powered by AI. 
            Transform your retail store with intelligent recommendations and customer engagement.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center group hover:scale-105 transition-all duration-300 hover:shadow-lg">
            <div className="p-4 bg-primary/20 rounded-full w-fit mx-auto mb-6 group-hover:bg-primary/30 transition-colors">
              <Zap className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-heading-4 text-text-primary mb-3">
              AI Recommendations
            </h3>
            <p className="text-body-small text-text-secondary mb-6 leading-relaxed">
              Generate personalized product recommendations for your customers using advanced AI algorithms
            </p>
            <Button variant="primary" size="sm" className="w-full">
              Generate Now
            </Button>
          </Card>

          <Card className="text-center group hover:scale-105 transition-all duration-300 hover:shadow-lg">
            <div className="p-4 bg-accent/20 rounded-full w-fit mx-auto mb-6 group-hover:bg-accent/30 transition-colors">
              <ShoppingBag className="w-8 h-8 text-accent group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-heading-4 text-text-primary mb-3">
              Product Catalog
            </h3>
            <p className="text-body-small text-text-secondary mb-6 leading-relaxed">
              Manage your product inventory, pricing, and availability with our intuitive dashboard
            </p>
            <Button variant="accent" size="sm" className="w-full">
              View Products
            </Button>
          </Card>

          <Card className="text-center group hover:scale-105 transition-all duration-300 hover:shadow-lg">
            <div className="p-4 bg-success/20 rounded-full w-fit mx-auto mb-6 group-hover:bg-success/30 transition-colors">
              <Users className="w-8 h-8 text-success group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-heading-4 text-text-primary mb-3">
              Customer Insights
            </h3>
            <p className="text-body-small text-text-secondary mb-6 leading-relaxed">
              Analyze customer behavior patterns and preferences to optimize your retail strategy
            </p>
            <Button variant="secondary" size="sm" className="w-full">
              View Analytics
            </Button>
          </Card>
        </div>

        {/* Store Metrics */}
        <section>
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-primary/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-heading-2 text-text-primary">Store Performance</h2>
              <p className="text-body-small text-text-secondary">Real-time metrics and insights</p>
            </div>
          </div>
          <StoreMetrics />
        </section>

        {/* AI Recommendations Demo */}
        <section>
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-accent/20 rounded-lg">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h2 className="text-heading-2 text-text-primary">Live Recommendations</h2>
              <p className="text-body-small text-text-secondary">AI-powered product suggestions</p>
            </div>
          </div>
          <RecommendationEngine
            userId="demo_user"
            context="in_store"
            onInteraction={handleProductInteraction}
          />
        </section>

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
