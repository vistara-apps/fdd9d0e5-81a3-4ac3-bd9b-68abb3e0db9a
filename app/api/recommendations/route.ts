import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AIRecommendationService } from '@/lib/ai-service';
import { supabase } from '@/lib/supabase';

const RecommendationRequestSchema = z.object({
  userId: z.string(),
  context: z.enum(['in_store', 'follow_up', 'browsing']),
  location: z.string().optional(),
  storeId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, context, location, storeId } = RecommendationRequestSchema.parse(body);

    // Fetch user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch recent interactions
    const { data: recentInteractions } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch available products (limit to store if specified)
    let productsQuery = supabase
      .from('products')
      .select('*')
      .limit(50);

    if (storeId) {
      productsQuery = productsQuery.eq('store_id', storeId);
    }

    const { data: availableProducts } = await productsQuery;

    // Generate AI recommendations
    const recommendations = await AIRecommendationService.generateRecommendations({
      userId,
      context,
      userProfile: userProfile || undefined,
      recentInteractions: recentInteractions || [],
      availableProducts: availableProducts || [],
      location,
    });

    // Log the recommendation request
    await supabase.from('interactions').insert({
      interaction_id: `rec_${Date.now()}_${userId}`,
      user_id: userId,
      product_id: 'recommendation_request',
      type: 'recommendation',
      location,
      metadata: {
        context,
        recommendationCount: recommendations.recommendations.length,
        confidence: recommendations.confidence,
      },
    });

    return NextResponse.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error('Recommendation API Error:', error);
    
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
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 }
      );
    }

    // Fetch recent recommendations for the user
    const { data: recentRecommendations, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'recommendation')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: recentRecommendations,
    });
  } catch (error) {
    console.error('Get Recommendations Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
