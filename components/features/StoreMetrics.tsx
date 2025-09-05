'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { StoreMetrics as StoreMetricsType } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { Users, Zap, TrendingUp, ShoppingCart, Eye, Heart } from 'lucide-react';

export function StoreMetrics() {
  const [metrics, setMetrics] = useState<StoreMetricsType | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics({
        totalCustomers: 1247,
        activeRecommendations: 89,
        conversionRate: 0.234,
        averageOrderValue: 67.89,
        topProducts: [],
        recentActivity: [],
      });
      setLoading(false);
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} variant="metric" />
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  const metricCards = [
    {
      title: 'Total Customers',
      value: metrics.totalCustomers.toLocaleString(),
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/20',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Recommendations',
      value: metrics.activeRecommendations.toString(),
      icon: Zap,
      color: 'text-accent',
      bgColor: 'bg-accent/20',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Conversion Rate',
      value: `${(metrics.conversionRate * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-green-400',
      bgColor: 'bg-green-400/20',
      change: '+2.3%',
      changeType: 'positive' as const,
    },
    {
      title: 'Avg Order Value',
      value: formatCurrency(metrics.averageOrderValue),
      icon: ShoppingCart,
      color: 'text-primary',
      bgColor: 'bg-primary/20',
      change: '+5.7%',
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric) => (
          <Card key={metric.title} variant="metric" className="group hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm font-medium">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-text-primary mt-1">
                  {metric.value}
                </p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    metric.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {metric.change}
                  </span>
                  <span className="text-text-secondary text-sm ml-1">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { type: 'view', count: 23, icon: Eye, time: '5 min ago' },
              { type: 'like', count: 12, icon: Heart, time: '12 min ago' },
              { type: 'purchase', count: 3, icon: ShoppingCart, time: '18 min ago' },
              { type: 'recommendation', count: 8, icon: Zap, time: '25 min ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-surface/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <activity.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-text-primary font-medium capitalize">
                      {activity.count} {activity.type}s
                    </p>
                    <p className="text-text-secondary text-sm">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Chart Placeholder */}
        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Performance Trends
          </h3>
          <div className="h-48 bg-surface/50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-text-secondary mx-auto mb-2" />
              <p className="text-text-secondary">Chart visualization coming soon</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
