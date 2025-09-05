export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          user_id: string // on-chain address
          farcaster_profile: Json | null
          purchase_history: Json[]
          interaction_log: Json[]
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          farcaster_profile?: Json | null
          purchase_history?: Json[]
          interaction_log?: Json[]
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          farcaster_profile?: Json | null
          purchase_history?: Json[]
          interaction_log?: Json[]
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          product_id: string
          name: string
          description: string
          price: number
          category: string
          image_url: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          description: string
          price: number
          category: string
          image_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          description?: string
          price?: number
          category?: string
          image_url?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      interactions: {
        Row: {
          id: string
          interaction_id: string
          user_id: string
          product_id: string
          timestamp: string
          type: string // 'view', 'like', 'scan', 'purchase'
          location: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          interaction_id: string
          user_id: string
          product_id: string
          timestamp?: string
          type: string
          location?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          interaction_id?: string
          user_id?: string
          product_id?: string
          timestamp?: string
          type?: string
          location?: string | null
          metadata?: Json
          created_at?: string
        }
      }
      offers: {
        Row: {
          id: string
          offer_id: string
          user_id: string
          product_id: string | null
          type: string
          discount: number
          valid_until: string
          status: string // 'sent', 'redeemed', 'expired'
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          offer_id: string
          user_id: string
          product_id?: string | null
          type: string
          discount: number
          valid_until: string
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          offer_id?: string
          user_id?: string
          product_id?: string | null
          type?: string
          discount?: number
          valid_until?: string
          status?: string
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      stores: {
        Row: {
          id: string
          store_id: string
          name: string
          description: string | null
          location: string | null
          owner_address: string
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          store_id: string
          name: string
          description?: string | null
          location?: string | null
          owner_address: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          store_id?: string
          name?: string
          description?: string | null
          location?: string | null
          owner_address?: string
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
