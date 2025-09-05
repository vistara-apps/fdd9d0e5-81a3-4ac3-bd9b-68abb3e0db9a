import { NextRequest, NextResponse } from 'next/server';
import { StoreMetrics, AnalyticsData, Interaction } from '@/lib/types';
import { SAMPLE_PRODUCTS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'metrics';
    const period = searchParams.get('period') || 'day';
    const storeId = searchParams.get('storeId');

    switch (type) {
      case 'metrics':
        const metrics = await getStoreMetrics(storeId);
        return NextResponse.json({
          success: true,
          data: metrics,
        });

      case 'analytics':
        const analytics = await getAnalyticsData(period as 'day' | 'week' | 'month');
        return NextResponse.json({
          success: true,
          data: analytics,
        });

      case 'interactions':
        const interactions = await getRecentInteractions(storeId);
        return NextResponse.json({
          success: true,
          data: interactions,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid analytics type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'interaction':
        const result = await recordInteraction(data);
        return NextResponse.json({
          success: true,
          data: result,
        });

      case 'purchase':
        const purchaseResult = await recordPurchase(data);
        return NextResponse.json({
          success: true,
          data: purchaseResult,
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid event type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Analytics recording error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record analytics event' },
      { status: 500 }
    );
  }
}

async function getStoreMetrics(storeId?: string | null): Promise<StoreMetrics> {
  // In a real app, this would query the database
  // For now, return mock data with realistic numbers
  
  const now = new Date();
  const recentActivity: Interaction[] = [
    {
      interactionId: `int_${Date.now()}_1`,
      userId: 'user_001',
      productId: 'prod_001',
      timestamp: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
      type: 'view',
      location: 'Electronics Section',
    },
    {
      interactionId: `int_${Date.now()}_2`,
      userId: 'user_002',
      productId: 'prod_003',
      timestamp: new Date(now.getTime() - 12 * 60 * 1000), // 12 minutes ago
      type: 'like',
      location: 'Sports Section',
    },
    {
      interactionId: `int_${Date.now()}_3`,
      userId: 'user_003',
      productId: 'prod_002',
      timestamp: new Date(now.getTime() - 18 * 60 * 1000), // 18 minutes ago
      type: 'scan',
      location: 'Home & Garden',
    },
    {
      interactionId: `int_${Date.now()}_4`,
      userId: 'user_001',
      productId: 'prod_004',
      timestamp: new Date(now.getTime() - 25 * 60 * 1000), // 25 minutes ago
      type: 'add_to_cart',
      location: 'Electronics Section',
    },
  ];

  const metrics: StoreMetrics = {
    totalCustomers: 1247,
    activeRecommendations: 89,
    conversionRate: 12.8,
    averageOrderValue: 67.50,
    topProducts: SAMPLE_PRODUCTS.slice(0, 5),
    recentActivity,
  };

  return metrics;
}

async function getAnalyticsData(period: 'day' | 'week' | 'month'): Promise<AnalyticsData> {
  // Generate mock analytics data based on period
  const now = new Date();
  let dataPoints: { date: string; value: number }[] = [];
  let baseMetrics = {
    impressions: 0,
    clicks: 0,
    conversions: 0,
    revenue: 0,
  };

  switch (period) {
    case 'day':
      // Last 24 hours, hourly data
      for (let i = 23; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 60 * 60 * 1000);
        dataPoints.push({
          date: date.toISOString(),
          value: Math.floor(Math.random() * 50) + 10,
        });
      }
      baseMetrics = {
        impressions: 2847,
        clicks: 342,
        conversions: 28,
        revenue: 1890.50,
      };
      break;

    case 'week':
      // Last 7 days, daily data
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        dataPoints.push({
          date: date.toISOString(),
          value: Math.floor(Math.random() * 200) + 100,
        });
      }
      baseMetrics = {
        impressions: 18420,
        clicks: 2156,
        conversions: 187,
        revenue: 12450.75,
      };
      break;

    case 'month':
      // Last 30 days, daily data
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        dataPoints.push({
          date: date.toISOString(),
          value: Math.floor(Math.random() * 300) + 150,
        });
      }
      baseMetrics = {
        impressions: 78920,
        clicks: 9234,
        conversions: 756,
        revenue: 52890.25,
      };
      break;
  }

  const analytics: AnalyticsData = {
    period,
    metrics: baseMetrics,
    trends: dataPoints,
  };

  return analytics;
}

async function getRecentInteractions(storeId?: string | null): Promise<Interaction[]> {
  // In a real app, this would query the database
  const now = new Date();
  
  const interactions: Interaction[] = [
    {
      interactionId: `int_${Date.now()}_1`,
      userId: 'user_001',
      productId: 'prod_001',
      timestamp: new Date(now.getTime() - 2 * 60 * 1000),
      type: 'view',
      location: 'Electronics Section',
      metadata: { source: 'qr_scan', device: 'mobile' },
    },
    {
      interactionId: `int_${Date.now()}_2`,
      userId: 'user_002',
      productId: 'prod_003',
      timestamp: new Date(now.getTime() - 8 * 60 * 1000),
      type: 'like',
      location: 'Sports Section',
      metadata: { source: 'recommendation', confidence: 0.87 },
    },
    {
      interactionId: `int_${Date.now()}_3`,
      userId: 'user_003',
      productId: 'prod_002',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000),
      type: 'scan',
      location: 'Home & Garden',
      metadata: { source: 'display', duration: 45 },
    },
    {
      interactionId: `int_${Date.now()}_4`,
      userId: 'user_004',
      productId: 'prod_005',
      timestamp: new Date(now.getTime() - 22 * 60 * 1000),
      type: 'add_to_cart',
      location: 'Fashion',
      metadata: { source: 'recommendation', price: 89.99 },
    },
    {
      interactionId: `int_${Date.now()}_5`,
      userId: 'user_001',
      productId: 'prod_004',
      timestamp: new Date(now.getTime() - 35 * 60 * 1000),
      type: 'share',
      location: 'Electronics Section',
      metadata: { source: 'frame', platform: 'farcaster' },
    },
  ];

  return interactions;
}

async function recordInteraction(interactionData: Partial<Interaction>): Promise<{ success: boolean; interactionId: string }> {
  // In a real app, this would save to database
  const interactionId = `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log('Recording interaction:', {
    interactionId,
    ...interactionData,
    timestamp: new Date(),
  });

  // Here you would typically:
  // 1. Validate the interaction data
  // 2. Save to database (Supabase)
  // 3. Update user profile and preferences
  // 4. Trigger any real-time analytics updates
  // 5. Check if this interaction should trigger recommendations or offers

  return {
    success: true,
    interactionId,
  };
}

async function recordPurchase(purchaseData: any): Promise<{ success: boolean; purchaseId: string }> {
  // In a real app, this would save to database
  const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log('Recording purchase:', {
    purchaseId,
    ...purchaseData,
    timestamp: new Date(),
  });

  // Here you would typically:
  // 1. Validate the purchase data
  // 2. Save to database (Supabase)
  // 3. Update user purchase history
  // 4. Trigger follow-up offer generation
  // 5. Update analytics and metrics
  // 6. Send confirmation and potentially generate Farcaster frame

  // Simulate triggering a follow-up offer
  if (purchaseData.userId && purchaseData.totalAmount > 50) {
    console.log(`Triggering follow-up offer for user ${purchaseData.userId}`);
    // In a real app, you might queue this for processing
  }

  return {
    success: true,
    purchaseId,
  };
}
