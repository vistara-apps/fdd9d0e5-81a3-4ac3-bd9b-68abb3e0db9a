import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Offer, Purchase, User } from '@/lib/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, purchaseData, userProfile } = body;

    if (!userId || !purchaseData) {
      return NextResponse.json(
        { success: false, error: 'User ID and purchase data are required' },
        { status: 400 }
      );
    }

    // Generate personalized follow-up offer
    const offer = await generateFollowUpOffer(userId, purchaseData, userProfile);

    return NextResponse.json({
      success: true,
      data: offer,
    });

  } catch (error) {
    console.error('Offer generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate offer' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // In a real app, fetch from database
    // For now, return mock active offers
    const mockOffers: Offer[] = [
      {
        offerId: `offer_${Date.now()}_1`,
        userId,
        productId: 'prod_001',
        type: 'discount',
        title: '20% Off Your Next Purchase',
        description: 'Thanks for your recent visit! Enjoy 20% off any item in Electronics.',
        discount: 20,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'sent',
        createdAt: new Date(),
      },
      {
        offerId: `offer_${Date.now()}_2`,
        userId,
        type: 'loyalty_points',
        title: 'Double Points Weekend',
        description: 'Earn 2x loyalty points on all purchases this weekend!',
        validUntil: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        status: 'sent',
        createdAt: new Date(),
      },
    ];

    return NextResponse.json({
      success: true,
      data: mockOffers,
    });

  } catch (error) {
    console.error('Offers fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

async function generateFollowUpOffer(
  userId: string,
  purchaseData: Purchase,
  userProfile?: Partial<User>
): Promise<Offer> {
  try {
    const prompt = `
You are an AI marketing assistant for RetailRune. Generate a personalized follow-up offer for a customer who just made a purchase.

Customer Purchase:
- Product ID: ${purchaseData.productId}
- Quantity: ${purchaseData.quantity}
- Total Amount: $${purchaseData.totalAmount}
- Payment Method: ${purchaseData.paymentMethod}

Customer Profile:
- User ID: ${userId}
- Purchase History: ${JSON.stringify(userProfile?.purchaseHistory?.slice(-3) || [])}
- Preferences: ${JSON.stringify(userProfile?.preferences || {})}

Generate a personalized offer that:
1. Thanks them for their purchase
2. Offers value based on their buying behavior
3. Encourages repeat business
4. Is relevant to their interests

Return a JSON object with this structure:
{
  "type": "discount|bogo|free_shipping|loyalty_points",
  "title": "Compelling offer title",
  "description": "Detailed offer description",
  "discount": 15,
  "validDays": 7
}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful marketing AI that creates personalized offers. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    let aiOffer;
    try {
      aiOffer = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI offer response:', aiResponse);
      // Fallback to default offer
      aiOffer = generateFallbackOffer(purchaseData);
    }

    // Create the offer object
    const offer: Offer = {
      offerId: `offer_${userId}_${Date.now()}`,
      userId,
      productId: purchaseData.productId,
      type: aiOffer.type || 'discount',
      title: aiOffer.title || 'Special Offer Just for You!',
      description: aiOffer.description || 'Thanks for your purchase! Here\'s a special offer.',
      discount: aiOffer.discount || 10,
      validUntil: new Date(Date.now() + (aiOffer.validDays || 7) * 24 * 60 * 60 * 1000),
      status: 'sent',
      createdAt: new Date(),
    };

    return offer;

  } catch (error) {
    console.error('AI offer generation error:', error);
    // Return fallback offer
    return {
      offerId: `offer_${userId}_${Date.now()}`,
      userId,
      productId: purchaseData.productId,
      type: 'discount',
      title: 'Thank You for Your Purchase!',
      description: 'Enjoy 15% off your next purchase as a thank you for being a valued customer.',
      discount: 15,
      validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'sent',
      createdAt: new Date(),
    };
  }
}

function generateFallbackOffer(purchaseData: Purchase) {
  const offerTypes = ['discount', 'bogo', 'free_shipping', 'loyalty_points'];
  const randomType = offerTypes[Math.floor(Math.random() * offerTypes.length)];

  const offers = {
    discount: {
      type: 'discount',
      title: 'Exclusive Discount for You!',
      description: 'Thanks for your recent purchase! Enjoy 15% off your next order.',
      discount: 15,
      validDays: 7,
    },
    bogo: {
      type: 'bogo',
      title: 'Buy One, Get One 50% Off',
      description: 'Love what you bought? Get another similar item at 50% off!',
      discount: 50,
      validDays: 5,
    },
    free_shipping: {
      type: 'free_shipping',
      title: 'Free Shipping on Your Next Order',
      description: 'We appreciate your business! Enjoy free shipping on your next purchase.',
      discount: 0,
      validDays: 10,
    },
    loyalty_points: {
      type: 'loyalty_points',
      title: 'Double Loyalty Points',
      description: 'Earn 2x points on your next purchase and unlock exclusive rewards!',
      discount: 0,
      validDays: 14,
    },
  };

  return offers[randomType as keyof typeof offers];
}
