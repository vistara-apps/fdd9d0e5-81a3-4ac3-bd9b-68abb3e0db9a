// App configuration constants
export const APP_CONFIG = {
  name: 'RetailRune',
  tagline: 'Personalized on-chain shopping experiences',
  version: '1.0.0',
  supportEmail: 'support@retailrune.com',
} as const;

// API endpoints and configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  retryAttempts: 3,
} as const;

// Blockchain configuration
export const BLOCKCHAIN_CONFIG = {
  chainId: 8453, // Base mainnet
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://mainnet.base.org',
  explorerUrl: 'https://basescan.org',
} as const;

// AI and recommendation settings
export const AI_CONFIG = {
  maxRecommendations: 5,
  minConfidenceScore: 0.3,
  contextWindow: 7, // days
  defaultModel: 'gpt-3.5-turbo',
} as const;

// Product categories
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports & Outdoors',
  'Books',
  'Beauty & Personal Care',
  'Toys & Games',
  'Automotive',
  'Health & Wellness',
  'Food & Beverages',
] as const;

// Offer types
export const OFFER_TYPES = {
  DISCOUNT: 'discount',
  BOGO: 'bogo',
  FREE_SHIPPING: 'free_shipping',
  LOYALTY_POINTS: 'loyalty_points',
} as const;

// Interaction types
export const INTERACTION_TYPES = {
  VIEW: 'view',
  LIKE: 'like',
  SCAN: 'scan',
  SHARE: 'share',
  ADD_TO_CART: 'add_to_cart',
} as const;

// Frame types for Farcaster integration
export const FRAME_TYPES = {
  PRODUCT_RECOMMENDATION: 'product_recommendation',
  OFFER_NOTIFICATION: 'offer_notification',
  DISPLAY_GREETING: 'display_greeting',
} as const;

// UI constants
export const UI_CONFIG = {
  maxProductsPerPage: 12,
  maxOffersPerUser: 10,
  animationDuration: {
    fast: 150,
    base: 250,
    slow: 400,
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
} as const;

// Sample data for development
export const SAMPLE_PRODUCTS = [
  {
    productId: 'prod_1',
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.',
    price: 199.99,
    category: 'Electronics',
    brand: 'AudioTech',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    inStock: true,
    tags: ['wireless', 'bluetooth', 'noise-cancelling'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    productId: 'prod_2',
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable, sustainable organic cotton t-shirt in multiple colors.',
    price: 29.99,
    category: 'Clothing',
    brand: 'EcoWear',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    inStock: true,
    tags: ['organic', 'cotton', 'sustainable'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    productId: 'prod_3',
    name: 'Smart Home Security Camera',
    description: '1080p HD security camera with night vision and mobile app control.',
    price: 89.99,
    category: 'Electronics',
    brand: 'SecureHome',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    inStock: true,
    tags: ['smart', 'security', 'camera', '1080p'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    productId: 'prod_4',
    name: 'Yoga Mat Premium',
    description: 'Non-slip premium yoga mat with alignment guides and carrying strap.',
    price: 49.99,
    category: 'Sports & Outdoors',
    brand: 'ZenFit',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400',
    inStock: true,
    tags: ['yoga', 'fitness', 'non-slip', 'premium'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
] as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  UNAUTHORIZED: 'You need to connect your wallet to access this feature.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  GENERIC: 'Something went wrong. Please try again later.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  RECOMMENDATION_GENERATED: 'Personalized recommendations generated successfully!',
  OFFER_SENT: 'Offer sent successfully!',
  INTERACTION_RECORDED: 'Your interaction has been recorded.',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PURCHASE_COMPLETED: 'Purchase completed successfully!',
} as const;
