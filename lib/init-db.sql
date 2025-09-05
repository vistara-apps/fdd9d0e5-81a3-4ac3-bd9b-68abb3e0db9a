-- RetailRune Database Schema
-- This script creates the necessary tables for the RetailRune application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT UNIQUE NOT NULL, -- on-chain address
    farcaster_profile JSONB,
    purchase_history JSONB[] DEFAULT '{}',
    interaction_log JSONB[] DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category TEXT NOT NULL,
    image_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interactions table
CREATE TABLE IF NOT EXISTS interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type TEXT NOT NULL, -- 'view', 'like', 'scan', 'purchase', 'recommendation', 'offer_view'
    location TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL,
    product_id TEXT,
    type TEXT NOT NULL,
    discount DECIMAL(5,2) NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'sent', -- 'sent', 'redeemed', 'expired'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT,
    owner_address TEXT NOT NULL,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_products_product_id ON products(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_interactions_user_id ON interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_product_id ON interactions(product_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(type);
CREATE INDEX IF NOT EXISTS idx_interactions_timestamp ON interactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_offers_user_id ON offers(user_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_valid_until ON offers(valid_until);
CREATE INDEX IF NOT EXISTS idx_stores_store_id ON stores(store_id);

-- Insert sample data

-- Sample stores
INSERT INTO stores (store_id, name, description, location, owner_address, settings) VALUES
('demo_store_001', 'TechMart Electronics', 'Your one-stop shop for the latest electronics and gadgets', 'Downtown Mall, Level 2', '0x1234567890123456789012345678901234567890', '{"qr_enabled": true, "ai_recommendations": true}'),
('demo_store_002', 'Fashion Forward', 'Trendy clothing and accessories for all ages', 'Shopping Center, Wing A', '0x2345678901234567890123456789012345678901', '{"qr_enabled": true, "ai_recommendations": true}'),
('demo_store_003', 'Home & Garden Plus', 'Everything you need for your home and garden', 'Retail Park, Unit 15', '0x3456789012345678901234567890123456789012', '{"qr_enabled": true, "ai_recommendations": true}')
ON CONFLICT (store_id) DO NOTHING;

-- Sample products
INSERT INTO products (product_id, name, description, price, category, image_url, metadata) VALUES
('TECH001', 'Wireless Bluetooth Headphones', 'Premium noise-cancelling wireless headphones with 30-hour battery life', 199.99, 'Electronics', 'https://example.com/headphones.jpg', '{"brand": "TechSound", "features": ["noise-cancelling", "wireless", "long-battery"], "rating": 4.5}'),
('TECH002', 'Smart Fitness Watch', 'Advanced fitness tracking with heart rate monitor and GPS', 299.99, 'Electronics', 'https://example.com/smartwatch.jpg', '{"brand": "FitTech", "features": ["heart-rate", "gps", "waterproof"], "rating": 4.3}'),
('TECH003', 'Portable Phone Charger', 'High-capacity power bank with fast charging technology', 49.99, 'Electronics', 'https://example.com/powerbank.jpg', '{"brand": "PowerMax", "features": ["fast-charging", "portable", "high-capacity"], "rating": 4.7}'),
('FASHION001', 'Designer Denim Jacket', 'Classic denim jacket with modern fit and premium materials', 89.99, 'Fashion', 'https://example.com/jacket.jpg', '{"brand": "StyleCo", "sizes": ["S", "M", "L", "XL"], "colors": ["blue", "black"], "rating": 4.2}'),
('FASHION002', 'Leather Crossbody Bag', 'Handcrafted leather bag perfect for everyday use', 129.99, 'Fashion', 'https://example.com/bag.jpg', '{"brand": "LeatherCraft", "material": "genuine leather", "colors": ["brown", "black"], "rating": 4.6}'),
('HOME001', 'Smart LED Light Bulbs (4-pack)', 'Color-changing smart bulbs compatible with voice assistants', 79.99, 'Home & Garden', 'https://example.com/lightbulbs.jpg', '{"brand": "SmartHome", "features": ["color-changing", "voice-control", "energy-efficient"], "rating": 4.4}'),
('HOME002', 'Indoor Plant Collection', 'Set of 3 low-maintenance indoor plants with decorative pots', 59.99, 'Home & Garden', 'https://example.com/plants.jpg', '{"type": "plant collection", "care": "low-maintenance", "includes": "decorative pots", "rating": 4.8}'),
('TECH004', 'Gaming Mechanical Keyboard', 'RGB backlit mechanical keyboard designed for gaming', 149.99, 'Electronics', 'https://example.com/keyboard.jpg', '{"brand": "GameTech", "features": ["mechanical", "rgb-backlit", "gaming"], "rating": 4.5}'),
('FASHION003', 'Casual Sneakers', 'Comfortable everyday sneakers with breathable mesh design', 79.99, 'Fashion', 'https://example.com/sneakers.jpg', '{"brand": "ComfortStep", "sizes": ["7", "8", "9", "10", "11"], "colors": ["white", "black", "gray"], "rating": 4.3}'),
('HOME003', 'Aromatherapy Diffuser', 'Ultrasonic essential oil diffuser with LED lighting', 39.99, 'Home & Garden', 'https://example.com/diffuser.jpg', '{"brand": "ZenHome", "features": ["ultrasonic", "led-lighting", "timer"], "rating": 4.6}')
ON CONFLICT (product_id) DO NOTHING;

-- Sample users
INSERT INTO users (user_id, farcaster_profile, preferences) VALUES
('demo_user', '{"fid": 12345, "username": "retailrune_demo", "displayName": "Demo User", "pfpUrl": "https://example.com/avatar.jpg"}', '{"categories": ["Electronics", "Fashion"], "priceRange": {"min": 0, "max": 500}, "notifications": true}'),
('0x1111111111111111111111111111111111111111', '{"fid": 23456, "username": "tech_enthusiast", "displayName": "Tech Enthusiast"}', '{"categories": ["Electronics"], "priceRange": {"min": 50, "max": 1000}, "notifications": true}'),
('0x2222222222222222222222222222222222222222', '{"fid": 34567, "username": "fashion_lover", "displayName": "Fashion Lover"}', '{"categories": ["Fashion"], "priceRange": {"min": 25, "max": 300}, "notifications": true}')
ON CONFLICT (user_id) DO NOTHING;

-- Sample interactions
INSERT INTO interactions (interaction_id, user_id, product_id, type, location, metadata) VALUES
('int_001', 'demo_user', 'TECH001', 'view', 'Electronics Section', '{"duration": 45, "source": "qr_scan"}'),
('int_002', 'demo_user', 'TECH001', 'like', 'Electronics Section', '{"source": "recommendation"}'),
('int_003', 'demo_user', 'FASHION001', 'view', 'Fashion Section', '{"duration": 30, "source": "browse"}'),
('int_004', '0x1111111111111111111111111111111111111111', 'TECH002', 'purchase', 'Electronics Section', '{"amount": 299.99, "payment_method": "crypto"}'),
('int_005', '0x2222222222222222222222222222222222222222', 'FASHION002', 'view', 'Fashion Section', '{"duration": 60, "source": "recommendation"}')
ON CONFLICT (interaction_id) DO NOTHING;

-- Sample offers
INSERT INTO offers (offer_id, user_id, product_id, type, discount, valid_until, status, metadata) VALUES
('offer_001', 'demo_user', 'TECH001', 'discount', 15.00, NOW() + INTERVAL '7 days', 'sent', '{"message": "Special 15% off on your favorite headphones!", "conditions": ["Valid for in-store purchase only"]}'),
('offer_002', '0x1111111111111111111111111111111111111111', NULL, 'loyalty_discount', 20.00, NOW() + INTERVAL '14 days', 'sent', '{"message": "Thank you for your purchase! Enjoy 20% off your next order.", "isFollowUp": true}'),
('offer_003', '0x2222222222222222222222222222222222222222', 'FASHION001', 'bundle_discount', 25.00, NOW() + INTERVAL '5 days', 'sent', '{"message": "Complete your look! 25% off when you buy this jacket with any bag.", "conditions": ["Must purchase qualifying items together"]})
ON CONFLICT (offer_id) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
