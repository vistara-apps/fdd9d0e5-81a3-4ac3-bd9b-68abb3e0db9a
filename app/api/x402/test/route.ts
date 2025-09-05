import { NextRequest, NextResponse } from 'next/server';

// This is a mock x402-enabled endpoint for testing
// In a real implementation, you would use x402 middleware
export async function GET(request: NextRequest) {
  const paymentHeader = request.headers.get('x-payment');
  
  // Check if payment is provided
  if (!paymentHeader) {
    // Return 402 Payment Required with payment requirements
    return NextResponse.json(
      {
        error: 'Payment required',
        message: 'This endpoint requires payment to access',
        paymentRequirements: [
          {
            scheme: 'evm',
            network: 'base-sepolia',
            amount: '0.01', // $0.01 USDC
            currency: 'USDC',
            recipient: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', // Example recipient
            facilitator: 'https://facilitator.x402.org',
          }
        ]
      },
      { 
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, x-payment',
        }
      }
    );
  }

  // Mock payment verification
  // In a real implementation, you would verify the payment with a facilitator
  try {
    const paymentData = JSON.parse(paymentHeader);
    
    // Mock successful verification
    if (paymentData.scheme === 'evm' && paymentData.amount) {
      return NextResponse.json(
        {
          success: true,
          message: 'Payment verified successfully',
          data: {
            content: 'This is premium content accessible via x402 payment',
            timestamp: new Date().toISOString(),
            paymentAmount: paymentData.amount,
            transactionHash: '0x' + Math.random().toString(16).substr(2, 64), // Mock tx hash
          }
        },
        {
          headers: {
            'x-payment-response': JSON.stringify({
              verified: true,
              transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
              amount: paymentData.amount,
              currency: 'USDC',
              network: 'base-sepolia',
            }),
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Expose-Headers': 'x-payment-response',
          }
        }
      );
    }
  } catch (error) {
    console.error('Payment verification error:', error);
  }

  // Payment verification failed
  return NextResponse.json(
    {
      error: 'Payment verification failed',
      message: 'Invalid payment data provided'
    },
    { 
      status: 402,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    }
  );
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-payment',
      'Access-Control-Max-Age': '86400',
    },
  });
}
