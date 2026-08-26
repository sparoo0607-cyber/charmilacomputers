import BuildYourPc from "./BuildYourPc";
import Link from "next/link";

export const metadata = {
  title: "Custom PC Builder & Configurator",
  description:
    "Build your dream custom gaming PC, workstation, or office desktop with live compatibility checks, wattage calculator, and instant pricing from Charmila Computers.",
};

export default function BuildYourPcPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6 font-sans">
      {/* Breadcrumb */}
      <nav className="text-xs text-zinc-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#D1121B]">Home</Link>
        <span>/</span>
        <span className="text-[#1B1B1B] font-bold">Custom PC Builder</span>
      </nav>

      <BuildYourPc />
    </div>
  );
}
