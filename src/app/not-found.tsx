import Link from "next/link";
import { ComputerIcon, SearchIcon, BoltIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[900px] px-4 sm:px-6 py-16 sm:py-24 font-sans text-center">
      <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-[#FAF7F2] border border-[#E5E0D7] flex items-center justify-center">
        <ComputerIcon className="w-10 h-10 text-[#7A1118]" />
      </div>

      <p className="text-sm font-black text-[#D1121B] uppercase tracking-widest mb-2">Error 404</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B1B1B] tracking-tight mb-3">
        This page has gone out of stock.
      </h1>
      <p className="text-sm sm:text-base text-zinc-600 max-w-md mx-auto mb-8">
        We couldn&apos;t find the page you were looking for. It may have been moved, sold out, or the link might be
        incorrect.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
        <Link
          href="/"
          className="bg-[#D1121B] hover:bg-[#7A1118] text-white text-sm font-bold px-6 py-3 rounded-xl uppercase tracking-wider transition-all shadow-md active:scale-95"
        >
          Back to Home
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 bg-white border border-zinc-300 hover:border-[#7A1118] text-zinc-800 text-sm font-bold px-6 py-3 rounded-xl uppercase tracking-wider transition-colors shadow-2xs"
        >
          <SearchIcon className="w-4 h-4" /> Search Products
        </Link>
      </div>

      <div className="bg-[#FAF7F2] border border-[#E5E0D7] rounded-2xl p-6 sm:p-8 text-left">
        <h2 className="text-xs font-black text-[#1B1B1B] uppercase tracking-wider mb-4 flex items-center gap-2">
          <BoltIcon className="w-4 h-4 text-amber-600" /> Popular Categories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <Link href="/category/processors" className="hover:text-[#D1121B] font-medium transition-colors">
            Processors
          </Link>
          <Link href="/category/graphics-cards" className="hover:text-[#D1121B] font-medium transition-colors">
            Graphics Cards
          </Link>
          <Link href="/category/motherboards" className="hover:text-[#D1121B] font-medium transition-colors">
            Motherboards
          </Link>
          <Link href="/build-your-pc" className="hover:text-[#D1121B] font-medium transition-colors">
            Build Your PC
          </Link>
        </div>
      </div>
    </div>
  );
}
