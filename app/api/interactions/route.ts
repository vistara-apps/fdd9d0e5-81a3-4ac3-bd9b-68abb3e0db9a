import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

const CreateInteractionSchema = z.object({
  userId: z.string(),
  productId: z.string(),
  type: z.enum(['view', 'like', 'scan', 'purchase', 'recommendation', 'offer_view']),
  location: z.string().optional(),
  metadata: z.object({
    duration: z.number().optional(),
    source: z.string().optional(),
    context: z.string().optional(),
    value: z.number().optional(),
    additionalData: z.any().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const interactionData = CreateInteractionSchema.parse(body);

    // Create new interaction
    const { data: newInteraction, error } = await supabase
      .from('interactions')
      .insert({
        id: uuidv4(),
        interaction_id: `int_${Date.now()}_${uuidv4().slice(0, 8)}`,
        user_id: interactionData.userId,
        product_id: interactionData.productId,
        timestamp: new Date().toISOString(),
        type: interactionData.type,
        location: interactionData.location || null,
        metadata: interactionData.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update user interaction log
    const { data: user } = await supabase
      .from('users')
      .select('interaction_log')
      .eq('user_id', interactionData.userId)
      .single();

    if (user) {
      const updatedLog = [
        ...(user.interaction_log as any[]).slice(-49), // Keep last 49 interactions
        {
          interactionId: newInteraction.interaction_id,
          productId: interactionData.productId,
          type: interactionData.type,
          timestamp: newInteraction.timestamp,
          location: interactionData.location,
        }
      ];

      await supabase
        .from('users')
        .update({
          interaction_log: updatedLog,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', interactionData.userId);
    }

    return NextResponse.json({
      success: true,
      data: newInteraction,
      message: 'Interaction recorded successfully',
    });
  } catch (error) {
    console.error('Create Interaction Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const location = searchParams.get('location');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let query = supabase.from('interactions').select('*');

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (productId) {
      query = query.eq('product_id', productId);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (location) {
      query = query.eq('location', location);
    }
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }

    // Apply pagination and ordering
    query = query
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: interactions, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: interactions || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('Get Interactions Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Analytics endpoint for interaction insights
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const analyticsType = searchParams.get('analytics');

    if (analyticsType === 'summary') {
      // Get interaction summary analytics
      const { data: interactions, error } = await supabase
        .from('interactions')
        .select('type, timestamp, metadata')
        .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

      if (error) {
        throw error;
      }

      // Process analytics
      const summary = {
        totalInteractions: interactions?.length || 0,
        interactionsByType: {},
        dailyInteractions: {},
        averageSessionDuration: 0,
      };

      interactions?.forEach((interaction) => {
        const type = interaction.type;
        const date = new Date(interaction.timestamp).toISOString().split('T')[0];
        
        // Count by type
        summary.interactionsByType[type] = (summary.interactionsByType[type] || 0) + 1;
        
        // Count by date
        summary.dailyInteractions[date] = (summary.dailyInteractions[date] || 0) + 1;
      });

      return NextResponse.json({
        success: true,
        data: summary,
      });
    }

    if (analyticsType === 'popular-products') {
      // Get most interacted products
      const { data: interactions, error } = await supabase
        .from('interactions')
        .select('product_id, type')
        .gte('timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

      if (error) {
        throw error;
      }

      const productCounts = {};
      interactions?.forEach((interaction) => {
        const productId = interaction.product_id;
        productCounts[productId] = (productCounts[productId] || 0) + 1;
      });

      const popularProducts = Object.entries(productCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([productId, count]) => ({ productId, interactionCount: count }));

      return NextResponse.json({
        success: true,
        data: popularProducts,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid analytics type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Analytics Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
