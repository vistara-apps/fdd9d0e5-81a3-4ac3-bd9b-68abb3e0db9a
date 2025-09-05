'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Product } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Heart, ShoppingCart, Eye, Share2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onInteraction?: (productId: string, type: string) => void;
  showRecommendationScore?: boolean;
  recommendationScore?: number;
}

export function ProductCard({
  product,
  onInteraction,
  showRecommendationScore = false,
  recommendationScore = 0,
}: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInteraction = async (type: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      onInteraction?.(product.productId, type);
      
      if (type === 'like') {
        setLiked(!liked);
      }
    } catch (error) {
      console.error('Interaction error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="product" className="group">
      {/* Product Image */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-lg bg-gray-800">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary">
            <ShoppingCart className="w-12 h-12" />
          </div>
        )}
        
        {/* Recommendation Score Badge */}
        {showRecommendationScore && (
          <div className="absolute top-2 right-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded-full">
            {Math.round(recommendationScore * 100)}% match
          </div>
        )}
        
        {/* Stock Status */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-medium">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-text-primary group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
          <p className="text-sm text-text-secondary mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-accent">
            {formatCurrency(product.price)}
          </span>
          <span className="text-xs text-text-secondary bg-surface px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-xs text-text-secondary bg-gray-800 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleInteraction('like')}
              disabled={loading}
              className={`p-2 rounded-lg transition-all duration-200 ${
                liked
                  ? 'text-red-400 bg-red-400/20'
                  : 'text-text-secondary hover:text-red-400 hover:bg-red-400/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            </button>
            
            <button
              onClick={() => handleInteraction('view')}
              disabled={loading}
              className="p-2 text-text-secondary hover:text-primary hover:bg-primary/20 rounded-lg transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => handleInteraction('share')}
              disabled={loading}
              className="p-2 text-text-secondary hover:text-accent hover:bg-accent/20 rounded-lg transition-all duration-200"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            disabled={!product.inStock || loading}
            onClick={() => handleInteraction('add_to_cart')}
            loading={loading}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}
