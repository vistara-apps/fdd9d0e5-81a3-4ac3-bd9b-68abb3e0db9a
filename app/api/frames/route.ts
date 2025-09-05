import { NextRequest, NextResponse } from 'next/server';
import { FrameData, Product, Offer } from '@/lib/types';
import { SAMPLE_PRODUCTS } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const frameType = searchParams.get('type');
    const userId = searchParams.get('userId');
    const productId = searchParams.get('productId');

    if (!frameType || !userId) {
      return NextResponse.json(
        { success: false, error: 'Frame type and user ID are required' },
        { status: 400 }
      );
    }

    let frameData: FrameData;

    switch (frameType) {
      case 'product_recommendation':
        frameData = await generateProductRecommendationFrame(userId, productId);
        break;
      case 'offer_notification':
        frameData = await generateOfferNotificationFrame(userId);
        break;
      case 'display_greeting':
        frameData = await generateDisplayGreetingFrame(userId);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid frame type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: frameData,
    });

  } catch (error) {
    console.error('Frame generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate frame' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { frameId, action, userId } = body;

    if (!frameId || !action || !userId) {
      return NextResponse.json(
        { success: false, error: 'Frame ID, action, and user ID are required' },
        { status: 400 }
      );
    }

    // Handle frame interactions
    const result = await handleFrameAction(frameId, action, userId, body);

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error('Frame action error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to handle frame action' },
      { status: 500 }
    );
  }
}

async function generateProductRecommendationFrame(userId: string, productId?: string | null): Promise<FrameData> {
  // Get recommended product (use productId if provided, otherwise get top recommendation)
  let product: Product;
  
  if (productId) {
    product = SAMPLE_PRODUCTS.find(p => p.productId === productId) || SAMPLE_PRODUCTS[0];
  } else {
    // For demo, just use the first product
    product = SAMPLE_PRODUCTS[0];
  }

  const frameData: FrameData = {
    frameId: `frame_rec_${userId}_${Date.now()}`,
    type: 'product_recommendation',
    userId,
    content: {
      title: `✨ Perfect Match for You!`,
      description: `${product.name} - ${product.description}\n\n💰 $${product.price}\n\n🎯 Recommended because it matches your preferences and shopping history.`,
      imageUrl: product.imageUrl || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop`,
      buttons: [
        {
          label: '👀 View Details',
          action: 'link',
          target: `${process.env.NEXT_PUBLIC_APP_URL}/products/${product.productId}`,
        },
        {
          label: '🛒 Add to Cart',
          action: 'post',
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames`,
        },
        {
          label: '❤️ Like',
          action: 'post',
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames`,
        },
        {
          label: '🔄 More Recs',
          action: 'post',
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames`,
        },
      ],
    },
    metadata: {
      productId: product.productId,
      recommendationScore: 0.85,
      context: 'in_store',
    },
  };

  return frameData;
}

async function generateOfferNotificationFrame(userId: string): Promise<FrameData> {
  // Generate a sample offer
  const offer: Offer = {
    offerId: `offer_${userId}_${Date.now()}`,
    userId,
    type: 'discount',
    title: '🎉 Special Offer Just for You!',
    description: 'Thanks for being a valued customer! Enjoy 20% off your next purchase.',
    discount: 20,
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: 'sent',
    createdAt: new Date(),
  };

  const frameData: FrameData = {
    frameId: `frame_offer_${userId}_${Date.now()}`,
    type: 'offer_notification',
    userId,
    content: {
      title: offer.title,
      description: `${offer.description}\n\n💸 ${offer.discount}% OFF\n⏰ Valid until ${offer.validUntil.toLocaleDateString()}\n\nDon't miss out on this exclusive deal!`,
      imageUrl: `https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=400&h=400&fit=crop`,
      buttons: [
        {
          label: '🛍️ Shop Now',
          action: 'link',
          target: `${process.env.NEXT_PUBLIC_APP_URL}/shop?offer=${offer.offerId}`,
        },
        {
          label: '📋 View Offer',
          action: 'post',
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames`,
        },
        {
          label: '📤 Share',
          action: 'post',
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames`,
        },
      ],
    },
    metadata: {
      offerId: offer.offerId,
      offerType: offer.type,
      discount: offer.discount,
    },
  };

  return frameData;
}

async function generateDisplayGreetingFrame(userId: string): Promise<FrameData> {
  const greetings = [
    'Welcome to our store! 🏪',
    'Great to see you again! 👋',
    'Hello, valued customer! ✨',
    'Welcome back! 🎉',
  ];

  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

  const frameData: FrameData = {
    frameId: `frame_greeting_${userId}_${Date.now()}`,
    type: 'display_greeting',
    userId,
    content: {
      title: randomGreeting,
      description: `We've prepared personalized recommendations just for you based on your preferences and shopping history.\n\n🎯 Tap below to discover items you'll love!`,
      imageUrl: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop`,
      buttons: [
        {
          label: '✨ Get Recommendations',
          action: 'post',
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames`,
        },
        {
          label: '🏪 Browse Store',
          action: 'link',
          target: `${process.env.NEXT_PUBLIC_APP_URL}/shop`,
        },
        {
          label: '🎁 View Offers',
          action: 'post',
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames`,
        },
      ],
    },
    metadata: {
      context: 'display',
      location: 'store_entrance',
    },
  };

  return frameData;
}

async function handleFrameAction(frameId: string, action: string, userId: string, body: any) {
  // Log the interaction
  console.log(`Frame interaction: ${frameId} - ${action} by ${userId}`);

  switch (action) {
    case 'add_to_cart':
      return await handleAddToCart(userId, body.productId);
    
    case 'like_product':
      return await handleLikeProduct(userId, body.productId);
    
    case 'get_recommendations':
      return await generateProductRecommendationFrame(userId);
    
    case 'view_offers':
      return await generateOfferNotificationFrame(userId);
    
    case 'share_offer':
      return await handleShareOffer(userId, body.offerId);
    
    default:
      return {
        message: 'Action processed successfully',
        frameId,
        action,
      };
  }
}

async function handleAddToCart(userId: string, productId: string) {
  // In a real app, this would add to cart in database
  console.log(`Adding product ${productId} to cart for user ${userId}`);
  
  return {
    message: 'Product added to cart successfully!',
    action: 'add_to_cart',
    productId,
    userId,
  };
}

async function handleLikeProduct(userId: string, productId: string) {
  // In a real app, this would save the interaction to database
  console.log(`User ${userId} liked product ${productId}`);
  
  return {
    message: 'Product liked! We\'ll use this to improve your recommendations.',
    action: 'like_product',
    productId,
    userId,
  };
}

async function handleShareOffer(userId: string, offerId: string) {
  // In a real app, this would handle offer sharing
  console.log(`User ${userId} shared offer ${offerId}`);
  
  return {
    message: 'Offer shared successfully!',
    action: 'share_offer',
    offerId,
    userId,
    shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/offers/${offerId}`,
  };
}
