import OpenAI from 'openai';
import { User, Product, Interaction } from './types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface RecommendationRequest {
  userId: string;
  context: 'in_store' | 'follow_up' | 'browsing';
  userProfile?: User;
  recentInteractions?: Interaction[];
  availableProducts?: Product[];
  location?: string;
}

export interface RecommendationResponse {
  recommendations: Array<{
    productId: string;
    score: number;
    reasoning: string;
    category: string;
  }>;
  personalizedMessage: string;
  confidence: number;
}

export class AIRecommendationService {
  static async generateRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    try {
      const prompt = this.buildRecommendationPrompt(request);
      
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI retail assistant for RetailRune, specializing in personalized product recommendations. 
            You analyze customer behavior, preferences, and context to provide highly relevant product suggestions.
            Always respond with valid JSON matching the RecommendationResponse interface.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      return JSON.parse(response) as RecommendationResponse;
    } catch (error) {
      console.error('AI Recommendation Error:', error);
      return this.getFallbackRecommendations(request);
    }
  }

  static async generateFollowUpOffer(
    userId: string,
    purchaseHistory: any[],
    userPreferences: any
  ): Promise<{
    offerType: string;
    discount: number;
    message: string;
    validUntil: Date;
  }> {
    try {
      const prompt = `
        Generate a personalized follow-up offer for a customer based on their purchase history and preferences.
        
        Purchase History: ${JSON.stringify(purchaseHistory)}
        User Preferences: ${JSON.stringify(userPreferences)}
        
        Respond with JSON containing:
        - offerType: string (discount, bundle, loyalty_points, etc.)
        - discount: number (percentage or fixed amount)
        - message: string (personalized message)
        - validUntil: ISO date string (7 days from now)
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a retail marketing AI that creates personalized offers to increase customer loyalty and repeat purchases.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const offer = JSON.parse(response);
      return {
        ...offer,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      };
    } catch (error) {
      console.error('Follow-up Offer Generation Error:', error);
      return {
        offerType: 'discount',
        discount: 10,
        message: 'Thank you for your purchase! Enjoy 10% off your next visit.',
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      };
    }
  }

  private static buildRecommendationPrompt(request: RecommendationRequest): string {
    const { userId, context, userProfile, recentInteractions, availableProducts, location } = request;

    return `
      Generate personalized product recommendations for a retail customer.
      
      Context: ${context}
      User ID: ${userId}
      Location: ${location || 'Unknown'}
      
      User Profile:
      ${userProfile ? JSON.stringify(userProfile, null, 2) : 'No profile data available'}
      
      Recent Interactions:
      ${recentInteractions ? JSON.stringify(recentInteractions, null, 2) : 'No recent interactions'}
      
      Available Products:
      ${availableProducts ? JSON.stringify(availableProducts.slice(0, 20), null, 2) : 'No product data available'}
      
      Please provide recommendations in the following JSON format:
      {
        "recommendations": [
          {
            "productId": "string",
            "score": number (0-1),
            "reasoning": "string explaining why this product is recommended",
            "category": "string"
          }
        ],
        "personalizedMessage": "string - a friendly, personalized message to the customer",
        "confidence": number (0-1)
      }
      
      Limit to 3-5 recommendations, prioritize relevance and personalization.
    `;
  }

  private static getFallbackRecommendations(request: RecommendationRequest): RecommendationResponse {
    // Fallback recommendations when AI service fails
    const fallbackProducts = request.availableProducts?.slice(0, 3) || [];
    
    return {
      recommendations: fallbackProducts.map((product, index) => ({
        productId: product.productId,
        score: 0.7 - (index * 0.1),
        reasoning: `Popular item in ${product.category} category`,
        category: product.category
      })),
      personalizedMessage: "Welcome! Here are some popular items you might like.",
      confidence: 0.6
    };
  }
}
