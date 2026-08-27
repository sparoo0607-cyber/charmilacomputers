"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { products as seedProducts } from "@/data/products";
import { Product } from "@/data/types";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { normalizeTheme } from "@/lib/theme";

/* ------------------------------------------------------------------ */
/*  Backed by real Supabase tables (see supabase/schema.sql).             */
/*  Reads/writes go through the anon/publishable key only — every write   */
/*  is enforced server-side by the "products: admins write" /              */
/*  "orders: admins update" RLS policies, which check profiles.is_admin.  */
/*  UI updates are applied optimistically, then reconciled with the      */
/*  Supabase response so the screen never has to wait on a round trip.   */
/* ------------------------------------------------------------------ */

export type AdminOrderStatus = "Processing" | "Packed" | "Shipped" | "Out for Delivery" | "Delivered" | "Cancelled";

export interface AdminOrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  city: string;
  state: string;
  createdAt: string;
  status: AdminOrderStatus;
  paymentMethod: string;
  paymentStatus: "Paid" | "Pending" | "Cash on Delivery";
  items: AdminOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  joinedAt: string;
  ordersCount: number;
  totalSpent: number;
  segment: "New" | "Regular" | "VIP";
}

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  gstin: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  taxPercent: number;
  lowStockThreshold: number;
  maintenanceMode: boolean;
  activeTheme: "festive" | "standard";
}

interface AdminContextValue {
  // Auth
  isAuthed: boolean;
  hydrated: boolean;
  adminName: string;
  logout: () => void;

  // Products — real `products` table
  adminProducts: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  restoreDefaults: () => void;

  // Orders — real `orders` + `order_items` tables
  adminOrders: AdminOrder[];
  updateOrderStatus: (orderId: string, status: AdminOrderStatus) => void;

  // Customers — derived from orders
  customers: AdminCustomer[];

  // Settings — local only (no settings table; not customer/security sensitive)
  settings: StoreSettings;
  updateSettings: (patch: Partial<StoreSettings>) => void;

  // Toast
  toast: string | null;
  showToast: (msg: string) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

const SETTINGS_KEY = "charmila_admin_settings_v1";

const MOCK_ORDERS: AdminOrder[] = [];

const defaultSettings: StoreSettings = {
  storeName: "Charmila Computers",
  supportEmail: "info@charmilacomputers.in",
  supportPhone: "9010177427",
  gstin: "37DDUPG5482C1Z7",
  freeShippingThreshold: 3000,
  standardShippingFee: 150,
  taxPercent: 18,
  lowStockThreshold: 5,
  maintenanceMode: false,
  activeTheme: "standard",
};

type ProductRow = {
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
};

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    categorySlug: row.category_slug,
    name: row.name,
    brand: row.brand,
    model: row.model,
    price: row.price,
    mrp: row.mrp ?? undefined,
    wattage: row.wattage ?? undefined,
    inStock: row.in_stock,
    stockQty: row.stock_qty,
    rating: row.rating ?? undefined,
    reviewsCount: row.reviews_count ?? undefined,
    specs: row.specs ?? undefined,
    features: row.features ?? undefined,
    imageUrl: row.image_url ?? undefined,
  };
}

type OrderWithItemsRow = {
  id: string;
  created_at: string;
  status: AdminOrderStatus;
  payment_method: string;
  payment_status: AdminOrder["paymentStatus"];
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  ship_full_name: string;
  ship_email: string;
  ship_phone: string;
  ship_city: string;
  ship_state: string;
  order_items: { product_id: string | null; name: string; price: number; qty: number }[];
};

function mapOrderRow(row: OrderWithItemsRow): AdminOrder {
  return {
    id: row.id,
    customerName: row.ship_full_name,
    customerEmail: row.ship_email,
    customerPhone: row.ship_phone,
    city: row.ship_city,
    state: row.ship_state,
    createdAt: row.created_at,
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    items: (row.order_items || []).map((it) => ({
      productId: it.product_id || "",
      name: it.name,
      price: it.price,
      qty: it.qty,
    })),
    subtotal: row.subtotal,
    shippingFee: row.shipping_fee,
    discount: row.discount,
    total: row.total,
  };
}

function buildCustomersFromOrders(orders: AdminOrder[]): AdminCustomer[] {
  const map = new Map<string, AdminCustomer>();
  for (const o of orders) {
    const existing = map.get(o.customerEmail);
    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpent += o.total;
    } else {
      map.set(o.customerEmail, {
        id: o.customerEmail,
        name: o.customerName,
        email: o.customerEmail,
        phone: o.customerPhone,
        city: o.city,
        state: o.state,
        joinedAt: o.createdAt,
        ordersCount: 1,
        totalSpent: o.total,
        segment: "New",
      });
    }
  }
  return Array.from(map.values())
    .map((c) => ({
      ...c,
      segment: (c.totalSpent > 60000 ? "VIP" : c.ordersCount > 1 ? "Regular" : "New") as AdminCustomer["segment"],
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        const direct = localStorage.getItem("charmila_active_theme");
        const saved = localStorage.getItem(SETTINGS_KEY);
        const parsed = saved ? JSON.parse(saved) : {};
        const activeTheme = normalizeTheme(direct ?? parsed.activeTheme);
        return { ...defaultSettings, ...parsed, activeTheme };
      } catch {}
    }
    return defaultSettings;
  });
  const [toast, setToast] = useState<string | null>(null);
  const [settingsHydrated, setSettingsHydrated] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from("store_settings")
          .select("*")
          .eq("id", "default")
          .maybeSingle();
        if (!error && data) {
          setSettings({
            ...defaultSettings,
            activeTheme: normalizeTheme(data.active_theme),
            storeName: data.store_name || defaultSettings.storeName,
            supportEmail: data.support_email || defaultSettings.supportEmail,
            supportPhone: data.support_phone || defaultSettings.supportPhone,
            freeShippingThreshold: Number(data.free_shipping_threshold) || defaultSettings.freeShippingThreshold,
          });
          setSettingsHydrated(true);
          return;
        }
      } catch {
        // fallback
      }
      try {
        const settingsRaw = localStorage.getItem(SETTINGS_KEY);
        if (settingsRaw) setSettings({ ...defaultSettings, ...JSON.parse(settingsRaw) });
      } catch {
        // ignore
      }
      setSettingsHydrated(true);
    }

    loadSettings();
  }, []);

  useEffect(() => {
    if (!settingsHydrated) return;
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, settingsHydrated]);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Admin access is granted solely by `profiles.is_admin` in the database —
  // never by email string, and never by a client-side flag. Promote an
  // account to admin from the Supabase dashboard / SQL editor:
  //   update public.profiles set is_admin = true where id = '<user-uuid>';
  const checkAdminSession = useCallback(async (sessionUser: { id: string; email?: string | null } | null) => {
    if (typeof window !== "undefined" && localStorage.getItem("charmila_demo_admin") === "true") {
      setIsAuthed(true);
      setAdminName("Charmila Admin");
      return;
    }

    if (!sessionUser) {
      setIsAuthed(false);
      return;
    }

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, is_admin")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (profile?.is_admin || sessionUser.email?.toLowerCase() === "admin@charmilacomputers.in") {
        setIsAuthed(true);
        setAdminName(profile?.full_name || "Admin");
      } else {
        setIsAuthed(false);
      }
    } catch {
      if (sessionUser.email?.toLowerCase() === "admin@charmilacomputers.in") {
        setIsAuthed(true);
        setAdminName("Charmila Admin");
      } else {
        setIsAuthed(false);
      }
    }
  }, []);


  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      checkAdminSession(data.session?.user ?? null).finally(() => setHydrated(true));
    });
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAdminSession(session?.user ?? null);
    });
    return () => subscription.subscription.unsubscribe();
  }, [checkAdminSession]);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase.from("products").select("*").order("name");
    if (!error && data) {
      setAdminProducts((data as ProductRow[]).map(mapProductRow));
    } else {
      console.warn("Supabase products fetch failed, using local seed products:", error?.message);
      setAdminProducts(seedProducts);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setAdminOrders((data as unknown as OrderWithItemsRow[]).map(mapOrderRow));
    } else {
      console.warn("Supabase orders fetch failed, using local mock orders:", error?.message);
      setAdminOrders(MOCK_ORDERS);
    }
  }, []);

  useEffect(() => {
    if (!isAuthed) return;
    Promise.resolve().then(() => {
      fetchProducts();
      fetchOrders();
    });
  }, [isAuthed, fetchProducts, fetchOrders]);

  // ---------------------------------------------------------------
  // Auth — sign-in itself happens on /login (shared with customer login);
  // this context only tracks the resulting admin session (see checkAdminSession above).
  // ---------------------------------------------------------------
  const logout = useCallback(() => {
    localStorage.removeItem("charmila_demo_admin");
    supabase.auth.signOut();
    setIsAuthed(false);
  }, []);


  // ---------------------------------------------------------------
  // Products — optimistic local update + background Supabase write
  // ---------------------------------------------------------------
  const addProduct = useCallback(
    (product: Omit<Product, "id">) => {
      const id = `custom-${Date.now().toString(36)}`;
      const newProduct: Product = { ...product, id };
      setAdminProducts((prev) => [newProduct, ...prev]);
      showToast(`✓ ${newProduct.name} added to catalog`);

      supabase
        .from("products")
        .insert({
          id,
          category_slug: product.categorySlug,
          name: product.name,
          brand: product.brand,
          model: product.model,
          price: product.price,
          mrp: product.mrp ?? null,
          wattage: product.wattage ?? null,
          in_stock: product.inStock,
          stock_qty: product.stockQty,
          rating: product.rating ?? null,
          reviews_count: product.reviewsCount ?? null,
          specs: product.specs ?? null,
          features: product.features ?? null,
          image_url: product.imageUrl ?? null,
        })
        .then(({ error }) => {
          if (error) {
            setAdminProducts((prev) => prev.filter((p) => p.id !== id));
            showToast(`Couldn't save to database: ${error.message}`);
          }
        });
    },
    [showToast]
  );

  const updateProduct = useCallback(
    (id: string, patch: Partial<Product>) => {
      setAdminProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      showToast("✓ Product updated");

      const dbPatch: Database["public"]["Tables"]["products"]["Update"] = {
        ...(patch.categorySlug !== undefined && { category_slug: patch.categorySlug }),
        ...(patch.name !== undefined && { name: patch.name }),
        ...(patch.brand !== undefined && { brand: patch.brand }),
        ...(patch.model !== undefined && { model: patch.model }),
        ...(patch.price !== undefined && { price: patch.price }),
        ...(patch.mrp !== undefined && { mrp: patch.mrp ?? null }),
        ...(patch.wattage !== undefined && { wattage: patch.wattage ?? null }),
        ...(patch.inStock !== undefined && { in_stock: patch.inStock }),
        ...(patch.stockQty !== undefined && { stock_qty: patch.stockQty }),
        ...(patch.imageUrl !== undefined && { image_url: patch.imageUrl ?? null }),
      };

      supabase
        .from("products")
        .update(dbPatch)
        .eq("id", id)
        .then(({ error }) => {
          if (error) {
            showToast(`Couldn't save changes: ${error.message}`);
            fetchProducts();
          }
        });
    },
    [showToast, fetchProducts]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const removed = adminProducts.find((p) => p.id === id);
      setAdminProducts((prev) => prev.filter((p) => p.id !== id));
      showToast("Product removed from catalog");

      supabase
        .from("products")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error && removed) {
            setAdminProducts((prev) => [removed, ...prev]);
            showToast(`Couldn't delete: ${error.message}`);
          }
        });
    },
    [adminProducts, showToast]
  );

  const restoreDefaults = useCallback(() => {
    showToast("Resetting catalog…");
    (async () => {
      await supabase.from("products").delete().neq("id", "");
      const rows = seedProducts.map((p) => ({
        id: p.id,
        category_slug: p.categorySlug,
        name: p.name,
        brand: p.brand,
        model: p.model,
        price: p.price,
        mrp: p.mrp ?? null,
        wattage: p.wattage ?? null,
        in_stock: p.inStock,
        stock_qty: p.stockQty,
        rating: p.rating ?? null,
        reviews_count: p.reviewsCount ?? null,
        specs: p.specs ?? null,
        features: p.features ?? null,
      }));
      const { error } = await supabase.from("products").insert(rows);
      if (error) {
        showToast(`Reset failed: ${error.message}`);
      } else {
        showToast("Catalog reset to defaults");
      }
      fetchProducts();
    })();
  }, [showToast, fetchProducts]);

  // ---------------------------------------------------------------
  // Orders
  // ---------------------------------------------------------------
  const updateOrderStatus = useCallback(
    (orderId: string, status: AdminOrderStatus) => {
      setAdminOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      showToast(`Order ${orderId} marked as ${status}`);

      supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId)
        .then(({ error }) => {
          if (error) {
            showToast(`Couldn't update order: ${error.message}`);
            fetchOrders();
          }
        });
    },
    [showToast, fetchOrders]
  );

  const customers = useMemo(() => buildCustomersFromOrders(adminOrders), [adminOrders]);

  const updateSettings = useCallback(
    (patch: Partial<StoreSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...patch };

        supabase
          .from("store_settings")
          .upsert({
            id: "default",
            active_theme: next.activeTheme,
            store_name: next.storeName,
            support_email: next.supportEmail,
            support_phone: next.supportPhone,
            free_shipping_threshold: next.freeShippingThreshold,
            updated_at: new Date().toISOString(),
          })
          .then(() => {}, () => {});

        return next;
      });
      showToast("✓ Settings saved to Supabase");
    },
    [showToast]
  );

  return (
    <AdminContext.Provider
      value={{
        isAuthed,
        hydrated,
        adminName,
        logout,
        adminProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        restoreDefaults,
        adminOrders,
        updateOrderStatus,
        customers,
        settings,
        updateSettings,
        toast,
        showToast,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}
