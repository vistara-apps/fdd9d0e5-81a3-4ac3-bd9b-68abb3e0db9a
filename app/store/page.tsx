'use client';

import { useState, useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { AppShell } from '@/components/layout/AppShell';
import { QRScanner } from '@/components/features/QRScanner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { 
  QrCode, 
  Zap, 
  ShoppingBag, 
  Gift, 
  TrendingUp,
  Users,
  Star,
  Clock,
  MapPin
} from 'lucide-react';

interface Recommendation {
  productId: string;
  score: number;
  reasoning: string;
  category: string;
}

interface ScanData {
  type: string;
  storeId: string;
  location: string;
  timestamp: string;
}

export default function StorePage() {
  const { setFrameReady } = useMiniKit();
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStore, setCurrentStore] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [userOffers, setUserOffers] = useState([]);

  useEffect(() => {
    setFrameReady();
  }, [setFrameReady]);

  const handleQRScan = async (qrData: string) => {
    try {
      setIsLoading(true);
      const scanData: ScanData = JSON.parse(qrData);
      
      setCurrentStore(scanData.storeId);
      setCurrentLocation(scanData.location);

      // Record the scan interaction
      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo_user', // In production, get from wallet/auth
          productId: 'store_scan',
          type: 'scan',
          location: scanData.location,
          metadata: {
            storeId: scanData.storeId,
            scanType: scanData.type,
          },
        }),
      });

      // Get AI recommendations
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo_user',
          context: 'in_store',
          location: scanData.location,
          storeId: scanData.storeId,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setRecommendations(result.data.recommendations);
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error('QR Scan Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductInteraction = async (productId: string, type: string) => {
    try {
      await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo_user',
          productId,
          type,
          location: currentLocation,
          metadata: {
            storeId: currentStore,
            context: 'recommendation_interaction',
          },
        }),
      });

      // If it's a purchase, generate a follow-up offer
      if (type === 'purchase') {
        await generateFollowUpOffer();
      }
    } catch (error) {
      console.error('Interaction Error:', error);
    }
  };

  const generateFollowUpOffer = async () => {
    try {
      const response = await fetch('/api/offers?action=generate-followup&userId=demo_user', {
        method: 'PATCH',
      });
      
      const result = await response.json();
      if (result.success) {
        // Show success message or update offers list
        console.log('Follow-up offer generated:', result.data);
      }
    } catch (error) {
      console.error('Follow-up Offer Error:', error);
    }
  };

  const loadUserOffers = async () => {
    try {
      const response = await fetch('/api/offers?userId=demo_user&active=true');
      const result = await response.json();
      
      if (result.success) {
        setUserOffers(result.data);
      }
    } catch (error) {
      console.error('Load Offers Error:', error);
    }
  };

  useEffect(() => {
    loadUserOffers();
  }, []);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-4 bg-gradient-to-r from-primary to-accent rounded-2xl">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gradient">
            In-Store Experience
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Scan QR codes to unlock personalized recommendations and exclusive offers
          </p>
        </div>

        {/* Current Store Info */}
        {currentStore && (
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">
                  Connected to Store: {currentStore}
                </h3>
                <p className="text-text-secondary">
                  Location: {currentLocation}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="text-center group hover:scale-105 cursor-pointer" 
                onClick={() => setIsQRScannerOpen(true)}>
            <div className="p-4 bg-primary/20 rounded-full w-fit mx-auto mb-4">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Scan QR Code
            </h3>
            <p className="text-text-secondary mb-4">
              Scan store QR codes to get personalized recommendations
            </p>
            <Button variant="primary" size="sm">
              Start Scanning
            </Button>
          </Card>

          <Card className="text-center group hover:scale-105">
            <div className="p-4 bg-accent/20 rounded-full w-fit mx-auto mb-4">
              <Gift className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Active Offers
            </h3>
            <p className="text-text-secondary mb-4">
              {userOffers.length} exclusive offers available
            </p>
            <Button variant="accent" size="sm" onClick={loadUserOffers}>
              View Offers
            </Button>
          </Card>
        </div>

        {/* AI Recommendations */}
        {showRecommendations && recommendations.length > 0 && (
          <Card>
            <div className="flex items-center space-x-3 mb-6">
              <Zap className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold text-text-primary">
                AI Recommendations for You
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <div key={rec.productId} 
                     className="bg-surface rounded-lg p-4 border border-surface hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-accent" />
                      <span className="text-sm font-medium text-accent">
                        {Math.round(rec.score * 100)}% Match
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary bg-surface px-2 py-1 rounded">
                      {rec.category}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-text-primary mb-2">
                    Product {rec.productId}
                  </h4>
                  
                  <p className="text-sm text-text-secondary mb-4">
                    {rec.reasoning}
                  </p>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleProductInteraction(rec.productId, 'view')}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleProductInteraction(rec.productId, 'like')}
                    >
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Store Features */}
        <Card>
          <h2 className="text-2xl font-bold text-text-primary mb-6">
            RetailRune Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="p-4 bg-primary/20 rounded-full w-fit mx-auto">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-text-primary">
                AI-Powered Recommendations
              </h3>
              <p className="text-text-secondary text-sm">
                Get personalized product suggestions based on your preferences and behavior
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="p-4 bg-accent/20 rounded-full w-fit mx-auto">
                <Gift className="w-8 h-8 text-accent" />
              </div>
              <h3 className="font-semibold text-text-primary">
                Exclusive Offers
              </h3>
              <p className="text-text-secondary text-sm">
                Receive personalized discounts and follow-up offers after purchases
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="p-4 bg-green-400/20 rounded-full w-fit mx-auto">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="font-semibold text-text-primary">
                Smart Analytics
              </h3>
              <p className="text-text-secondary text-sm">
                Track your shopping patterns and discover new products you'll love
              </p>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold text-text-primary">Recent Activity</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-surface/50 rounded-lg">
              <div className="p-2 bg-primary/20 rounded-full">
                <QrCode className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-text-primary font-medium">QR Code Scanned</p>
                <p className="text-text-secondary text-sm">Electronics Section • 2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-surface/50 rounded-lg">
              <div className="p-2 bg-accent/20 rounded-full">
                <Zap className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-text-primary font-medium">AI Recommendations Generated</p>
                <p className="text-text-secondary text-sm">3 personalized suggestions • 2 minutes ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-3 bg-surface/50 rounded-lg">
              <div className="p-2 bg-green-400/20 rounded-full">
                <Users className="w-4 h-4 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-text-primary font-medium">Profile Updated</p>
                <p className="text-text-secondary text-sm">Shopping preferences saved • 1 hour ago</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRScan}
        onError={(error) => console.error('QR Scanner Error:', error)}
      />

      {/* Loading Modal */}
      <Modal 
        isOpen={isLoading} 
        onClose={() => {}} 
        title="Processing..."
      >
        <div className="text-center space-y-4">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-text-secondary">
            Generating personalized recommendations...
          </p>
        </div>
      </Modal>
    </AppShell>
  );
}
