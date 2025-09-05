import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AIRecommendationRequest, AIRecommendationResponse, Product } from '@/lib/types';
import { SAMPLE_PRODUCTS } from '@/lib/constants';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body: AIRecommendationRequest = await request.json();
    const { userId, context, currentLocation, recentInteractions, purchaseHistory, availableProducts } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Use available products or fallback to sample products
    const products = availableProducts || SAMPLE_PRODUCTS;

    // Generate AI recommendations using OpenAI
    const recommendations = await generateAIRecommendations({
      userId,
      context,
      products,
      recentInteractions: recentInteractions || [],
      purchaseHistory: purchaseHistory || [],
      currentLocation,
    });

    const response: AIRecommendationResponse = {
      recommendations,
      personalizedMessage: generatePersonalizedMessage(context, recommendations.length),
    };

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error('Recommendation API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

async function generateAIRecommendations({
  userId,
  context,
  products,
  recentInteractions,
  purchaseHistory,
  currentLocation,
}: {
  userId: string;
  context: string;
  products: Product[];
  recentInteractions: any[];
  purchaseHistory: any[];
  currentLocation?: string;
}) {
  try {
    // Create context for AI
    const userContext = {
      recentInteractions: recentInteractions.slice(-5), // Last 5 interactions
      purchaseHistory: purchaseHistory.slice(-3), // Last 3 purchases
      currentLocation,
      context,
    };

    const prompt = `
You are an AI retail assistant for RetailRune. Generate personalized product recommendations for a customer.

Customer Context:
- User ID: ${userId}
- Context: ${context}
- Location: ${currentLocation || 'Unknown'}
- Recent Interactions: ${JSON.stringify(userContext.recentInteractions)}
- Purchase History: ${JSON.stringify(userContext.purchaseHistory)}

Available Products:
${JSON.stringify(products.map(p => ({
  id: p.productId,
  name: p.name,
  category: p.category,
  price: p.price,
  description: p.description,
  tags: p.tags,
})))}

Please recommend 3-5 products with scores (0-1) and reasons. Consider:
1. User's past purchases and interactions
2. Product categories they've shown interest in
3. Price points they're comfortable with
4. Context (in-store, follow-up, display)
5. Complementary products to previous purchases

Return a JSON array with this structure:
[
  {
    "productId": "product_id",
    "score": 0.85,
    "reason": "Detailed reason for recommendation"
  }
]
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful retail AI assistant that provides personalized product recommendations. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    // Parse AI response
    let aiRecommendations;
    try {
      aiRecommendations = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Fallback to rule-based recommendations
      return generateFallbackRecommendations(products, userContext);
    }

    // Map AI recommendations to full product data
    const recommendations = aiRecommendations
      .map((rec: any) => {
        const product = products.find(p => p.productId === rec.productId);
        if (!product) return null;

        return {
          product,
          score: Math.min(Math.max(rec.score || 0.5, 0), 1), // Ensure score is between 0-1
          reason: rec.reason || 'Recommended based on your preferences',
        };
      })
      .filter(Boolean)
      .slice(0, 5); // Limit to 5 recommendations

    return recommendations;

  } catch (error) {
    console.error('AI recommendation error:', error);
    // Fallback to rule-based recommendations
    return generateFallbackRecommendations(products, {
      recentInteractions,
      purchaseHistory,
      currentLocation,
      context,
    });
  }
}

function generateFallbackRecommendations(products: Product[], userContext: any) {
  // Simple rule-based fallback
  const recommendations = products
    .map(product => {
      let score = 0.5; // Base score
      let reasons = [];

      // Boost score based on recent interactions
      const hasInteracted = userContext.recentInteractions?.some(
        (interaction: any) => interaction.productId === product.productId
      );
      if (hasInteracted) {
        score += 0.2;
        reasons.push('you showed interest in this item');
      }

      // Boost score for similar categories
      const purchasedCategories = userContext.purchaseHistory?.map(
        (purchase: any) => purchase.category
      ) || [];
      if (purchasedCategories.includes(product.category)) {
        score += 0.15;
        reasons.push(`matches your interest in ${product.category}`);
      }

      // Context-based scoring
      if (userContext.context === 'in_store' && product.inStock) {
        score += 0.1;
        reasons.push('available in store');
      }

      // Random factor for diversity
      score += Math.random() * 0.1;

      const reason = reasons.length > 0 
        ? `Recommended because ${reasons.join(' and ')}.`
        : 'Popular item that matches your profile.';

      return {
        product,
        score: Math.min(score, 1),
        reason,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return recommendations;
}

function generatePersonalizedMessage(context: string, count: number): string {
  const messages = {
    in_store: [
      `Welcome! I found ${count} perfect items for you based on your preferences.`,
      `Great to see you! Here are ${count} personalized recommendations.`,
      `Hello! I've curated ${count} special items that match your style.`,
    ],
    follow_up: [
      `Thanks for your recent visit! Here are ${count} items you might love.`,
      `We miss you! Check out these ${count} new arrivals picked for you.`,
      `Based on your last purchase, here are ${count} complementary items.`,
    ],
    display: [
      `Personalized for you: ${count} trending items in your categories.`,
      `Your style, your picks: ${count} curated recommendations.`,
      `Discover ${count} items tailored to your preferences.`,
    ],
  };

  const contextMessages = messages[context as keyof typeof messages] || messages.in_store;
  return contextMessages[Math.floor(Math.random() * contextMessages.length)];
}
