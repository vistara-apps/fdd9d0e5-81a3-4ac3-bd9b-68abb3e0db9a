# RetailRune API Documentation

This document provides comprehensive documentation for the RetailRune API endpoints.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Currently, the API uses simple user identification via `userId` parameters. In production, this would be replaced with proper authentication tokens.

## Endpoints

### 1. Recommendations API

#### Generate AI Recommendations

**POST** `/api/recommendations`

Generate personalized product recommendations using AI.

**Request Body:**
```json
{
  "userId": "string",
  "context": "in_store" | "follow_up" | "display",
  "currentLocation": "string (optional)",
  "recentInteractions": "array (optional)",
  "purchaseHistory": "array (optional)",
  "availableProducts": "array (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "product": {
          "productId": "string",
          "name": "string",
          "description": "string",
          "price": "number",
          "category": "string",
          "imageUrl": "string"
        },
        "score": "number (0-1)",
        "reason": "string"
      }
    ],
    "personalizedMessage": "string"
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "demo_user",
    "context": "in_store",
    "currentLocation": "electronics"
  }'
```

### 2. Offers API

#### Generate Follow-up Offer

**POST** `/api/offers`

Generate a personalized follow-up offer after a purchase.

**Request Body:**
```json
{
  "userId": "string",
  "purchaseData": {
    "productId": "string",
    "quantity": "number",
    "totalAmount": "number",
    "paymentMethod": "cash" | "card" | "crypto"
  },
  "userProfile": "object (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "offerId": "string",
    "userId": "string",
    "type": "discount" | "bogo" | "free_shipping" | "loyalty_points",
    "title": "string",
    "description": "string",
    "discount": "number",
    "validUntil": "string (ISO date)",
    "status": "sent",
    "createdAt": "string (ISO date)"
  }
}
```

#### Get User Offers

**GET** `/api/offers?userId={userId}`

Retrieve active offers for a user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "offerId": "string",
      "userId": "string",
      "type": "discount",
      "title": "string",
      "description": "string",
      "discount": "number",
      "validUntil": "string (ISO date)",
      "status": "sent" | "viewed" | "redeemed" | "expired",
      "createdAt": "string (ISO date)"
    }
  ]
}
```

### 3. Farcaster Frames API

#### Generate Frame

**GET** `/api/frames?type={frameType}&userId={userId}&productId={productId}`

Generate a Farcaster frame for different contexts.

**Parameters:**
- `type`: `product_recommendation` | `offer_notification` | `display_greeting`
- `userId`: User identifier
- `productId`: Product identifier (optional, for product recommendations)

**Response:**
```json
{
  "success": true,
  "data": {
    "frameId": "string",
    "type": "string",
    "userId": "string",
    "content": {
      "title": "string",
      "description": "string",
      "imageUrl": "string",
      "buttons": [
        {
          "label": "string",
          "action": "link" | "post" | "mint",
          "target": "string (optional)",
          "postUrl": "string (optional)"
        }
      ]
    },
    "metadata": "object"
  }
}
```

#### Handle Frame Action

**POST** `/api/frames`

Process user interactions with Farcaster frames.

**Request Body:**
```json
{
  "frameId": "string",
  "action": "string",
  "userId": "string",
  "productId": "string (optional)",
  "offerId": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "string",
    "action": "string",
    "frameId": "string"
  }
}
```

### 4. Analytics API

#### Get Store Metrics

**GET** `/api/analytics?type=metrics&storeId={storeId}`

Retrieve store performance metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCustomers": "number",
    "activeRecommendations": "number",
    "conversionRate": "number",
    "averageOrderValue": "number",
    "topProducts": "array",
    "recentActivity": [
      {
        "interactionId": "string",
        "userId": "string",
        "productId": "string",
        "timestamp": "string (ISO date)",
        "type": "view" | "like" | "scan" | "share" | "add_to_cart",
        "location": "string"
      }
    ]
  }
}
```

#### Get Analytics Data

**GET** `/api/analytics?type=analytics&period={period}`

Retrieve detailed analytics data for a specific period.

**Parameters:**
- `period`: `day` | `week` | `month`

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "string",
    "metrics": {
      "impressions": "number",
      "clicks": "number",
      "conversions": "number",
      "revenue": "number"
    },
    "trends": [
      {
        "date": "string (ISO date)",
        "value": "number"
      }
    ]
  }
}
```

#### Record Interaction

**POST** `/api/analytics`

Record a user interaction for analytics.

**Request Body:**
```json
{
  "type": "interaction",
  "data": {
    "userId": "string",
    "productId": "string",
    "type": "view" | "like" | "scan" | "share" | "add_to_cart",
    "location": "string (optional)",
    "metadata": "object (optional)"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "interactionId": "string"
  }
}
```

#### Record Purchase

**POST** `/api/analytics`

Record a purchase for analytics and trigger follow-up offers.

**Request Body:**
```json
{
  "type": "purchase",
  "data": {
    "userId": "string",
    "productId": "string",
    "quantity": "number",
    "totalAmount": "number",
    "paymentMethod": "cash" | "card" | "crypto",
    "location": "string (optional)"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "purchaseId": "string"
  }
}
```

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Authentication required
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server error

## Rate Limiting

Currently, no rate limiting is implemented. In production, consider implementing rate limiting based on:
- IP address
- User ID
- API key

## Environment Variables

The following environment variables are required:

```bash
# OpenAI API Key (for AI recommendations)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (for data storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Farcaster/Neynar API (for social features)
NEYNAR_API_KEY=your_neynar_api_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Integration Examples

### Frontend Integration

```javascript
// Generate recommendations
const getRecommendations = async (userId, context) => {
  const response = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, context })
  });
  
  const result = await response.json();
  if (result.success) {
    return result.data.recommendations;
  }
  throw new Error(result.error);
};

// Record interaction
const recordInteraction = async (userId, productId, type) => {
  await fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'interaction',
      data: { userId, productId, type }
    })
  });
};
```

### Webhook Integration

For real-time updates, consider implementing webhooks for:
- New purchases (trigger follow-up offers)
- High-value interactions (trigger personalized outreach)
- Inventory changes (update recommendations)

## Future Enhancements

Planned API improvements:
1. **Authentication**: JWT-based authentication
2. **Real-time**: WebSocket support for live updates
3. **Batch Operations**: Bulk data processing endpoints
4. **Advanced Analytics**: Machine learning insights
5. **Multi-store**: Support for multiple store locations
6. **A/B Testing**: Recommendation algorithm testing

## Support

For API support and questions:
- Documentation: This file
- Issues: Create GitHub issue
- Email: api-support@retailrune.com
