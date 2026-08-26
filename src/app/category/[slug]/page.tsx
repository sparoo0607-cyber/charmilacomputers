import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategory, categories } from "@/data/categories";
import { getProductsByCategoryLive } from "@/data/products";
import CategoryBrowser from "./CategoryBrowser";
import { BoltIcon } from "@/components/icons";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Category Not Found" };

  const title = `Buy ${category.name} Online — Best Prices`;
  return {
    title,
    description: category.blurb,
    alternates: { canonical: `/category/${category.slug}` },
    openGraph: { title, description: category.blurb, type: "website" },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const products = await getProductsByCategoryLive(slug);

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6 font-sans">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#D1121B] transition-colors">Home</Link>
        <span>/</span>
        <span className="text-[#1B1B1B] font-bold">{category.name}</span>
      </nav>

      {/* Category Header Banner */}
      <div className="mb-6 p-6 sm:p-8 bg-gradient-to-r from-[#263844] to-[#1D2B34] text-white rounded-2xl border border-[#C89B3C]/40 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 mb-2">
            <BoltIcon className="w-3.5 h-3.5" /> Official Brand Authorized Store
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{category.name}</h1>
          <p className="text-xs sm:text-sm text-zinc-300 mt-1.5 leading-relaxed">{category.blurb}</p>
        </div>
      </div>

      <CategoryBrowser products={products} />
    </div>
  );
}
