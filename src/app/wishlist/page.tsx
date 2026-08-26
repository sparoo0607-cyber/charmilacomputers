"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { getProduct, getFeaturedProducts } from "@/data/products";
import { formatINR } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import { HeartIcon, TrashIcon, CartIcon } from "@/components/icons";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  const items = wishlist.map((id) => getProduct(id)).filter(Boolean);
  const recommendations = getFeaturedProducts(4);

  function handleMoveAllToCart() {
    items.forEach((p) => {
      if (p) addToCart(p.id, 1);
    });
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center font-sans">
        <div className="w-20 h-20 bg-red-50 text-[#D1121B] rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
          <HeartIcon className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-black text-[#1B1B1B] mb-2">Your Wishlist is Empty</h1>
        <p className="text-xs sm:text-sm text-zinc-500 mb-8 max-w-md mx-auto">
          Keep track of your dream components, compare prices, and save builds for future upgrades.
        </p>
        <Link
          href="/"
          className="inline-block bg-[#D1121B] hover:bg-[#7A1118] text-white font-bold text-xs uppercase tracking-wider px-8 py-3 rounded-xl transition-all shadow-md active:scale-95 mb-14"
        >
          Explore Trending Components
        </Link>

        {/* Recommended Products */}
        <div className="text-left border-t border-[#E5E0D7] pt-10">
          <h2 className="text-lg font-bold text-[#1B1B1B] mb-4">Recommended For You</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommendations.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8 font-sans">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#D1121B]">Home</Link>
        <span>/</span>
        <span className="text-[#1B1B1B] font-bold">My Wishlist</span>
      </nav>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#E5E0D7] gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B1B1B]">
            My Wishlist ({items.length} {items.length === 1 ? "Product" : "Products"})
          </h1>
          <p className="text-xs text-zinc-500 mt-1">Saved hardware and components ready for your next setup.</p>
        </div>

        <button
          onClick={handleMoveAllToCart}
          className="bg-[#7A1118] hover:bg-[#D1121B] text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-sm flex items-center gap-2"
        >
          <CartIcon className="w-4 h-4" /> Move All to Cart
        </button>
      </div>

      {/* Wishlist Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((prod) => (
          <div
            key={prod!.id}
            className="bg-white rounded-2xl border border-[#E5E0D7] shadow-sm overflow-hidden flex flex-col p-4 relative group hover:shadow-md transition-all"
          >
            <button
              onClick={() => removeFromWishlist(prod!.id)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-zinc-100 text-zinc-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
              title="Remove from wishlist"
            >
              <TrashIcon className="w-4 h-4" />
            </button>

            <Link href={`/product/${prod!.id}`} className="bg-[#FAF7F2] p-4 rounded-xl mb-3 flex items-center justify-center">
              <ProductImage categorySlug={prod!.categorySlug} className="w-36 h-36 object-contain" />
            </Link>

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-[#7A1118] uppercase tracking-wider bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  {prod!.brand}
                </span>
                <Link
                  href={`/product/${prod!.id}`}
                  className="mt-1 block font-bold text-sm text-[#1B1B1B] hover:text-[#D1121B] transition-colors line-clamp-2"
                >
                  {prod!.name}
                </Link>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-black text-base text-[#1B1B1B]">{formatINR(prod!.price)}</span>
                  {prod!.mrp && <span className="text-xs text-zinc-400 line-through">{formatINR(prod!.mrp)}</span>}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
                <button
                  onClick={() => addToCart(prod!.id, 1)}
                  disabled={!prod!.inStock}
                  className="flex-1 py-2.5 bg-[#1B1B1B] hover:bg-[#D1121B] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1.5 disabled:bg-zinc-300"
                >
                  <CartIcon className="w-3.5 h-3.5" /> Move to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
