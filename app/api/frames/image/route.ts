import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'welcome';
  const productId = searchParams.get('productId');
  const message = searchParams.get('message');
  const offerId = searchParams.get('offerId');

  try {
    let imageContent: string;

    switch (type) {
      case 'welcome':
        imageContent = generateWelcomeImage();
        break;
      case 'recommendation':
        imageContent = generateRecommendationImage(productId, message);
        break;
      case 'product':
        imageContent = await generateProductImage(productId);
        break;
      case 'offer':
        imageContent = await generateOfferImage(offerId);
        break;
      case 'share':
        imageContent = generateShareImage();
        break;
      case 'error':
        imageContent = generateErrorImage(message || 'An error occurred');
        break;
      default:
        imageContent = generateWelcomeImage();
    }

    return new NextResponse(imageContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Frame Image Generation Error:', error);
    return new NextResponse(generateErrorImage('Failed to generate image'), {
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  }
}

function generateWelcomeImage(): string {
  return `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(240 80% 50%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(240 10% 5%);stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:hsl(34 90% 55%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(240 80% 50%);stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- Logo/Icon -->
      <circle cx="600" cy="200" r="60" fill="url(#accent)" opacity="0.9"/>
      <text x="600" y="215" text-anchor="middle" fill="white" font-size="48" font-weight="bold">⚡</text>
      
      <!-- Title -->
      <text x="600" y="320" text-anchor="middle" fill="hsl(0 0% 95%)" font-size="64" font-weight="bold" font-family="system-ui">
        RetailRune
      </text>
      
      <!-- Subtitle -->
      <text x="600" y="380" text-anchor="middle" fill="hsl(0 0% 75%)" font-size="32" font-family="system-ui">
        AI-Powered Shopping Assistant
      </text>
      
      <!-- Description -->
      <text x="600" y="440" text-anchor="middle" fill="hsl(0 0% 75%)" font-size="24" font-family="system-ui">
        Personalized on-chain shopping experiences
      </text>
      
      <!-- Call to action -->
      <rect x="450" y="480" width="300" height="60" rx="30" fill="url(#accent)" opacity="0.8"/>
      <text x="600" y="520" text-anchor="middle" fill="white" font-size="24" font-weight="bold" font-family="system-ui">
        Get Started
      </text>
    </svg>
  `;
}

function generateRecommendationImage(productId?: string, message?: string): string {
  const displayMessage = message ? decodeURIComponent(message) : 'Here\'s a personalized recommendation for you!';
  
  return `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(240 10% 15%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(240 10% 5%);stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:hsl(34 90% 55%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(240 80% 50%);stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- AI Icon -->
      <circle cx="150" cy="150" r="40" fill="url(#accent)" opacity="0.9"/>
      <text x="150" y="165" text-anchor="middle" fill="white" font-size="32" font-weight="bold">🤖</text>
      
      <!-- Title -->
      <text x="250" y="170" fill="hsl(0 0% 95%)" font-size="48" font-weight="bold" font-family="system-ui">
        AI Recommendation
      </text>
      
      <!-- Product placeholder -->
      <rect x="100" y="220" width="200" height="200" rx="16" fill="hsl(240 10% 25%)" stroke="url(#accent)" stroke-width="2"/>
      <text x="200" y="330" text-anchor="middle" fill="hsl(0 0% 75%)" font-size="18" font-family="system-ui">
        Product Image
      </text>
      
      <!-- Message -->
      <foreignObject x="350" y="220" width="750" height="200">
        <div xmlns="http://www.w3.org/1999/xhtml" style="color: hsl(0 0% 95%); font-family: system-ui; font-size: 28px; line-height: 1.4; padding: 20px;">
          ${displayMessage.length > 100 ? displayMessage.substring(0, 100) + '...' : displayMessage}
        </div>
      </foreignObject>
      
      <!-- Product ID -->
      ${productId ? `
        <text x="600" y="480" text-anchor="middle" fill="hsl(0 0% 75%)" font-size="20" font-family="system-ui">
          Product: ${productId}
        </text>
      ` : ''}
      
      <!-- CTA -->
      <rect x="450" y="520" width="300" height="50" rx="25" fill="url(#accent)" opacity="0.8"/>
      <text x="600" y="555" text-anchor="middle" fill="white" font-size="20" font-weight="bold" font-family="system-ui">
        View Details
      </text>
    </svg>
  `;
}

async function generateProductImage(productId?: string): Promise<string> {
  // In a real implementation, you would fetch product data here
  const productName = productId ? `Product ${productId}` : 'Featured Product';
  
  return `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(240 10% 15%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(240 10% 5%);stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:hsl(34 90% 55%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(240 80% 50%);stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- Product Image Placeholder -->
      <rect x="100" y="100" width="400" height="400" rx="20" fill="hsl(240 10% 25%)" stroke="url(#accent)" stroke-width="3"/>
      <text x="300" y="320" text-anchor="middle" fill="hsl(0 0% 75%)" font-size="24" font-family="system-ui">
        🛍️ Product Image
      </text>
      
      <!-- Product Info -->
      <text x="550" y="180" fill="hsl(0 0% 95%)" font-size="48" font-weight="bold" font-family="system-ui">
        ${productName}
      </text>
      
      <text x="550" y="240" fill="hsl(0 0% 75%)" font-size="28" font-family="system-ui">
        Premium Quality Product
      </text>
      
      <text x="550" y="300" fill="url(#accent)" font-size="36" font-weight="bold" font-family="system-ui">
        $99.99
      </text>
      
      <!-- Features -->
      <text x="550" y="360" fill="hsl(0 0% 75%)" font-size="20" font-family="system-ui">
        ✓ High Quality Materials
      </text>
      <text x="550" y="390" fill="hsl(0 0% 75%)" font-size="20" font-family="system-ui">
        ✓ Fast Shipping
      </text>
      <text x="550" y="420" fill="hsl(0 0% 75%)" font-size="20" font-family="system-ui">
        ✓ 30-Day Return Policy
      </text>
      
      <!-- CTA -->
      <rect x="550" y="460" width="200" height="50" rx="25" fill="url(#accent)" opacity="0.9"/>
      <text x="650" y="495" text-anchor="middle" fill="white" font-size="20" font-weight="bold" font-family="system-ui">
        Learn More
      </text>
    </svg>
  `;
}

async function generateOfferImage(offerId?: string): Promise<string> {
  return `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(34 90% 55%);stop-opacity:0.2" />
          <stop offset="100%" style="stop-color:hsl(240 10% 5%);stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:hsl(34 90% 55%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(240 80% 50%);stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- Offer Badge -->
      <circle cx="200" cy="150" r="80" fill="url(#accent)" opacity="0.9"/>
      <text x="200" y="140" text-anchor="middle" fill="white" font-size="32" font-weight="bold" font-family="system-ui">
        20%
      </text>
      <text x="200" y="170" text-anchor="middle" fill="white" font-size="20" font-weight="bold" font-family="system-ui">
        OFF
      </text>
      
      <!-- Title -->
      <text x="350" y="170" fill="hsl(0 0% 95%)" font-size="56" font-weight="bold" font-family="system-ui">
        Special Offer!
      </text>
      
      <!-- Description -->
      <text x="150" y="280" fill="hsl(0 0% 95%)" font-size="32" font-family="system-ui">
        Exclusive discount just for you
      </text>
      
      <text x="150" y="330" fill="hsl(0 0% 75%)" font-size="24" font-family="system-ui">
        Valid until: 7 days from now
      </text>
      
      <!-- Offer ID -->
      ${offerId ? `
        <text x="150" y="380" fill="hsl(0 0% 75%)" font-size="18" font-family="system-ui">
          Offer ID: ${offerId}
        </text>
      ` : ''}
      
      <!-- Terms -->
      <text x="150" y="450" fill="hsl(0 0% 75%)" font-size="20" font-family="system-ui">
        • Valid for in-store purchases only
      </text>
      <text x="150" y="480" fill="hsl(0 0% 75%)" font-size="20" font-family="system-ui">
        • Cannot be combined with other offers
      </text>
      
      <!-- CTA -->
      <rect x="450" y="520" width="300" height="60" rx="30" fill="url(#accent)" opacity="0.9"/>
      <text x="600" y="560" text-anchor="middle" fill="white" font-size="24" font-weight="bold" font-family="system-ui">
        Redeem Now
      </text>
    </svg>
  `;
}

function generateShareImage(): string {
  return `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(240 80% 50%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(240 10% 5%);stop-opacity:1" />
        </linearGradient>
        <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:hsl(34 90% 55%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(240 80% 50%);stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- Share Icon -->
      <circle cx="600" cy="180" r="60" fill="url(#accent)" opacity="0.9"/>
      <text x="600" y="200" text-anchor="middle" fill="white" font-size="48" font-weight="bold">📤</text>
      
      <!-- Title -->
      <text x="600" y="300" text-anchor="middle" fill="hsl(0 0% 95%)" font-size="56" font-weight="bold" font-family="system-ui">
        Share RetailRune
      </text>
      
      <!-- Description -->
      <text x="600" y="360" text-anchor="middle" fill="hsl(0 0% 75%)" font-size="28" font-family="system-ui">
        Help others discover AI-powered shopping
      </text>
      
      <!-- Features -->
      <text x="600" y="420" text-anchor="middle" fill="hsl(0 0% 75%)" font-size="24" font-family="system-ui">
        🤖 AI Recommendations • 🛍️ Personalized Offers • ⚡ Base Integration
      </text>
      
      <!-- CTA -->
      <rect x="450" y="480" width="300" height="60" rx="30" fill="url(#accent)" opacity="0.8"/>
      <text x="600" y="520" text-anchor="middle" fill="white" font-size="24" font-weight="bold" font-family="system-ui">
        Cast About It
      </text>
    </svg>
  `;
}

function generateErrorImage(message: string): string {
  return `
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(0 50% 20%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(240 10% 5%);stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <rect width="1200" height="630" fill="url(#bg)"/>
      
      <!-- Error Icon -->
      <circle cx="600" cy="200" r="60" fill="hsl(0 70% 50%)" opacity="0.9"/>
      <text x="600" y="220" text-anchor="middle" fill="white" font-size="48" font-weight="bold">⚠️</text>
      
      <!-- Title -->
      <text x="600" y="320" text-anchor="middle" fill="hsl(0 0% 95%)" font-size="48" font-weight="bold" font-family="system-ui">
        Oops! Something went wrong
      </text>
      
      <!-- Message -->
      <foreignObject x="200" y="360" width="800" height="100">
        <div xmlns="http://www.w3.org/1999/xhtml" style="color: hsl(0 0% 75%); font-family: system-ui; font-size: 24px; text-align: center; line-height: 1.4;">
          ${message}
        </div>
      </foreignObject>
      
      <!-- CTA -->
      <rect x="450" y="520" width="300" height="60" rx="30" fill="hsl(0 70% 50%)" opacity="0.8"/>
      <text x="600" y="560" text-anchor="middle" fill="white" font-size="24" font-weight="bold" font-family="system-ui">
        Try Again
      </text>
    </svg>
  `;
}
