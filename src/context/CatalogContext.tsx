"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { products as seedProducts, mapProductRow } from "@/data/products";
import { Product } from "@/data/types";
import { supabase } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/*  The live storefront catalog, fetched once and shared by every       */
/*  client page (header search, cart, wishlist, compare, deals, home).  */
/*                                                                     */
/*  These screens all used to import the bundled `products` array from  */
/*  src/data/products.ts directly, so they showed the shipped catalog   */
/*  forever: a product added in the admin panel never appeared in       */
/*  search or on the home page, and a deleted one was still in the      */
/*  header dropdown, still added to the cart, and still priced there.   */
/*  Only the category and product-detail pages read Supabase.          */
/*                                                                     */
/*  Same fallback rule as getProductsByCategoryLive: a failed query     */
/*  falls back to the bundled catalog so a Supabase hiccup never        */
/*  blanks the site, but an empty table is a real answer and renders    */
/*  as an empty catalog.                                               */
/* ------------------------------------------------------------------ */

type ProductRowLike = Parameters<typeof mapProductRow>[0];

export interface DealProduct extends Product {
  discountPercentage: number;
  savings: number;
}

interface CatalogContextValue {
  /** Every product currently in the catalog. */
  catalog: Product[];
  /** True until the first Supabase response lands. */
  catalogLoading: boolean;
  getProduct: (id: string) => Product | undefined;
  getProductsByCategory: (categorySlug: string) => Product[];
  getFeaturedProducts: (limit?: number) => Product[];
  getDealsProducts: () => DealProduct[];
  searchProducts: (query: string) => Product[];
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (cancelled) return;

      if (error || !data) {
        console.warn("Catalog fetch failed, using bundled catalog:", error?.message);
        setCatalog(seedProducts);
      } else {
        setCatalog((data as ProductRowLike[]).map(mapProductRow));
      }
      setCatalogLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<CatalogContextValue>(() => {
    const byId = new Map(catalog.map((p) => [p.id, p]));

    return {
      catalog,
      catalogLoading,
      getProduct: (id: string) => byId.get(id),
      getProductsByCategory: (categorySlug: string) =>
        catalog.filter((p) => p.categorySlug === categorySlug),
      getFeaturedProducts: (limit = 10) =>
        [...catalog]
          .filter((p) => p.categorySlug !== "services")
          .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
          .slice(0, limit),
      getDealsProducts: () =>
        catalog
          .filter((p) => p.categorySlug !== "services")
          .map((p) => {
            const mrp = p.mrp || Math.round(p.price * 1.15);
            return {
              ...p,
              mrp,
              discountPercentage: Math.round(((mrp - p.price) / mrp) * 100),
              savings: mrp - p.price,
            };
          })
          .sort((a, b) => b.discountPercentage - a.discountPercentage),
      searchProducts: (query: string) => {
        const q = query.trim().toLowerCase();
        if (!q) return [];
        return catalog.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.model.toLowerCase().includes(q) ||
            p.categorySlug.toLowerCase().includes(q)
        );
      },
    };
  }, [catalog, catalogLoading]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
