# RetailRune Deployment Guide

This guide covers deploying RetailRune to production environments.

## Prerequisites

Before deploying, ensure you have:

1. **API Keys**:
   - OpenAI API key for AI recommendations
   - Supabase project with database setup
   - Neynar API key for Farcaster integration
   - OnchainKit API key for Base integration

2. **Accounts**:
   - Vercel account (recommended) or other hosting platform
   - Domain name (optional but recommended)

## Environment Setup

### Required Environment Variables

Create a `.env.local` file (for local development) or set environment variables in your deployment platform:

```bash
# OnchainKit API Key (required for Base integration)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key_here

# OpenAI API Key (for AI recommendations)
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (for data storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Farcaster/Neynar API (for social features)
NEYNAR_API_KEY=your_neynar_api_key_here

# Base RPC URL (optional, defaults to public RPC)
NEXT_PUBLIC_RPC_URL=https://mainnet.base.org

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com/api
```

### Getting API Keys

#### 1. OnchainKit API Key
1. Visit [OnchainKit Dashboard](https://onchainkit.xyz)
2. Create an account and project
3. Generate API key for Base integration

#### 2. OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create account and add billing information
3. Generate API key in API Keys section
4. Set usage limits to control costs

#### 3. Supabase Setup
1. Create account at [Supabase](https://supabase.com)
2. Create new project
3. Get project URL and anon key from Settings > API
4. Set up database tables (see Database Setup section)

#### 4. Neynar API Key
1. Visit [Neynar](https://neynar.com)
2. Create developer account
3. Generate API key for Farcaster integration

## Database Setup (Supabase)

### Create Tables

Run these SQL commands in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  farcaster_profile JSONB,
  purchase_history JSONB DEFAULT '[]',
  interaction_log JSONB DEFAULT '[]',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  product_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  image_url TEXT,
  in_stock BOOLEAN DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interactions table
CREATE TABLE interactions (
  interaction_id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(user_id),
  product_id TEXT REFERENCES products(product_id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT NOT NULL CHECK (type IN ('view', 'like', 'scan', 'share', 'add_to_cart')),
  location TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Purchases table
CREATE TABLE purchases (
  purchase_id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(user_id),
  product_id TEXT REFERENCES products(product_id),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10,2) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  location TEXT,
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'crypto'))
);

-- Offers table
CREATE TABLE offers (
  offer_id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(user_id),
  product_id TEXT REFERENCES products(product_id),
  type TEXT NOT NULL CHECK (type IN ('discount', 'bogo', 'free_shipping', 'loyalty_points')),
  title TEXT NOT NULL,
  description TEXT,
  discount DECIMAL(5,2),
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'redeemed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  redeemed_at TIMESTAMP WITH TIME ZONE
);

-- Recommendations table
CREATE TABLE recommendations (
  recommendation_id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(user_id),
  product_id TEXT REFERENCES products(product_id),
  score DECIMAL(3,2) NOT NULL CHECK (score >= 0 AND score <= 1),
  reason TEXT,
  context TEXT CHECK (context IN ('in_store', 'follow_up', 'display')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  interacted BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX idx_interactions_user_id ON interactions(user_id);
CREATE INDEX idx_interactions_product_id ON interactions(product_id);
CREATE INDEX idx_interactions_timestamp ON interactions(timestamp);
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_offers_user_id ON offers(user_id);
CREATE INDEX idx_offers_valid_until ON offers(valid_until);
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
```

### Insert Sample Data

```sql
-- Insert sample products
INSERT INTO products (product_id, name, description, price, category, brand, image_url, tags) VALUES
('prod_001', 'Wireless Bluetooth Headphones', 'Premium noise-cancelling headphones with 30-hour battery life', 199.99, 'Electronics', 'AudioTech', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', ARRAY['wireless', 'bluetooth', 'noise-cancelling']),
('prod_002', 'Smart Fitness Tracker', 'Advanced fitness tracking with heart rate monitoring and GPS', 149.99, 'Sports & Outdoors', 'ZenFit', 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400', ARRAY['fitness', 'smart', 'gps']),
('prod_003', 'Organic Coffee Beans', 'Single-origin Ethiopian coffee beans, medium roast', 24.99, 'Food & Beverages', 'BrewMaster', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', ARRAY['organic', 'coffee', 'ethiopian']),
('prod_004', 'Ergonomic Office Chair', 'Adjustable lumbar support chair for home office', 299.99, 'Home & Garden', 'ComfortSeating', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', ARRAY['ergonomic', 'office', 'adjustable']),
('prod_005', 'Wireless Charging Pad', 'Fast wireless charging for smartphones and earbuds', 39.99, 'Electronics', 'PowerTech', 'https://images.unsplash.com/photo-1609592806596-4d8b5b1d7e7a?w=400', ARRAY['wireless', 'charging', 'fast']);
```

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides the best experience for Next.js applications.

#### Deploy via GitHub

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Environment Variables**:
   - In project settings, go to "Environment Variables"
   - Add all required environment variables
   - Make sure to set `NEXT_PUBLIC_APP_URL` to your Vercel domain

3. **Deploy**:
   - Vercel will automatically build and deploy
   - Every push to main branch triggers a new deployment

#### Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add OPENAI_API_KEY
vercel env add NEXT_PUBLIC_SUPABASE_URL
# ... add all other environment variables

# Redeploy with environment variables
vercel --prod
```

### Option 2: Netlify

1. **Connect Repository**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your repository

2. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables**:
   - Go to Site settings > Environment variables
   - Add all required variables

### Option 3: Railway

1. **Connect Repository**:
   - Go to [Railway](https://railway.app)
   - Create new project from GitHub repo

2. **Environment Variables**:
   - Add variables in project settings

3. **Custom Domain**:
   - Configure custom domain in settings

### Option 4: Self-Hosted (Docker)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:

```bash
# Build image
docker build -t retailrune .

# Run container
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=your_key \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  # ... other environment variables
  retailrune
```

## Domain Configuration

### Custom Domain Setup

1. **Purchase Domain**: Buy domain from registrar (Namecheap, GoDaddy, etc.)

2. **DNS Configuration**:
   - Point A record to your hosting provider's IP
   - Or add CNAME record to hosting provider's domain

3. **SSL Certificate**: Most hosting providers auto-provision SSL certificates

### Subdomain Setup

For development/staging environments:
- `staging.retailrune.com` → staging deployment
- `api.retailrune.com` → API documentation
- `admin.retailrune.com` → admin dashboard

## Performance Optimization

### 1. Image Optimization

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
```

### 2. Caching Strategy

```javascript
// Add to API routes
export async function GET() {
  const data = await fetchData();
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  });
}
```

### 3. Database Optimization

- Add database indexes for frequently queried fields
- Use connection pooling
- Implement query optimization

## Monitoring & Analytics

### 1. Error Tracking

Add Sentry for error tracking:

```bash
npm install @sentry/nextjs
```

```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### 2. Performance Monitoring

- Use Vercel Analytics
- Google Analytics 4
- Custom metrics dashboard

### 3. Uptime Monitoring

- UptimeRobot
- Pingdom
- Custom health check endpoints

## Security Considerations

### 1. API Security

```javascript
// Rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### 2. Environment Variables

- Never commit `.env` files
- Use different keys for development/production
- Rotate API keys regularly

### 3. CORS Configuration

```javascript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE' },
        ],
      },
    ];
  },
};
```

## Backup & Recovery

### 1. Database Backups

- Enable automated backups in Supabase
- Set up daily backup schedule
- Test restore procedures

### 2. Code Backups

- Use Git for version control
- Multiple remote repositories
- Regular commits and tags

### 3. Environment Backups

- Document all environment variables
- Store securely (1Password, AWS Secrets Manager)
- Regular configuration audits

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check environment variables
   - Verify API keys
   - Review build logs

2. **API Errors**:
   - Check API key validity
   - Verify network connectivity
   - Review rate limits

3. **Database Connection Issues**:
   - Check Supabase project status
   - Verify connection strings
   - Review database logs

### Debug Mode

Enable debug logging:

```bash
# Development
DEBUG=* npm run dev

# Production
NODE_ENV=production DEBUG=app:* npm start
```

## Support

For deployment support:
- Documentation: This guide
- Community: GitHub Discussions
- Issues: GitHub Issues
- Email: support@retailrune.com

## Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Database tables created and populated
- [ ] API keys tested and working
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Error tracking setup
- [ ] Monitoring configured
- [ ] Backup strategy implemented
- [ ] Security measures in place
- [ ] Performance optimized
- [ ] Documentation updated
