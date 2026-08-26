import Link from "next/link";
import type { Metadata } from "next";
import { products, getFeaturedProducts } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { SearchIcon, BoltIcon } from "@/components/icons";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
  const { q = "" } = await searchParams;
  return {
    title: q ? `Search results for "${q}"` : "Search",
    description: q
      ? `Browse products matching "${q}" at Charmila Computers.`
      : "Search Charmila Computers' catalog of PC components, graphics cards, processors and more.",
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();
  const results = query
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.model.toLowerCase().includes(query) ||
          p.categorySlug.toLowerCase().includes(query)
      )
    : [];

  const trendingItems = getFeaturedProducts(4);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8 font-sans">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#D1121B]">Home</Link>
        <span>/</span>
        <span className="text-[#1B1B1B] font-bold">Search</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1B1B1B]">
          Search Results {q && <span>for &ldquo;{q}&rdquo;</span>}
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          {results.length} matching {results.length === 1 ? "product" : "products"} found in catalog
        </p>
      </div>

      {results.length === 0 ? (
        <div className="space-y-12">
          <div className="bg-white p-12 rounded-3xl border border-[#E5E0D7] text-center space-y-4 max-w-xl mx-auto">
            <div className="w-14 h-14 bg-red-50 text-[#D1121B] rounded-full flex items-center justify-center mx-auto">
              <SearchIcon className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900">No exact matches found for &ldquo;{q}&rdquo;</h2>
            <p className="text-xs text-zinc-500">
              Check the spelling or try searching for general categories like &ldquo;RTX&rdquo;, &ldquo;Ryzen&rdquo;, &ldquo;DDR5&rdquo;, or &ldquo;SSD&rdquo;.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              {["RTX 5060", "Ryzen 7", "Corsair 16GB", "Samsung 980", "Liquid Cooler"].map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="text-xs bg-[#FAF7F2] hover:bg-amber-100/60 font-bold text-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-300"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>

          <section>
            <h3 className="text-lg font-black text-[#1B1B1B] uppercase tracking-wider mb-4 flex items-center gap-2">
              <BoltIcon className="w-4 h-4 text-amber-500" /> Trending Hardware Recommendations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {trendingItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
