// Hand-written types matching supabase/schema.sql.
// If the schema changes, regenerate with the Supabase CLI:
//   npx supabase gen types typescript --project-id mxvmnwumfzzhhdfiuqxk > src/lib/supabase/types.ts

export type OrderStatus = "Processing" | "Packed" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";
export type PaymentStatus = "Paid" | "Pending" | "Cash on Delivery";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          is_admin: boolean;
          charmila_coins: number;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          is_admin?: boolean;
          charmila_coins?: number;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          category_slug: string;
          name: string;
          brand: string;
          model: string;
          price: number;
          mrp: number | null;
          wattage: number | null;
          in_stock: boolean;
          stock_qty: number;
          rating: number | null;
          reviews_count: number | null;
          specs: Record<string, string> | null;
          features: string[] | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_slug: string;
          name: string;
          brand: string;
          model?: string;
          price: number;
          mrp?: number | null;
          wattage?: number | null;
          in_stock?: boolean;
          stock_qty?: number;
          rating?: number | null;
          reviews_count?: number | null;
          specs?: Record<string, string> | null;
          features?: string[] | null;
          image_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          created_at: string;
          status: OrderStatus;
          tracking_number: string | null;
          courier: string | null;
          subtotal: number;
          shipping_fee: number;
          discount: number;
          total: number;
          payment_method: string;
          payment_status: PaymentStatus;
          ship_full_name: string;
          ship_phone: string;
          ship_email: string;
          ship_street: string;
          ship_landmark: string | null;
          ship_city: string;
          ship_state: string;
          ship_pincode: string;
          gst_number: string | null;
          company_name: string | null;
          estimated_delivery: string | null;
        };
        Insert: {
          id: string;
          user_id?: string | null;
          status?: OrderStatus;
          tracking_number?: string | null;
          courier?: string | null;
          subtotal: number;
          shipping_fee: number;
          discount: number;
          total: number;
          payment_method: string;
          payment_status?: PaymentStatus;
          ship_full_name: string;
          ship_phone: string;
          ship_email: string;
          ship_street: string;
          ship_landmark?: string | null;
          ship_city: string;
          ship_state: string;
          ship_pincode: string;
          gst_number?: string | null;
          company_name?: string | null;
          estimated_delivery?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: number;
          order_id: string;
          product_id: string | null;
          name: string;
          price: number;
          qty: number;
          brand: string | null;
          category_slug: string | null;
        };
        Insert: {
          order_id: string;
          product_id?: string | null;
          name: string;
          price: number;
          qty?: number;
          brand?: string | null;
          category_slug?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          }
        ];
      };
      banners: {
        Row: {
          id: string;
          image_src: string;
          badge_text: string | null;
          title_line1: string | null;
          title_line2: string | null;
          subtitle: string | null;
          button_text: string | null;
          button_link: string | null;
          button2_text: string | null;
          button2_link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          image_src: string;
          badge_text?: string | null;
          title_line1?: string | null;
          title_line2?: string | null;
          subtitle?: string | null;
          button_text?: string | null;
          button_link?: string | null;
          button2_text?: string | null;
          button2_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["banners"]["Insert"]>;
        Relationships: [];
      };
      page_views: {
        Row: {
          id: number;
          path: string;
          kind: "home" | "category" | "product" | "other";
          slug: string | null;
          visitor_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          path: string;
          kind?: "home" | "category" | "product" | "other";
          slug?: string | null;
          visitor_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["page_views"]["Insert"]>;
        Relationships: [];
      };
      store_settings: {
        Row: {
          id: string;
          store_name: string;
          support_email: string;
          support_phone: string;
          gstin: string;
          free_shipping_threshold: number;
          active_theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          store_name?: string;
          support_email?: string;
          support_phone?: string;
          gstin?: string;
          free_shipping_threshold?: number;
          active_theme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["store_settings"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      admin_users: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          email: string | null;
          charmila_coins: number | null;
          created_at: string | null;
        };
        Relationships: [];
      };
    };

    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
