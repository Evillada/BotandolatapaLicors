export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivered' | 'cancelled'

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          icon?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          original_price: number | null
          discount: number
          category_id: string | null
          category: string | null
          size: string | null
          image_url: string | null
          badge: string | null
          stock: number
          active: boolean
          is_promotion: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          original_price?: number | null
          discount?: number
          category_id?: string | null
          category?: string | null
          size?: string | null
          image_url?: string | null
          badge?: string | null
          stock?: number
          active?: boolean
          is_promotion?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          original_price?: number | null
          discount?: number
          category_id?: string | null
          category?: string | null
          size?: string | null
          image_url?: string | null
          badge?: string | null
          stock?: number
          active?: boolean
          is_promotion?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: number
          customer_name: string
          customer_phone: string
          customer_address: string
          customer_notes: string | null
          items: OrderItem[]
          subtotal: number
          delivery_fee: number
          total: number
          status: OrderStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: number
          customer_name: string
          customer_phone: string
          customer_address: string
          customer_notes?: string | null
          items: OrderItem[]
          subtotal: number
          delivery_fee?: number
          total: number
          status?: OrderStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: number
          customer_name?: string
          customer_phone?: string
          customer_address?: string
          customer_notes?: string | null
          items?: OrderItem[]
          subtotal?: number
          delivery_fee?: number
          total?: number
          status?: OrderStatus
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          email: string
          role: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: string
          created_at?: string
        }
      }
    }
  }
}

export interface OrderItem {
  product_id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

export type Product = Database['public']['Tables']['products']['Row']
export type ProductInsert = Database['public']['Tables']['products']['Insert']
export type ProductUpdate = Database['public']['Tables']['products']['Update']

export type Category = Database['public']['Tables']['categories']['Row']

export type Order = Database['public']['Tables']['orders']['Row']
export type OrderInsert = Database['public']['Tables']['orders']['Insert']
export type OrderUpdate = Database['public']['Tables']['orders']['Update']

export type AdminUser = Database['public']['Tables']['admin_users']['Row']
