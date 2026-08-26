export type CategoryGroup = "component" | "device" | "peripheral" | "service";

export interface Category {
  slug: string;
  name: string;
  shortName: string;
  group: CategoryGroup;
  /** true if this category appears as a row in the PC Builder */
  buildable: boolean;
  blurb: string;
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verified: boolean;
}

export interface Product {
  id: string;
  categorySlug: string;
  name: string;
  brand: string;
  model: string;
  price: number;
  mrp?: number;
  wattage?: number;
  inStock: boolean;
  stockQty: number;
  rating?: number;
  reviewsCount?: number;
  discountPercent?: number;
  specs?: Record<string, string>;
  features?: string[];
  reviews?: ProductReview[];
  imageUrl?: string;
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  brand: string;
  categorySlug: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: "Processing" | "Packed" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";
  trackingNumber: string;
  courier: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending" | "Cash on Delivery";
  shippingAddress: Address;
  gstNumber?: string;
  companyName?: string;
  estimatedDelivery: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  joinedDate: string;
  charmilaCoins: number;
  isAdmin?: boolean;
}

