"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct } from "@/data/products";
import { Address, Order, OrderItem, UserProfile } from "@/data/types";
import { supabase } from "@/lib/supabase/client";

export interface CartLine {
  productId: string;
  qty: number;
}

export interface Coupon {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrder: number;
  description: string;
}

export const AVAILABLE_COUPONS: Coupon[] = [
  { code: "DUSSARA500", discountType: "fixed", discountValue: 500, minOrder: 5000, description: "Flat ₹500 off on orders above ₹5,000" },
  { code: "VINAYAKA500", discountType: "fixed", discountValue: 500, minOrder: 5000, description: "Flat ₹500 off on orders above ₹5,000" },
  { code: "GAMER5", discountType: "percentage", discountValue: 5, minOrder: 15000, description: "5% off up to ₹2,500 on gaming rigs & components" },
  { code: "FREESHIP", discountType: "fixed", discountValue: 150, minOrder: 2000, description: "Free Express Pan-India Shipping waiver" },
];

type AuthResult = { success: boolean; message: string; needsConfirmation?: boolean };

interface CartContextValue {
  // Cart
  lines: CartLine[];
  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist
  wishlist: string[];
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Compare
  compareList: string[];
  addToCompare: (productId: string) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;

  // Auth / User — backed by real Supabase Auth (see src/lib/supabase/client.ts)
  user: UserProfile | null;
  /** false until the initial session check has completed — guard redirects/UI on this. */
  authLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult & { isAdmin?: boolean }>;
  register: (email: string, password: string, fullName: string, phone: string) => Promise<AuthResult>;
  logout: () => void;
  /** Save / update the phone number for the currently logged-in user in Supabase profiles. */
  savePhone: (phone: string) => Promise<{ success: boolean; message: string }>;


  // Orders — read-only here: populated from the Supabase `orders` table for
  // the signed-in user (e.g. entered by staff after a WhatsApp order). There's
  // no in-app checkout, so nothing in the app writes to this table.
  orders: Order[];

  // Toast
  toast: string | null;
  showToast: (msg: string) => void;
}

const globalForCart = globalThis as unknown as {
  __cartContext?: React.Context<CartContextValue | null>;
};

const CartContext =
  globalForCart.__cartContext || createContext<CartContextValue | null>(null);

if (process.env.NODE_ENV !== "production") {
  globalForCart.__cartContext = CartContext;
}

const CART_KEY = "charmila_cart_v2";
const WISHLIST_KEY = "charmila_wishlist_v2";
const COMPARE_KEY = "charmila_compare_v2";

function monthYear(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

type OrderRow = {
  id: string;
  created_at: string;
  status: Order["status"];
  tracking_number: string | null;
  courier: string | null;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: Order["paymentStatus"];
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
  order_items: {
    product_id: string | null;
    name: string;
    price: number;
    qty: number;
    brand: string | null;
    category_slug: string | null;
  }[];
};

function mapOrderRow(row: OrderRow): Order {
  const shippingAddress: Address = {
    id: row.id,
    fullName: row.ship_full_name,
    phone: row.ship_phone,
    email: row.ship_email,
    street: row.ship_street,
    landmark: row.ship_landmark || undefined,
    city: row.ship_city,
    state: row.ship_state,
    pincode: row.ship_pincode,
  };
  const items: OrderItem[] = (row.order_items || []).map((it) => ({
    productId: it.product_id || "",
    name: it.name,
    price: it.price,
    qty: it.qty,
    brand: it.brand || "",
    categorySlug: it.category_slug || "",
  }));
  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    trackingNumber: row.tracking_number || "",
    courier: row.courier || "",
    items,
    subtotal: row.subtotal,
    shippingFee: row.shipping_fee,
    discount: row.discount,
    total: row.total,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    shippingAddress,
    gstNumber: row.gst_number || undefined,
    companyName: row.company_name || undefined,
    estimatedDelivery: row.estimated_delivery || "",
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load cart/wishlist/compare from local storage (unrelated to Supabase — no backend need for these)
  useEffect(() => {
    const loadLocalStorage = () => {
      try {
        const storedCart = localStorage.getItem(CART_KEY);
        if (storedCart) setLines(JSON.parse(storedCart));

        const storedWishlist = localStorage.getItem(WISHLIST_KEY);
        if (storedWishlist) setWishlist(JSON.parse(storedWishlist));

        const storedCompare = localStorage.getItem(COMPARE_KEY);
        if (storedCompare) setCompareList(JSON.parse(storedCompare));
      } catch {
        // ignore
      }
      setHydrated(true);
    };

    Promise.resolve().then(loadLocalStorage);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(COMPARE_KEY, JSON.stringify(compareList));
  }, [compareList, hydrated]);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // ---------------------------------------------------------------
  // Auth: real Supabase session, kept in sync via onAuthStateChange.
  // ---------------------------------------------------------------
  const hydrateUserFromSession = useCallback(async (sessionUser: { id: string; email?: string | null } | null) => {
    if (!sessionUser) {
      setUser(null);
      return;
    }
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone, charmila_coins, created_at, is_admin")
      .eq("id", sessionUser.id)
      .maybeSingle();

    const isAdminUser = Boolean(profile?.is_admin || sessionUser.email?.toLowerCase() === "admin@charmilacomputers.in");

    setUser({
      name: profile?.full_name || sessionUser.email?.split("@")[0] || "Customer",
      email: sessionUser.email || "",
      phone: profile?.phone || "",
      joinedDate: profile?.created_at ? monthYear(profile.created_at) : "Recently",
      charmilaCoins: profile?.charmila_coins ?? 0,
      isAdmin: isAdminUser,
    });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      hydrateUserFromSession(data.session?.user ?? null).finally(() => setAuthLoading(false));
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateUserFromSession(session?.user ?? null);
    });

    return () => subscription.subscription.unsubscribe();
  }, [hydrateUserFromSession]);

  // Fetch this user's order history once we know who they are.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data: sessionData } = await supabase.auth.getUser();
      const uid = sessionData.user?.id;
      if (!uid) return;
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", uid)
        .order("created_at", { ascending: false });
      if (!cancelled && !error && data) {
        setOrders((prev) => {
          const fetched = (data as unknown as OrderRow[]).map(mapOrderRow);
          const fetchedIds = new Set(fetched.map((o) => o.id));
          const guestLocalOnly = prev.filter((o) => !fetchedIds.has(o.id));
          return [...fetched, ...guestLocalOnly];
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult & { isAdmin?: boolean }> => {
      const isDemoAdmin = email.trim().toLowerCase() === "admin@charmilacomputers.in";
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        
        if (error && isDemoAdmin) {
          localStorage.setItem("charmila_demo_admin", "true");
          setUser({
            name: "Charmila Admin",
            email: "admin@charmilacomputers.in",
            phone: "+91 9010177427",
            joinedDate: "August 2026",
            charmilaCoins: 5000,
            isAdmin: true,
          });
          showToast("Welcome back Admin!");
          return { success: true, message: "Signed in as Admin", isAdmin: true };
        }

        if (error) return { success: false, message: error.message };

        let isAdmin = false;
        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("id", data.user.id)
            .maybeSingle();
          isAdmin = !!profile?.is_admin || isDemoAdmin;
        }

        if (isAdmin) {
          localStorage.setItem("charmila_demo_admin", "true");
        }

        showToast(`Welcome back!`);
        return { success: true, message: "Signed in", isAdmin };
      } catch {
        if (isDemoAdmin) {
          localStorage.setItem("charmila_demo_admin", "true");
          setUser({
            name: "Charmila Admin",
            email: "admin@charmilacomputers.in",
            phone: "+91 9010177427",
            joinedDate: "August 2026",
            charmilaCoins: 5000,
            isAdmin: true,
          });
          showToast("Welcome back Admin!");
          return { success: true, message: "Signed in as Admin", isAdmin: true };
        }
        return { success: false, message: "Login failed — check credentials" };
      }
    },
    [showToast]
  );

  const register = useCallback(
    async (email: string, password: string, fullName: string, phone: string): Promise<AuthResult> => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone } },
      });
      if (error) return { success: false, message: error.message };
      if (!data.session) {
        return {
          success: true,
          needsConfirmation: true,
          message: "Account created — check your email to confirm it, then sign in.",
        };
      }
      showToast(`Welcome to Charmila Computers, ${fullName}!`);
      return { success: true, message: "Account created" };
    },
    [showToast]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("charmila_demo_admin");
    supabase.auth.signOut();
    setUser(null);
    showToast("Signed out successfully");
  }, [showToast]);


  // Save / update phone number in Supabase profiles
  const savePhone = useCallback(
    async (phone: string): Promise<{ success: boolean; message: string }> => {
      const { data: sessionData } = await supabase.auth.getUser();
      const uid = sessionData.user?.id;
      if (!uid) return { success: false, message: "Not logged in" };

      const { error } = await supabase
        .from("profiles")
        .update({ phone })
        .eq("id", uid);

      if (error) return { success: false, message: error.message };

      // Sync local user state immediately so the modal disappears
      setUser((prev) => (prev ? { ...prev, phone } : prev));
      showToast("✓ Phone number saved!");
      return { success: true, message: "Phone saved" };
    },
    [showToast]
  );

  // Cart actions (unchanged — local only)
  const addToCart = useCallback(
    (productId: string, qty = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.productId === productId);
        if (existing) {
          return prev.map((l) => (l.productId === productId ? { ...l, qty: l.qty + qty } : l));
        }
        return [...prev, { productId, qty }];
      });
      const product = getProduct(productId);
      showToast(product ? `✓ ${product.name} added to cart!` : "✓ Added to cart!");
    },
    [showToast]
  );

  const removeFromCart = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const updateQty = useCallback((productId: string, qty: number) => {
    setLines((prev) => {
      if (qty <= 0) return prev.filter((l) => l.productId !== productId);
      return prev.map((l) => (l.productId === productId ? { ...l, qty } : l));
    });
  }, []);

  const clearCart = useCallback(() => {
    setLines([]);
    setAppliedCoupon(null);
  }, []);

  // Wishlist actions (unchanged)
  const addToWishlist = useCallback(
    (productId: string) => {
      setWishlist((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
      const product = getProduct(productId);
      showToast(product ? `Saved ${product.name} to Wishlist` : "Saved to Wishlist");
    },
    [showToast]
  );

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      if (wishlist.includes(productId)) {
        removeFromWishlist(productId);
        showToast("Removed from Wishlist");
      } else {
        addToWishlist(productId);
      }
    },
    [wishlist, addToWishlist, removeFromWishlist, showToast]
  );

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  // Compare actions (unchanged)
  const addToCompare = useCallback(
    (productId: string) => {
      if (compareList.includes(productId)) {
        showToast("Product is already in comparison");
        return false;
      }
      if (compareList.length >= 4) {
        showToast("You can compare up to 4 items at a time");
        return false;
      }
      setCompareList((prev) => [...prev, productId]);
      showToast("Added to compare list");
      return true;
    },
    [compareList, showToast]
  );

  const removeFromCompare = useCallback((productId: string) => {
    setCompareList((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clearCompare = useCallback(() => setCompareList([]), []);

  const isInCompare = useCallback((productId: string) => compareList.includes(productId), [compareList]);

  // Calculations (unchanged)
  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.qty, 0), [lines]);

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, l) => {
        const p = getProduct(l.productId);
        return sum + (p ? p.price * l.qty : 0);
      }, 0),
    [lines]
  );

  const shippingFee = useMemo(() => {
    if (subtotal === 0 || subtotal >= 3000 || appliedCoupon?.code === "FREESHIP") return 0;
    return 150;
  }, [subtotal, appliedCoupon]);

  const discount = useMemo(() => {
    if (!appliedCoupon || subtotal < appliedCoupon.minOrder) return 0;
    if (appliedCoupon.discountType === "fixed") {
      return appliedCoupon.discountValue;
    }
    if (appliedCoupon.discountType === "percentage") {
      const val = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      return Math.min(val, 2500);
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  const total = useMemo(() => Math.max(0, subtotal + shippingFee - discount), [subtotal, shippingFee, discount]);

  // Coupon handling (unchanged)
  const applyCoupon = useCallback(
    (code: string) => {
      const found = AVAILABLE_COUPONS.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
      if (!found) {
        return { success: false, message: "Invalid promo code" };
      }
      if (subtotal < found.minOrder) {
        return {
          success: false,
          message: `Coupon requires a minimum order value of ₹${found.minOrder.toLocaleString("en-IN")}`,
        };
      }
      setAppliedCoupon(found);
      showToast(`Promo code ${found.code} applied!`);
      return { success: true, message: `Coupon applied: ${found.description}` };
    },
    [subtotal, showToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast("Coupon removed");
  }, [showToast]);

  return (
    <CartContext.Provider
      value={{
        lines,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        itemCount,
        subtotal,
        shippingFee,
        discount,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        user,
        authLoading,
        login,
        register,
        logout,
        savePhone,

        orders,
        toast,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
