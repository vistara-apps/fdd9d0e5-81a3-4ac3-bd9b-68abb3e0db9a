import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const FrameActionSchema = z.object({
  untrustedData: z.object({
    fid: z.number(),
    url: z.string(),
    messageHash: z.string(),
    timestamp: z.number(),
    network: z.number(),
    buttonIndex: z.number(),
    inputText: z.string().optional(),
    castId: z.object({
      fid: z.number(),
      hash: z.string(),
    }).optional(),
  }),
  trustedData: z.object({
    messageBytes: z.string(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const frameData = FrameActionSchema.parse(body);
    
    const { untrustedData } = frameData;
    const { buttonIndex, fid, inputText } = untrustedData;

    // Handle different frame actions based on button index
    switch (buttonIndex) {
      case 1: // Scan QR Code / Get Recommendations
        return handleRecommendationFrame(fid, inputText);
      
      case 2: // View Product Details
        return handleProductFrame(fid, inputText);
      
      case 3: // Redeem Offer
        return handleOfferFrame(fid, inputText);
      
      case 4: // Share / Follow-up
        return handleShareFrame(fid);
      
      default:
        return generateWelcomeFrame();
    }
  } catch (error) {
    console.error('Frame Action Error:', error);
    return generateErrorFrame('Something went wrong. Please try again.');
  }
}

export async function GET(request: NextRequest) {
  // Return the initial frame
  return generateWelcomeFrame();
}

async function handleRecommendationFrame(fid: number, storeId?: string) {
  try {
    // Generate recommendations for the user
    const userId = `farcaster_${fid}`;
    
    // Call our recommendations API
    const recommendationsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        context: 'in_store',
        storeId: storeId || 'demo_store',
      }),
    });

    const recommendations = await recommendationsResponse.json();
    
    if (recommendations.success && recommendations.data.recommendations.length > 0) {
      const topRecommendation = recommendations.data.recommendations[0];
      
      return new NextResponse(
        generateFrameHTML({
          title: 'AI Recommendation',
          image: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames/image/recommendation?productId=${topRecommendation.productId}&message=${encodeURIComponent(recommendations.data.personalizedMessage)}`,
          buttons: [
            { text: 'View Details', action: 'post' },
            { text: 'Get More', action: 'post' },
            { text: 'Share', action: 'post' },
            { text: 'Back', action: 'post' },
          ],
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames`,
          inputText: topRecommendation.productId,
        }),
        {
          headers: { 'Content-Type': 'text/html' },
        }
      );
    } else {
      return generateErrorFrame('No recommendations available at this time.');
    }
  } catch (error) {
    console.error('Recommendation Frame Error:', error);
    return generateErrorFrame('Failed to get recommendations.');
  }
}

async function handleProductFrame(fid: number, productId?: string) {
  if (!productId) {
    return generateErrorFrame('Product not found.');
  }

  try {
    // Fetch product details
    const productResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?productId=${productId}`);
    const productData = await productResponse.json();

    if (productData.success && productData.data) {
      const product = productData.data;
      
      return new NextResponse(
        generateFrameHTML({
          title: product.name,
          image: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames/image/product?productId=${productId}`,
          buttons: [
            { text: 'Like', action: 'post' },
            { text: 'Get Offer', action: 'post' },
            { text: 'More Info', action: 'link', target: `${process.env.NEXT_PUBLIC_APP_URL}/product/${productId}` },
            { text: 'Back', action: 'post' },
          ],
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames`,
          inputText: productId,
        }),
        {
          headers: { 'Content-Type': 'text/html' },
        }
      );
    } else {
      return generateErrorFrame('Product not found.');
    }
  } catch (error) {
    console.error('Product Frame Error:', error);
    return generateErrorFrame('Failed to load product details.');
  }
}

async function handleOfferFrame(fid: number, offerId?: string) {
  if (!offerId) {
    return generateErrorFrame('Offer not found.');
  }

  try {
    const userId = `farcaster_${fid}`;
    
    // Fetch offer details
    const offerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/offers?offerId=${offerId}&userId=${userId}`);
    const offerData = await offerResponse.json();

    if (offerData.success && offerData.data) {
      const offer = offerData.data;
      
      return new NextResponse(
        generateFrameHTML({
          title: 'Special Offer',
          image: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames/image/offer?offerId=${offerId}`,
          buttons: [
            { text: 'Redeem Now', action: 'post' },
            { text: 'Save for Later', action: 'post' },
            { text: 'Share', action: 'post' },
            { text: 'Back', action: 'post' },
          ],
          postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames`,
          inputText: offerId,
        }),
        {
          headers: { 'Content-Type': 'text/html' },
        }
      );
    } else {
      return generateErrorFrame('Offer not found or expired.');
    }
  } catch (error) {
    console.error('Offer Frame Error:', error);
    return generateErrorFrame('Failed to load offer details.');
  }
}

async function handleShareFrame(fid: number) {
  return new NextResponse(
    generateFrameHTML({
      title: 'Share RetailRune',
      image: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames/image/share`,
      buttons: [
        { text: 'Cast About It', action: 'link', target: `https://warpcast.com/~/compose?text=Just%20discovered%20RetailRune%20-%20AI-powered%20shopping%20recommendations%20on%20Base!%20%F0%9F%9B%8D%EF%B8%8F%E2%9C%A8&embeds[]=${process.env.NEXT_PUBLIC_APP_URL}` },
        { text: 'Get Recommendations', action: 'post' },
        { text: 'Learn More', action: 'link', target: process.env.NEXT_PUBLIC_APP_URL },
        { text: 'Back', action: 'post' },
      ],
      postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames`,
    }),
    {
      headers: { 'Content-Type': 'text/html' },
    }
  );
}

function generateWelcomeFrame() {
  return new NextResponse(
    generateFrameHTML({
      title: 'RetailRune - AI Shopping Assistant',
      image: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames/image/welcome`,
      buttons: [
        { text: 'Get Recommendations', action: 'post' },
        { text: 'View Offers', action: 'post' },
        { text: 'Learn More', action: 'link', target: process.env.NEXT_PUBLIC_APP_URL },
        { text: 'Share', action: 'post' },
      ],
      postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames`,
    }),
    {
      headers: { 'Content-Type': 'text/html' },
    }
  );
}

function generateErrorFrame(message: string) {
  return new NextResponse(
    generateFrameHTML({
      title: 'Error',
      image: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames/image/error?message=${encodeURIComponent(message)}`,
      buttons: [
        { text: 'Try Again', action: 'post' },
        { text: 'Go Home', action: 'post' },
      ],
      postUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/frames`,
    }),
    {
      headers: { 'Content-Type': 'text/html' },
    }
  );
}

interface FrameButton {
  text: string;
  action: 'post' | 'link';
  target?: string;
}

interface FrameConfig {
  title: string;
  image: string;
  buttons: FrameButton[];
  postUrl: string;
  inputText?: string;
}

function generateFrameHTML(config: FrameConfig): string {
  const { title, image, buttons, postUrl, inputText } = config;
  
  const buttonTags = buttons.map((button, index) => {
    const buttonIndex = index + 1;
    if (button.action === 'link') {
      return `
        <meta property="fc:frame:button:${buttonIndex}" content="${button.text}" />
        <meta property="fc:frame:button:${buttonIndex}:action" content="link" />
        <meta property="fc:frame:button:${buttonIndex}:target" content="${button.target}" />
      `;
    } else {
      return `
        <meta property="fc:frame:button:${buttonIndex}" content="${button.text}" />
        <meta property="fc:frame:button:${buttonIndex}:action" content="post" />
      `;
    }
  }).join('');

  const inputTag = inputText ? `<meta property="fc:frame:input:text" content="Enter ${inputText}" />` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:title" content="${title}" />
        <meta property="fc:frame:image" content="${image}" />
        <meta property="fc:frame:post_url" content="${postUrl}" />
        ${buttonTags}
        ${inputTag}
        <meta property="og:title" content="${title}" />
        <meta property="og:image" content="${image}" />
        <meta property="og:description" content="RetailRune - Personalized on-chain shopping experiences" />
      </head>
      <body>
        <h1>${title}</h1>
        <img src="${image}" alt="${title}" style="max-width: 100%; height: auto;" />
        <p>RetailRune - AI-powered personalized shopping recommendations on Base</p>
      </body>
    </html>
  `;
}
