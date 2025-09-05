import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { AIRecommendationService } from '@/lib/ai-service';
import { v4 as uuidv4 } from 'uuid';

const CreateOfferSchema = z.object({
  userId: z.string(),
  productId: z.string().optional(),
  type: z.string(),
  discount: z.number().min(0).max(100),
  validUntil: z.string(),
  metadata: z.object({
    message: z.string().optional(),
    conditions: z.array(z.string()).optional(),
    maxUses: z.number().optional(),
    currentUses: z.number().optional(),
  }).optional(),
});

const RedeemOfferSchema = z.object({
  offerId: z.string(),
  userId: z.string(),
  metadata: z.object({
    transactionId: z.string().optional(),
    amount: z.number().optional(),
    location: z.string().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const offerData = CreateOfferSchema.parse(body);

    // Create new offer
    const { data: newOffer, error } = await supabase
      .from('offers')
      .insert({
        id: uuidv4(),
        offer_id: `offer_${Date.now()}_${uuidv4().slice(0, 8)}`,
        user_id: offerData.userId,
        product_id: offerData.productId || null,
        type: offerData.type,
        discount: offerData.discount,
        valid_until: offerData.validUntil,
        status: 'sent',
        metadata: offerData.metadata || {},
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Record offer creation as an interaction
    await supabase.from('interactions').insert({
      id: uuidv4(),
      interaction_id: `offer_created_${Date.now()}_${uuidv4().slice(0, 8)}`,
      user_id: offerData.userId,
      product_id: offerData.productId || 'general_offer',
      timestamp: new Date().toISOString(),
      type: 'offer_view',
      metadata: {
        offerId: newOffer.offer_id,
        offerType: offerData.type,
        discount: offerData.discount,
      },
    });

    return NextResponse.json({
      success: true,
      data: newOffer,
      message: 'Offer created successfully',
    });
  } catch (error) {
    console.error('Create Offer Error:', error);
    
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
    const offerId = searchParams.get('offerId');
    const status = searchParams.get('status');
    const active = searchParams.get('active');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase.from('offers').select('*');

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (offerId) {
      query = query.eq('offer_id', offerId);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (active === 'true') {
      query = query
        .eq('status', 'sent')
        .gt('valid_until', new Date().toISOString());
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: offers, error, count } = await query;

    if (error) {
      throw error;
    }

    // If requesting a single offer by ID
    if (offerId && offers && offers.length === 1) {
      return NextResponse.json({
        success: true,
        data: offers[0],
      });
    }

    return NextResponse.json({
      success: true,
      data: offers || [],
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    });
  } catch (error) {
    console.error('Get Offers Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Redeem offer endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, userId, metadata } = RedeemOfferSchema.parse(body);

    // Get the offer
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .select('*')
      .eq('offer_id', offerId)
      .eq('user_id', userId)
      .single();

    if (offerError || !offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      );
    }

    // Check if offer is still valid
    if (offer.status !== 'sent') {
      return NextResponse.json(
        { success: false, error: 'Offer already redeemed or expired' },
        { status: 400 }
      );
    }

    if (new Date(offer.valid_until) < new Date()) {
      // Mark as expired
      await supabase
        .from('offers')
        .update({ status: 'expired' })
        .eq('offer_id', offerId);

      return NextResponse.json(
        { success: false, error: 'Offer has expired' },
        { status: 400 }
      );
    }

    // Check usage limits
    const currentUses = (offer.metadata as any)?.currentUses || 0;
    const maxUses = (offer.metadata as any)?.maxUses;
    
    if (maxUses && currentUses >= maxUses) {
      return NextResponse.json(
        { success: false, error: 'Offer usage limit reached' },
        { status: 400 }
      );
    }

    // Redeem the offer
    const updatedMetadata = {
      ...offer.metadata,
      currentUses: currentUses + 1,
      redemptionDetails: metadata,
      redeemedAt: new Date().toISOString(),
    };

    const { data: redeemedOffer, error: redeemError } = await supabase
      .from('offers')
      .update({
        status: 'redeemed',
        metadata: updatedMetadata,
        updated_at: new Date().toISOString(),
      })
      .eq('offer_id', offerId)
      .select()
      .single();

    if (redeemError) {
      throw redeemError;
    }

    // Record redemption as an interaction
    await supabase.from('interactions').insert({
      id: uuidv4(),
      interaction_id: `offer_redeemed_${Date.now()}_${uuidv4().slice(0, 8)}`,
      user_id: userId,
      product_id: offer.product_id || 'general_offer',
      timestamp: new Date().toISOString(),
      type: 'purchase',
      metadata: {
        offerId: offerId,
        discount: offer.discount,
        redemptionValue: metadata?.amount || 0,
        location: metadata?.location,
      },
    });

    return NextResponse.json({
      success: true,
      data: redeemedOffer,
      message: 'Offer redeemed successfully',
    });
  } catch (error) {
    console.error('Redeem Offer Error:', error);
    
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

// Generate follow-up offer endpoint
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');

    if (!userId || action !== 'generate-followup') {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters' },
        { status: 400 }
      );
    }

    // Get user profile and purchase history
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate AI-powered follow-up offer
    const followUpOffer = await AIRecommendationService.generateFollowUpOffer(
      userId,
      user.purchase_history as any[],
      user.preferences
    );

    // Create the offer
    const { data: newOffer, error } = await supabase
      .from('offers')
      .insert({
        id: uuidv4(),
        offer_id: `followup_${Date.now()}_${uuidv4().slice(0, 8)}`,
        user_id: userId,
        product_id: null,
        type: followUpOffer.offerType,
        discount: followUpOffer.discount,
        valid_until: followUpOffer.validUntil.toISOString(),
        status: 'sent',
        metadata: {
          message: followUpOffer.message,
          isFollowUp: true,
          generatedBy: 'ai',
        },
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: newOffer,
      message: 'Follow-up offer generated successfully',
    });
  } catch (error) {
    console.error('Generate Follow-up Offer Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
