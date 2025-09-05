'use client';

import { useState, useEffect } from 'react';
import { ProductCard } from './ProductCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Product, Recommendation } from '@/lib/types';
import { SAMPLE_PRODUCTS } from '@/lib/constants';
import { calculateRecommendationScore } from '@/lib/utils';
import { Zap, RefreshCw, Sparkles } from 'lucide-react';

interface RecommendationEngineProps {
  userId?: string;
  context?: 'in_store' | 'follow_up' | 'display';
  onInteraction?: (productId: string, type: string) => void;
}

export function RecommendationEngine({
  userId = 'demo_user',
  context = 'in_store',
  onInteraction,
}: RecommendationEngineProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [personalizedMessage, setPersonalizedMessage] = useState('');

  // Mock user preferences for demo
  const mockUserPreferences = {
    categories: ['Electronics', 'Sports & Outdoors'],
    priceRange: [20, 200] as [number, number],
    brands: ['AudioTech', 'ZenFit'],
  };

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Simulate AI recommendation generation
      await new Promise(resolve => setTimeout(resolve, 1500));

      const productRecommendations = SAMPLE_PRODUCTS.map(product => ({
        recommendationId: `rec_${product.productId}_${Date.now()}`,
        userId,
        productId: product.productId,
        score: calculateRecommendationScore(mockUserPreferences, product, []),
        reason: generateRecommendationReason(product, mockUserPreferences),
        context,
        createdAt: new Date(),
        interacted: false,
      })).sort((a, b) => b.score - a.score).slice(0, 3);

      setRecommendations(productRecommendations);
      setPersonalizedMessage(generatePersonalizedMessage(context, productRecommendations.length));
    } catch (error) {
      console.error('Failed to generate recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendationReason = (product: Product, preferences: any): string => {
    const reasons = [];
    
    if (preferences.categories.includes(product.category)) {
      reasons.push(`matches your interest in ${product.category}`);
    }
    
    if (product.price >= preferences.priceRange[0] && product.price <= preferences.priceRange[1]) {
      reasons.push('fits your budget');
    }
    
    if (preferences.brands.includes(product.brand)) {
      reasons.push(`from your preferred brand ${product.brand}`);
    }
    
    if (reasons.length === 0) {
      reasons.push('highly rated by similar customers');
    }
    
    return `Recommended because it ${reasons.join(' and ')}.`;
  };

  const generatePersonalizedMessage = (context: 'in_store' | 'follow_up' | 'display', count: number): string => {
    const messages = {
      in_store: [
        `Welcome! Based on your preferences, I found ${count} perfect items for you.`,
        `Great to see you! Here are ${count} personalized recommendations just for you.`,
        `Hello! I've curated ${count} special items that match your style.`,
      ],
      follow_up: [
        `Thanks for your recent visit! Here are ${count} items you might love.`,
        `We miss you! Check out these ${count} new arrivals picked just for you.`,
        `Based on your last purchase, here are ${count} complementary items.`,
      ],
      display: [
        `Personalized for you: ${count} trending items in your favorite categories.`,
        `Your style, your picks: ${count} curated recommendations.`,
        `Discover ${count} items tailored to your preferences.`,
      ],
    };
    
    const contextMessages = messages[context] || messages.in_store;
    return contextMessages[Math.floor(Math.random() * contextMessages.length)];
  };

  const handleProductInteraction = (productId: string, type: string) => {
    // Update recommendation interaction status
    setRecommendations(prev => 
      prev.map(rec => 
        rec.productId === productId 
          ? { ...rec, interacted: true }
          : rec
      )
    );
    
    onInteraction?.(productId, type);
  };

  useEffect(() => {
    generateRecommendations();
  }, [userId, context]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-primary to-accent rounded-full">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gradient">AI Recommendations</h2>
        </div>
        
        {personalizedMessage && (
          <p className="text-text-secondary mb-4">{personalizedMessage}</p>
        )}
        
        <Button
          variant="primary"
          onClick={generateRecommendations}
          loading={loading}
          className="mx-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {loading ? 'Generating...' : 'Refresh Recommendations'}
        </Button>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-square bg-gray-800 rounded-lg mb-4" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
                <div className="h-8 bg-gray-800 rounded w-full" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {!loading && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => {
            const product = SAMPLE_PRODUCTS.find(p => p.productId === rec.productId);
            if (!product) return null;

            return (
              <div key={rec.recommendationId} className="space-y-3">
                <ProductCard
                  product={product}
                  onInteraction={handleProductInteraction}
                  showRecommendationScore
                  recommendationScore={rec.score}
                />
                <div className="text-xs text-text-secondary bg-surface/50 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Zap className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                    <span>{rec.reason}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && recommendations.length === 0 && (
        <Card className="text-center py-12">
          <Zap className="w-12 h-12 text-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            No Recommendations Yet
          </h3>
          <p className="text-text-secondary mb-4">
            Click "Refresh Recommendations" to get personalized product suggestions.
          </p>
          <Button variant="primary" onClick={generateRecommendations}>
            Get Recommendations
          </Button>
        </Card>
      )}
    </div>
  );
}
