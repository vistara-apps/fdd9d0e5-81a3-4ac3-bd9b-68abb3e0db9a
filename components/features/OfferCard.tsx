'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Offer } from '@/lib/types';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { Gift, Clock, CheckCircle, XCircle } from 'lucide-react';

interface OfferCardProps {
  offer: Offer;
  onRedeem?: (offerId: string) => void;
}

export function OfferCard({ offer, onRedeem }: OfferCardProps) {
  const [loading, setLoading] = useState(false);

  const handleRedeem = async () => {
    if (loading || offer.status !== 'sent') return;
    
    setLoading(true);
    try {
      onRedeem?.(offer.offerId);
    } catch (error) {
      console.error('Redeem error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (offer.status) {
      case 'redeemed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Gift className="w-5 h-5 text-accent" />;
    }
  };

  const getStatusColor = () => {
    switch (offer.status) {
      case 'redeemed':
        return 'border-green-400/30 bg-green-400/5';
      case 'expired':
        return 'border-red-400/30 bg-red-400/5';
      case 'viewed':
        return 'border-blue-400/30 bg-blue-400/5';
      default:
        return 'border-accent/30 bg-accent/5';
    }
  };

  const isExpired = new Date(offer.validUntil) < new Date();
  const canRedeem = offer.status === 'sent' && !isExpired;

  return (
    <Card variant="offer" className={`${getStatusColor()} relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-accent to-primary" />
      </div>

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-semibold text-text-primary">{offer.title}</h3>
              <p className="text-sm text-text-secondary capitalize">
                {offer.type.replace('_', ' ')}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-accent">
              {offer.type === 'discount' && offer.discount && (
                <>
                  {offer.discount > 1 
                    ? formatCurrency(offer.discount)
                    : `${Math.round(offer.discount * 100)}%`
                  } OFF
                </>
              )}
              {offer.type === 'bogo' && 'BOGO'}
              {offer.type === 'free_shipping' && 'FREE SHIP'}
              {offer.type === 'loyalty_points' && `${offer.discount || 0} PTS`}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-text-secondary">{offer.description}</p>

        {/* Validity and Status */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2 text-text-secondary">
            <Clock className="w-4 h-4" />
            <span>
              {isExpired 
                ? 'Expired' 
                : `Valid until ${formatRelativeTime(offer.validUntil)}`
              }
            </span>
          </div>
          
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            offer.status === 'redeemed' 
              ? 'bg-green-400/20 text-green-400'
              : offer.status === 'expired'
              ? 'bg-red-400/20 text-red-400'
              : 'bg-accent/20 text-accent'
          }`}>
            {offer.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Action Button */}
        {canRedeem && (
          <Button
            variant="accent"
            className="w-full"
            onClick={handleRedeem}
            loading={loading}
          >
            Redeem Offer
          </Button>
        )}

        {offer.status === 'redeemed' && offer.redeemedAt && (
          <p className="text-xs text-green-400 text-center">
            Redeemed {formatRelativeTime(offer.redeemedAt)}
          </p>
        )}
      </div>
    </Card>
  );
}
