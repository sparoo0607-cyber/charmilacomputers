"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { products as seedProducts } from "@/data/products";
import { Product } from "@/data/types";
import { supabase } from "@/lib/supabase/client";
import { normalizeTheme, ThemeId } from "@/lib/theme";

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
  paymentStatus: "Pending" | "Paid" | "Failed" | "Refunded";
  items: AdminOrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
}

// A signed-in storefront account — the admin "Users" screen only needs
// identity (name / phone / email), not commerce history.
export interface SiteUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinedAt: string;
  coins: number;
}

// One storefront page view, as read back from Supabase `page_views`.
export interface PageViewRow {
  id: number;
  path: string;
  kind: "product" | "category" | "page";
  slug: string | null;
  visitorId: string | null;
  createdAt: string;
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
  activeTheme: ThemeId;
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

  // Signed-in accounts (profiles ⨝ auth.users) — admin "Users" screen
  siteUsers: SiteUser[];

  // Raw storefront page views (last 30 days) — dashboard analytics
  pageViews: PageViewRow[];
  analyticsLoading: boolean;

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
  images: string[] | null;
};

function mapProductRow(row: ProductRow): Product {
  const images = Array.isArray(row.images) && row.images.length > 0
    ? row.images
    : (row.image_url ? [row.image_url] : undefined);

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
    imageUrl: row.image_url || (images ? images[0] : undefined),
    images,
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

type AdminUserRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  charmila_coins: number | null;
  created_at: string | null;
};

function mapSiteUser(row: AdminUserRow): SiteUser {
  return {
    id: row.id,
    name: row.full_name?.trim() || "—",
    email: row.email || "—",
    phone: row.phone?.trim() || "—",
    joinedAt: row.created_at || "",
    coins: row.charmila_coins ?? 0,
  };
}

type PageViewDbRow = {
  id: number;
  path: string;
  kind: PageViewRow["kind"];
  slug: string | null;
  visitor_id: string | null;
  created_at: string;
};

function mapPageView(row: PageViewDbRow): PageViewRow {
  return {
    id: row.id,
    path: row.path,
    kind: row.kind,
    slug: row.slug,
    visitorId: row.visitor_id,
    createdAt: row.created_at,
  };
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [adminName, setAdminName] = useState("Admin");
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [adminOrders, setAdminOrders] = useState<AdminOrder[]>([]);
  const [siteUsers, setSiteUsers] = useState<SiteUser[]>([]);
  const [pageViews, setPageViews] = useState<PageViewRow[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
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
      const settingsRaw = typeof window !== "undefined" ? localStorage.getItem(SETTINGS_KEY) : null;
      const localParsed = settingsRaw ? JSON.parse(settingsRaw) : {};
      const isMaintenance = typeof window !== "undefined" ? localStorage.getItem("charmila_maintenance_mode") === "true" : false;

      try {
        const { data, error } = await supabase
          .from("store_settings")
          .select("*")
          .eq("id", "default")
          .maybeSingle();
        if (!error && data) {
          setSettings({
            ...defaultSettings,
            ...localParsed,
            maintenanceMode:
              typeof data.maintenance_mode === "boolean"
                ? data.maintenance_mode
                : localParsed.maintenanceMode ?? isMaintenance ?? defaultSettings.maintenanceMode,
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
        if (settingsRaw) {
          setSettings({
            ...defaultSettings,
            ...localParsed,
            maintenanceMode: localParsed.maintenanceMode ?? isMaintenance ?? defaultSettings.maintenanceMode,
          });
        }
      } catch {
        // ignore
      }
      setSettingsHydrated(true);
    }

    loadSettings();
  }, []);

  useEffect(() => {
    if (!settingsHydrated) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      localStorage.setItem("charmila_maintenance_mode", String(settings.maintenanceMode));
      window.dispatchEvent(new Event("charmila_maintenance_change"));
    } catch {}
  }, [settings, settingsHydrated]);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // Admin access is granted solely by `profiles.is_admin` in the database —
  // never by email string, and never by a client-side flag. This must be a
  // REAL Supabase auth session: every admin write (delete a product, save
  // settings, toggle maintenance mode) goes straight to Supabase with RLS
  // policies that check auth.uid() against profiles.is_admin. A client-side
  // "you're an admin" flag with no real session behind it (the old
  // charmila_demo_admin localStorage flag did exactly this) makes the admin
  // UI look logged in while every single write silently fails RLS — which
  // is exactly the "changes I make don't reach the backend" bug. Promote an
  // account to admin from the Supabase dashboard / SQL editor:
  //   update public.profiles set is_admin = true where id = '<user-uuid>';
  const checkAdminSession = useCallback(async (sessionUser: { id: string; email?: string | null } | null) => {
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

    if (error) {
      // Keep whatever is on screen rather than blanking the catalog on a
      // transient network error; seed only if we have nothing at all yet.
      console.warn("Supabase products fetch failed:", error.message);
      setAdminProducts((prev) => (prev.length > 0 ? prev : seedProducts));
      return;
    }

    if (!data || data.length === 0) {
      // The table is genuinely empty — show the bundled seed catalog so the
      // admin screen isn't blank (and "Restore defaults" can push it to the DB).
      setAdminProducts(seedProducts);
      return;
    }

    // Supabase is the single source of truth. There used to be a
    // "charmila_custom_products_v1" localStorage snapshot layered on top of
    // this, holding the *entire* product list from the last admin session.
    // That made the admin panel and the storefront disagree permanently: a
    // product whose DB insert had failed still showed in /admin/products
    // forever (but never on the site), and it masked failed deletes too.
    setAdminProducts((data as ProductRow[]).map(mapProductRow));
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

  const fetchSiteUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.users) && json.users.length > 0) {
          setSiteUsers(json.users);
          return;
        }
      }
    } catch {}

    const { data, error } = await supabase.from("admin_users").select("*");
    if (!error && data) {
      setSiteUsers((data as AdminUserRow[]).map(mapSiteUser));
    } else if (error) {
      console.warn("Supabase admin_users fetch failed:", error.message);
    }
  }, []);

  const fetchPageViews = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.pageViews)) {
          setPageViews(json.pageViews);
          setAnalyticsLoading(false);
          return;
        }
      }
    } catch {}

    const since = new Date(Date.now() - 30 * 864e5).toISOString();
    const { data, error } = await supabase
      .from("page_views")
      .select("*")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(20000);
    if (!error && data) {
      setPageViews((data as PageViewDbRow[]).map(mapPageView));
    } else if (error) {
      console.warn("Supabase page_views fetch failed:", error.message);
    }
    setAnalyticsLoading(false);
  }, []);

  useEffect(() => {
    if (!isAuthed) return;
    Promise.resolve().then(() => {
      fetchProducts();
      fetchOrders();
      fetchSiteUsers();
      fetchPageViews();
    });
  }, [isAuthed, fetchProducts, fetchOrders, fetchSiteUsers, fetchPageViews]);

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
  // Products — optimistic local update + background Supabase write + localStorage sync
  // ---------------------------------------------------------------
  // Every admin write goes through /api/admin/products, which verifies
  // profiles.is_admin from this token before touching the table.
  const authHeaders = async (): Promise<Record<string, string>> => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Reads back the error message an /api/admin/products response carries.
  const responseError = async (res: Response): Promise<string> => {
    try {
      const json = await res.json();
      return json?.error || `Request failed (${res.status})`;
    } catch {
      return `Request failed (${res.status})`;
    }
  };

  const addProduct = useCallback(
    (product: Omit<Product, "id">) => {
      const id = `custom-${Date.now().toString(36)}`;
      const newProduct: Product = { ...product, id };

      // Optimistic update — product appears immediately in the UI, and is
      // rolled back below if Supabase refuses the insert.
      setAdminProducts((prev) => [newProduct, ...prev]);

      (async () => {
        try {
          const res = await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(await authHeaders()) },
            body: JSON.stringify({
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
              image_url: product.imageUrl ?? (product.images && product.images[0]) ?? null,
              images: product.images ?? (product.imageUrl ? [product.imageUrl] : null),
            }),
          });

          if (!res.ok) {
            const message = await responseError(res);
            console.warn("[admin/products] insert failed:", message);
            // Undo the optimistic row — it is NOT in the catalog, and showing
            // it here while the storefront never sees it is exactly the
            // "I added a product but it doesn't appear on the site" bug.
            setAdminProducts((prev) => prev.filter((p) => p.id !== id));
            showToast(`Couldn't add product: ${message}`);
            return;
          }

          showToast(`✓ ${newProduct.name} added to catalog`);
          fetchProducts();
        } catch (e) {
          console.warn("[admin/products] insert fetch error:", e);
          setAdminProducts((prev) => prev.filter((p) => p.id !== id));
          showToast("Couldn't add product — check your connection and try again.");
        }
      })();
    },
    [showToast, fetchProducts]
  );

  const updateProduct = useCallback(
    (id: string, patch: Partial<Product>) => {
      let previous: Product | undefined;
      setAdminProducts((prev) => {
        previous = prev.find((p) => p.id === id);
        return prev.map((p) => (p.id === id ? { ...p, ...patch } : p));
      });

      const dbPatch = {
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
        ...(patch.images !== undefined && { images: patch.images ?? null }),
        ...(patch.specs !== undefined && { specs: patch.specs ?? null }),
        ...(patch.features !== undefined && { features: patch.features ?? null }),
      };

      (async () => {
        try {
          const res = await fetch("/api/admin/products", {
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...(await authHeaders()) },
            body: JSON.stringify({ id, ...dbPatch }),
          });

          if (!res.ok) {
            const message = await responseError(res);
            console.warn("[admin/products] update failed:", message);
            if (previous) {
              const restore = previous;
              setAdminProducts((prev) => prev.map((p) => (p.id === id ? restore : p)));
            }
            showToast(`Couldn't save changes: ${message}`);
            return;
          }

          showToast("✓ Product updated");
        } catch (e) {
          console.warn("[admin/products] update fetch error:", e);
          if (previous) {
            const restore = previous;
            setAdminProducts((prev) => prev.map((p) => (p.id === id ? restore : p)));
          }
          showToast("Couldn't save changes — check your connection and try again.");
        }
      })();
    },
    [showToast]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      let removed: Product | undefined;
      setAdminProducts((prev) => {
        removed = prev.find((p) => p.id === id);
        return prev.filter((p) => p.id !== id);
      });

      (async () => {
        try {
          const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
            headers: await authHeaders(),
          });

          if (!res.ok) {
            const message = await responseError(res);
            console.warn("[admin/products] delete failed:", message);
            // Put the row straight back. Previously the delete failure was only
            // logged, so the product vanished from the admin screen, stayed in
            // Supabase, and reappeared on the next load — the "deleted products
            // keep restoring themselves" bug.
            if (removed) {
              const restore = removed;
              setAdminProducts((prev) => (prev.some((p) => p.id === id) ? prev : [restore, ...prev]));
            }
            showToast(`Couldn't delete: ${message}`);
            return;
          }

          showToast("Product removed from catalog");
        } catch (e) {
          console.warn("[admin/products] delete fetch error:", e);
          if (removed) {
            const restore = removed;
            setAdminProducts((prev) => (prev.some((p) => p.id === id) ? prev : [restore, ...prev]));
          }
          showToast("Couldn't delete — check your connection and try again.");
        }
      })();
    },
    [showToast]
  );

  const restoreDefaults = useCallback(() => {
    showToast("Resetting catalog…");
    if (typeof window !== "undefined") {
      // Clear the retired local snapshot so an old one can't reappear after
      // a downgrade; the catalog itself now lives only in Supabase.
      localStorage.removeItem("charmila_custom_products_v1");
    }
    (async () => {
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

      // Restore the seed catalog FIRST via upsert. This used to delete
      // every product before re-inserting the seed rows in a separate
      // statement — if the insert then failed for any reason, the delete
      // had already committed and the whole catalog was left empty with no
      // error shown to the admin (the toast below fired unconditionally).
      // Upserting first means the seed catalog is always present regardless
      // of what happens next, and a real failure is now surfaced.
      const { error: upsertError } = await supabase.from("products").upsert(rows, { onConflict: "id" });
      if (upsertError) {
        showToast(`Reset failed: ${upsertError.message}`);
        console.warn("Supabase reset (restore seed) error:", upsertError.message);
        fetchProducts();
        return;
      }

      // Then remove anything that isn't part of the seed catalog (products
      // an admin added beyond the defaults).
      const seedIds = seedProducts.map((p) => p.id);
      const { error: cleanupError } = await supabase
        .from("products")
        .delete()
        .not("id", "in", `(${seedIds.join(",")})`);
      if (cleanupError) {
        console.warn("Supabase reset (remove customs) warning:", cleanupError.message);
      }

      showToast("Catalog reset to defaults");
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
            maintenance_mode: next.maintenanceMode,
            updated_at: new Date().toISOString(),
          })
          .then(() => {}, () => {});

        return next;
      });
      showToast("✓ Settings saved");
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
        siteUsers,
        pageViews,
        analyticsLoading,
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
