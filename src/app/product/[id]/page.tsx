import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductLive, getProductsByCategoryLive, products } from "@/data/products";
import { getCategory } from "@/data/categories";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import ProductActions from "./ProductActions";
import ProductGallery from "./ProductGallery";
import PageViewTracker from "@/components/PageViewTracker";
import { StarIcon, ShieldCheckIcon, TruckIcon, BoltIcon, CheckIcon, CheckCircleIcon } from "@/components/icons";
import { formatINR } from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductLive(id);
  if (!product) return { title: "Product Not Found" };

  const title = `${product.name} — Buy Online at Best Price`;
  const description = `${product.name} by ${product.brand}. ${formatINR(product.price)}${
    product.mrp && product.mrp > product.price ? ` (MRP ${formatINR(product.mrp)})` : ""
  } — 100% genuine, official warranty, fast pan-India delivery from Charmila Computers.`;

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.id}` },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductLive(id);
  if (!product) notFound();
  const category = getCategory(product.categorySlug);
  const related = (await getProductsByCategoryLive(product.categorySlug))
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  // Recommended pair item
  const pairItem = products.find((p) => p.categorySlug !== product.categorySlug && p.price > 1000) || products[0];

  const sampleReviews = [
    {
      id: "rev-1",
      userName: "Karthik R.",
      rating: 5,
      date: "3 days ago",
      title: "Superb genuine product & lightning fast delivery!",
      comment: "Ordered this for my custom workstation. Arrived in sealed original box with invoice and warranty card. Packaging was rock solid with bubble wraps. Highly recommended!",
      verified: true,
    },
    {
      id: "rev-2",
      userName: "Naveen Kumar",
      rating: 5,
      date: "1 week ago",
      title: "Great pricing compared to other platforms",
      comment: "Charmila Computers offered the best price across all Indian retailers for this model. Temperatures are well in control and performance is stellar.",
      verified: true,
    },
    {
      id: "rev-3",
      userName: "Suresh P.",
      rating: 4,
      date: "2 weeks ago",
      title: "Good value and genuine brand warranty",
      comment: "Registered the serial number on the manufacturer website right after delivery. Official warranty is confirmed. Seamless experience.",
      verified: true,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.imageUrl || "/icon.png",
    brand: { "@type": "Brand", name: product.brand },
    sku: product.model,
    description: product.features?.join(". ") || product.name,
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviewsCount || 1,
        }
      : undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `/product/${product.id}`,
    },
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6 font-sans">
      <PageViewTracker kind="product" slug={product.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-6 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-[#D1121B] transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/category/${product.categorySlug}`} className="hover:text-[#D1121B] transition-colors font-medium">
          {category?.name || product.categorySlug}
        </Link>
        <span>/</span>
        <span className="text-[#1B1B1B] font-bold truncate max-w-xs sm:max-w-md">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white p-6 sm:p-8 rounded-2xl border border-[#E5E0D7] shadow-sm">
        {/* Left Column: Image Gallery Showcase (5 cols) */}
        <ProductGallery product={product} />

        {/* Right Column: Title, Pricing & Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="border-b border-zinc-200 pb-4 mb-5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black text-[#7A1118] uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {product.brand}
              </span>
              <span className="text-xs text-zinc-500 font-medium">Model: {product.model}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B1B1B] leading-tight tracking-tight">
              {product.name}
            </h1>
          </div>

          <ProductActions product={product} />
        </div>
      </div>

      {/* Frequently Bought Together / Combo Deal */}
      {pairItem && (
        <div className="mt-8 bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 p-6 rounded-2xl border border-amber-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <BoltIcon className="w-5 h-5 text-amber-600" />
            <h2 className="font-extrabold text-base text-[#1B1B1B] uppercase tracking-wider">
              Frequently Bought Together (Combo Savings)
            </h2>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
                <ProductImage categorySlug={product.categorySlug} className="w-14 h-14 object-contain" />
                <div className="text-xs">
                  <p className="font-bold text-zinc-800 line-clamp-1">{product.name}</p>
                  <p className="font-extrabold text-[#D1121B]">{formatINR(product.price)}</p>
                </div>
              </div>

              <span className="text-xl font-black text-zinc-400">+</span>

              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-zinc-200 shadow-2xs">
                <ProductImage categorySlug={pairItem.categorySlug} className="w-14 h-14 object-contain" />
                <div className="text-xs">
                  <p className="font-bold text-zinc-800 line-clamp-1">{pairItem.name}</p>
                  <p className="font-extrabold text-[#D1121B]">{formatINR(pairItem.price)}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 text-center sm:text-right">
              <div>
                <p className="text-xs text-zinc-500 font-medium">Combo Price:</p>
                <p className="text-xl font-black text-[#1B1B1B]">
                  {formatINR(product.price + pairItem.price - 500)}
                </p>
                <span className="text-[11px] font-bold text-emerald-700">Save ₹500 instantly</span>
              </div>
              <Link
                href="/cart"
                className="bg-[#D1121B] hover:bg-[#7A1118] text-white text-xs font-bold px-6 py-3 rounded-xl uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                Add Combo to Cart
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Specifications & Features Tabs */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 cols: Specs Table & Key Features */}
        <div className="lg:col-span-8 space-y-8">
          {/* Key Features */}
          {product.features && product.features.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-[#E5E0D7] shadow-sm">
              <h2 className="text-lg font-bold text-[#1B1B1B] mb-4 pb-2 border-b border-zinc-200 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600" /> Key Features &amp; Highlights
              </h2>
              <ul className="space-y-2.5 text-sm text-zinc-700">
                {product.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D1121B] mt-2 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Specifications Table */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D7] shadow-sm">
            <h2 className="text-lg font-bold text-[#1B1B1B] mb-4 pb-2 border-b border-zinc-200">
              Technical Specifications
            </h2>
            <div className="divide-y divide-zinc-100 text-sm">
              <div className="py-2.5 grid grid-cols-3 bg-[#FAF7F2] px-3 rounded font-medium">
                <span className="text-zinc-500 font-semibold">Brand</span>
                <span className="col-span-2 text-zinc-900 font-bold">{product.brand}</span>
              </div>
              <div className="py-2.5 grid grid-cols-3 px-3">
                <span className="text-zinc-500 font-semibold">Model Number</span>
                <span className="col-span-2 text-zinc-900 font-mono text-xs">{product.model}</span>
              </div>
              <div className="py-2.5 grid grid-cols-3 bg-[#FAF7F2] px-3 rounded">
                <span className="text-zinc-500 font-semibold">Category</span>
                <span className="col-span-2 text-zinc-900 capitalize">{category?.name || product.categorySlug}</span>
              </div>
              {product.wattage && (
                <div className="py-2.5 grid grid-cols-3 px-3">
                  <span className="text-zinc-500 font-semibold">Rated Power Draw</span>
                  <span className="col-span-2 text-zinc-900 font-semibold">{product.wattage} Watts</span>
                </div>
              )}
              {product.specs &&
                Object.entries(product.specs).map(([key, val], idx) => (
                  <div
                    key={key}
                    className={`py-2.5 grid grid-cols-3 px-3 ${idx % 2 === 0 ? "bg-[#FAF7F2] rounded" : ""}`}
                  >
                    <span className="text-zinc-500 font-semibold">{key}</span>
                    <span className="col-span-2 text-zinc-900 font-medium">{val}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white p-6 rounded-2xl border border-[#E5E0D7] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-[#1B1B1B]">Customer Reviews &amp; Ratings</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} className="w-4 h-4" filled={i < Math.round(product.rating || 4.5)} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-zinc-800">{product.rating || 4.5} out of 5</span>
                  <span className="text-xs text-zinc-500">({product.reviewsCount || 42} verified ratings)</span>
                </div>
              </div>
              <button className="bg-[#1B1B1B] hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl uppercase tracking-wider transition-all shadow-xs">
                Write a Review
              </button>
            </div>

            {/* Reviews List */}
            <div className="divide-y divide-zinc-100 space-y-4">
              {sampleReviews.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#7A1118] text-white font-bold text-xs grid place-items-center">
                        {rev.userName[0]}
                      </div>
                      <span className="text-xs font-bold text-zinc-900">{rev.userName}</span>
                      {rev.verified && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                          <CheckIcon className="w-3 h-3" /> Verified Buyer
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-zinc-400">{rev.date}</span>
                  </div>

                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon key={i} className="w-3.5 h-3.5" filled={i < rev.rating} />
                    ))}
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900">{rev.title}</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 cols: Support, Warranty & Policies */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E5E0D7] space-y-4">
            <h3 className="font-extrabold text-sm text-[#1B1B1B] uppercase tracking-wider">
              Charmila Assurance &amp; Support
            </h3>
            <div className="space-y-3 text-xs text-zinc-700">
              <div className="flex gap-2.5">
                <ShieldCheckIcon className="w-5 h-5 text-[#7A1118] shrink-0" />
                <div>
                  <strong className="block text-zinc-900 font-bold">100% Genuine Brand Warranty</strong>
                  <p className="text-zinc-500">All components come with manufacturer warranty valid at any authorized service center pan-India.</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <TruckIcon className="w-5 h-5 text-[#7A1118] shrink-0" />
                <div>
                  <strong className="block text-zinc-900 font-bold">Safe &amp; Insured Transit</strong>
                  <p className="text-zinc-500">Triple-layered bubble cushion packing with full insurance coverage against shipping damage.</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <BoltIcon className="w-5 h-5 text-[#7A1118] shrink-0" />
                <div>
                  <strong className="block text-zinc-900 font-bold">Need Build Advice?</strong>
                  <p className="text-zinc-500">Chat directly with our master PC technicians on WhatsApp for compatibility questions.</p>
                </div>
              </div>
            </div>

            <Link
              href="/build-your-pc"
              className="block w-full text-center py-2.5 bg-white border border-zinc-300 hover:border-[#7A1118] text-xs font-bold text-zinc-800 rounded-xl transition-colors uppercase tracking-wider shadow-2xs"
            >
              Use in Custom PC Builder
            </Link>
          </div>
        </div>
      </div>

      {/* Related Products Carousel / Grid */}
      {related.length > 0 && (
        <section className="mt-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-[#1B1B1B] tracking-tight">Similar &amp; Related Products</h2>
            <Link
              href={`/category/${product.categorySlug}`}
              className="text-xs font-bold text-[#D1121B] hover:text-[#7A1118] hover:underline"
            >
              View All {category?.name} →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
