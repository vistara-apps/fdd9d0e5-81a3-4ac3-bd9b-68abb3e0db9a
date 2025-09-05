# RetailRune 🛍️⚡

**Personalized on-chain shopping experiences powered by AI**

RetailRune is a cutting-edge Base Mini App that revolutionizes retail shopping through AI-powered product recommendations and personalized follow-up offers. Built for the Base ecosystem, it seamlessly integrates blockchain technology with intelligent shopping assistance.

## Features

- **AI Product Recommender**: Real-time personalized product recommendations using customer interaction data
- **Personalized Follow-up Offers**: Targeted offers and content delivery via Farcaster integration
- **Interactive Digital Displays**: QR code-triggered personalized greetings and recommendations
- **Store Analytics**: Real-time metrics and customer behavior insights
- **Base Integration**: Native blockchain functionality with OnchainKit and MiniKit

## Tech Stack

- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Blockchain**: Base (Coinbase L2), OnchainKit, MiniKit
- **AI**: OpenAI GPT for recommendation generation
- **Social**: Farcaster integration for social commerce
- **Database**: Supabase for application data storage

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Base wallet for testing
- API keys for external services (see Environment Variables)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd retailrune
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your API keys:
- `NEXT_PUBLIC_ONCHAINKIT_API_KEY`: Your OnchainKit API key
- `OPENAI_API_KEY`: OpenAI API key for AI recommendations
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEYNAR_API_KEY`: Neynar API key for Farcaster integration

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Architecture

### Data Model

- **User**: On-chain address, Farcaster profile, purchase history, preferences
- **Product**: Catalog items with metadata, pricing, and inventory status
- **Interaction**: Customer engagement tracking (views, likes, scans)
- **Offer**: Personalized promotions with redemption tracking
- **Recommendation**: AI-generated product suggestions with confidence scores

### Core Components

- **RecommendationEngine**: AI-powered product suggestion system
- **ProductCard**: Interactive product display with engagement tracking
- **OfferCard**: Personalized offer presentation and redemption
- **StoreMetrics**: Real-time analytics dashboard
- **AppShell**: Main application layout with navigation

### User Flows

1. **In-Store Recommendation Flow**:
   - Customer scans QR code → Farcaster frame action → Profile access → AI recommendation → Product display

2. **Post-Purchase Follow-up Flow**:
   - Purchase completion → Customer identification → AI offer generation → Farcaster delivery → Redemption

## API Integration

### Required APIs

- **OnchainKit/MiniKit**: Base blockchain integration
- **OpenAI**: AI recommendation generation
- **Neynar**: Farcaster social features
- **Supabase**: Data storage and management
- **Airstack**: On-chain data aggregation (optional)

### Environment Variables

See `.env.example` for all required environment variables.

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

## Development

### Project Structure

```
├── app/                    # Next.js App Router pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                  # Utilities and types
├── public/               # Static assets
└── README.md
```

### Key Files

- `app/providers.tsx`: MiniKit provider configuration
- `lib/types.ts`: TypeScript type definitions
- `lib/constants.ts`: App configuration and sample data
- `components/features/RecommendationEngine.tsx`: Core AI recommendation logic

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Contact: support@retailrune.com
- Documentation: [Link to docs]

## Roadmap

- [ ] Advanced AI recommendation algorithms
- [ ] Multi-store management
- [ ] Customer loyalty token system
- [ ] Mobile app companion
- [ ] Advanced analytics dashboard
- [ ] Integration with major POS systems
