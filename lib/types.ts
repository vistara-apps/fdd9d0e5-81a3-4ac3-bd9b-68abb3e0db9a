// Core data model types
export interface User {
  userId: string; // on-chain address
  farcasterProfile?: {
    fid: number;
    username: string;
    displayName: string;
    avatar?: string;
  };
  purchaseHistory: Purchase[];
  interactionLog: Interaction[];
  preferences: {
    categories: string[];
    priceRange: [number, number];
    brands: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  imageUrl?: string;
  inStock: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Interaction {
  interactionId: string;
  userId: string;
  productId: string;
  timestamp: Date;
  type: 'view' | 'like' | 'scan' | 'share' | 'add_to_cart';
  location?: string;
  metadata?: Record<string, any>;
}

export interface Purchase {
  purchaseId: string;
  userId: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  timestamp: Date;
  location?: string;
  paymentMethod: 'cash' | 'card' | 'crypto';
}

export interface Offer {
  offerId: string;
  userId: string;
  productId?: string;
  type: 'discount' | 'bogo' | 'free_shipping' | 'loyalty_points';
  title: string;
  description: string;
  discount?: number; // percentage or fixed amount
  validUntil: Date;
  status: 'sent' | 'viewed' | 'redeemed' | 'expired';
  createdAt: Date;
  redeemedAt?: Date;
}

export interface Recommendation {
  recommendationId: string;
  userId: string;
  productId: string;
  score: number; // 0-1 confidence score
  reason: string;
  context: 'in_store' | 'follow_up' | 'display';
  createdAt: Date;
  interacted: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

// Component prop types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps {
  variant?: 'default' | 'product' | 'offer' | 'metric';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// AI and recommendation types
export interface AIRecommendationRequest {
  userId: string;
  context: 'in_store' | 'follow_up' | 'display';
  currentLocation?: string;
  recentInteractions?: Interaction[];
  purchaseHistory?: Purchase[];
  availableProducts?: Product[];
}

export interface AIRecommendationResponse {
  recommendations: {
    product: Product;
    score: number;
    reason: string;
  }[];
  personalizedMessage?: string;
}

// Farcaster Frame types
export interface FrameData {
  frameId: string;
  type: 'product_recommendation' | 'offer_notification' | 'display_greeting';
  userId: string;
  content: {
    title: string;
    description: string;
    imageUrl?: string;
    buttons: FrameButton[];
  };
  metadata?: Record<string, any>;
}

export interface FrameButton {
  label: string;
  action: 'link' | 'post' | 'mint';
  target?: string;
  postUrl?: string;
}

// Store and analytics types
export interface StoreMetrics {
  totalCustomers: number;
  activeRecommendations: number;
  conversionRate: number;
  averageOrderValue: number;
  topProducts: Product[];
  recentActivity: Interaction[];
}

export interface AnalyticsData {
  period: 'day' | 'week' | 'month';
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
  trends: {
    date: string;
    value: number;
  }[];
}
