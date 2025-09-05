'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { StoreMetrics } from '@/components/features/StoreMetrics';
import { RecommendationEngine } from '@/components/features/RecommendationEngine';
import { OfferCard } from '@/components/features/OfferCard';
import { QRScanner, QRCodeGenerator } from '@/components/features/QRScanner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  BarChart3, 
  Zap, 
  Gift, 
  QrCode, 
  Users, 
  TrendingUp,
  ShoppingBag,
  Bell,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Offer, StoreMetrics as StoreMetricsType } from '@/lib/types';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'offers' | 'qr' | 'analytics'>('overview');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [metrics, setMetrics] = useState<StoreMetricsType | null>(null);
  const [loading, setLoading] = useState(false);

  // Sample QR data for demo
  const sampleQRData = `retailrune://product/prod_001?userId=demo_user&location=electronics&timestamp=${Date.now()}`;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load offers
      const offersResponse = await fetch('/api/offers?userId=demo_user');
      if (offersResponse.ok) {
        const offersResult = await offersResponse.json();
        if (offersResult.success) {
          setOffers(offersResult.data);
        }
      }

      // Load metrics
      const metricsResponse = await fetch('/api/analytics?type=metrics');
      if (metricsResponse.ok) {
        const metricsResult = await metricsResponse.json();
        if (metricsResult.success) {
          setMetrics(metricsResult.data);
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = (data: string) => {
    console.log('QR Scanned:', data);
    // Parse QR data and trigger appropriate action
    if (data.includes('retailrune://')) {
      // Handle RetailRune QR codes
      const url = new URL(data);
      const productId = url.pathname.split('/').pop();
      const userId = url.searchParams.get('userId');
      const location = url.searchParams.get('location');
      
      console.log('Product interaction:', { productId, userId, location });
      
      // Record interaction
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'interaction',
          data: {
            userId: userId || 'demo_user',
            productId,
            type: 'scan',
            location,
          },
        }),
      });
    }
    
    setShowQRScanner(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'recommendations', label: 'AI Recommendations', icon: Zap },
    { id: 'offers', label: 'Offers', icon: Gift },
    { id: 'qr', label: 'QR Codes', icon: QrCode },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">RetailRune Dashboard</h1>
            <p className="text-text-secondary mt-1">
              Manage your AI-powered retail experience
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={loadDashboardData}
              loading={loading}
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="primary" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-text-primary">{metrics.totalCustomers}</div>
              <div className="text-sm text-text-secondary">Total Customers</div>
            </Card>
            <Card className="text-center">
              <Zap className="w-8 h-8 text-accent mx-auto mb-2" />
              <div className="text-2xl font-bold text-text-primary">{metrics.activeRecommendations}</div>
              <div className="text-sm text-text-secondary">Active Recommendations</div>
            </Card>
            <Card className="text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-text-primary">{metrics.conversionRate}%</div>
              <div className="text-sm text-text-secondary">Conversion Rate</div>
            </Card>
            <Card className="text-center">
              <ShoppingBag className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-text-primary">${metrics.averageOrderValue}</div>
              <div className="text-sm text-text-secondary">Avg Order Value</div>
            </Card>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-surface/50 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <StoreMetrics />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Recent Activity
                  </h3>
                  {metrics?.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-surface last:border-0">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} - {activity.productId}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {activity.location} • {activity.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-xs text-text-secondary">
                        {activity.userId}
                      </div>
                    </div>
                  ))}
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Active Offers
                  </h3>
                  {offers.length > 0 ? (
                    <div className="space-y-3">
                      {offers.slice(0, 3).map((offer) => (
                        <div key={offer.offerId} className="p-3 bg-surface/50 rounded-lg">
                          <h4 className="font-medium text-text-primary text-sm">{offer.title}</h4>
                          <p className="text-xs text-text-secondary mt-1">{offer.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-accent font-medium">
                              {offer.discount}% OFF
                            </span>
                            <span className="text-xs text-text-secondary">
                              Until {offer.validUntil.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-text-secondary text-sm">No active offers</p>
                  )}
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'recommendations' && (
            <RecommendationEngine
              userId="demo_user"
              context="in_store"
              onInteraction={(productId, type) => {
                console.log('Product interaction:', productId, type);
                // Record interaction
                fetch('/api/analytics', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    type: 'interaction',
                    data: {
                      userId: 'demo_user',
                      productId,
                      type,
                      location: 'dashboard',
                    },
                  }),
                });
              }}
            />
          )}

          {activeTab === 'offers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text-primary">Customer Offers</h2>
                <Button
                  variant="primary"
                  onClick={() => {
                    // Simulate creating a new offer
                    const newOffer: Offer = {
                      offerId: `offer_${Date.now()}`,
                      userId: 'demo_user',
                      type: 'discount',
                      title: 'Flash Sale - 25% Off!',
                      description: 'Limited time offer on selected electronics.',
                      discount: 25,
                      validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
                      status: 'sent',
                      createdAt: new Date(),
                    };
                    setOffers([newOffer, ...offers]);
                  }}
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Create Offer
                </Button>
              </div>

              {offers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {offers.map((offer) => (
                    <OfferCard
                      key={offer.offerId}
                      offer={offer}
                      onRedeem={(offerId) => {
                        console.log('Offer redeemed:', offerId);
                        setOffers(offers.map(o => 
                          o.offerId === offerId 
                            ? { ...o, status: 'redeemed' as const, redeemedAt: new Date() }
                            : o
                        ));
                      }}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <Gift className="w-12 h-12 text-text-secondary mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    No Offers Yet
                  </h3>
                  <p className="text-text-secondary mb-4">
                    Create personalized offers to engage your customers.
                  </p>
                  <Button variant="primary">
                    Create Your First Offer
                  </Button>
                </Card>
              )}
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text-primary">QR Code Management</h2>
                <Button
                  variant="primary"
                  onClick={() => setShowQRScanner(true)}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Scan QR Code
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Sample QR Code
                  </h3>
                  <p className="text-text-secondary text-sm mb-4">
                    This QR code links to a product recommendation for demo purposes.
                  </p>
                  <div className="flex justify-center">
                    <QRCodeGenerator data={sampleQRData} size={200} />
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    QR Code Instructions
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary">Generate QR Codes</h4>
                        <p className="text-sm text-text-secondary">
                          Create unique QR codes for products, displays, or special offers.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary">Place in Store</h4>
                        <p className="text-sm text-text-secondary">
                          Position QR codes near products or on digital displays.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-medium text-text-primary">Customer Scans</h4>
                        <p className="text-sm text-text-secondary">
                          Customers scan to get personalized recommendations and offers.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-text-primary">Analytics & Insights</h2>
              <StoreMetrics />
              
              <Card>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  Coming Soon
                </h3>
                <p className="text-text-secondary">
                  Advanced analytics dashboard with detailed insights, conversion tracking, 
                  and performance metrics will be available in the next update.
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onScan={handleQRScan}
        onClose={() => setShowQRScanner(false)}
      />
    </AppShell>
  );
}
