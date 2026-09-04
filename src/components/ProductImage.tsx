import Image from "next/image";

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  "cpu-1": "/images/products/cpu-3-intel-i3-12100f.png",
  "cpu-2": "/images/products/cpu-2-intel-i5-10400.png",
  "cpu-3": "/images/products/cpu-3-intel-i3-12100f.png",
  "cpu-4": "/images/products/processor.png",
  "cpu-5": "/images/products/ryzen-5-5600g.png",
  "cpu-6": "/images/products/cpu-6-ryzen-7-5700x.png",
  "cpu-7": "/images/products/cpu-7-intel-ultra-7-265k.png",
  "mb-1": "/images/products/mb-1-h610m.png",
  "mb-2": "/images/products/mb-2-b660m.png",
  "mb-3": "/images/products/mb-2-b660m.png",
  "mb-4": "/images/products/mb-5-z790.png",
  "mb-5": "/images/products/mb-5-z790.png",
  "ram-1": "/images/products/ram-1-corsair-8gb.png",
  "ram-2": "/images/products/corsair-lpx-16gb.png",
  "ram-3": "/images/products/ram.png",
  "ram-4": "/images/products/corsair-lpx-16gb.png",
  "ram-5": "/images/products/kingston-fury-32gb.png",
  "ssd-1": "/images/products/ssd.png",
  "ssd-2": "/images/products/samsung-980-500gb.png",
  "ssd-3": "/images/products/ssd-3-crucial-1tb.png",
  "ssd-4": "/images/products/ssd-4-wd-black-1tb.png",
  "ssd-5": "/images/products/ssd-2-samsung-500gb.png",
  "hdd-1": "/images/hdd.png",
  "hdd-2": "/images/hdd.png",
  "hdd-3": "/images/hdd.png",
  "hdd-4": "/images/hdd.png",
  "gpu-suprim": "/images/products/gpu-6-rtx-4080-super.png",
  "gpu-1": "/images/products/graphic card.png",
  "gpu-2": "/images/products/graphic card.png",
  "gpu-3": "/images/products/galax-rtx-5060ti.png",
  "gpu-4": "/images/products/gpu-4-rtx-4070-super.png",
  "gpu-5": "/images/products/gpu-5-rx-7800-xt.png",
  "gpu-6": "/images/products/gpu-6-rtx-4080-super.png",
  "psu-1": "/images/products/power supply.png",
  "psu-2": "/images/products/power supply.png",
  "psu-3": "/images/products/power supply.png",
  "psu-4": "/images/products/power supply.png",
  "cab-1": "/images/products/pc cabinet.png",
  "cab-2": "/images/products/pc cabinet.png",
  "cab-3": "/images/products/pc cabinet.png",
  "cab-4": "/images/products/pc cabinet.png",
  "cool-1": "/images/coolers.png",
  "cool-2": "/images/coolers.png",
  "cool-3": "/images/coolers.png",
  "mon-1": "/images/monitors.png",
  "mon-2": "/images/monitors.png",
  "mon-3": "/images/monitors.png",
  "mon-4": "/images/monitors.png",
  "kb-1": "/images/products/Gaming Keyboards.png",
  "kb-2": "/images/products/Gaming Keyboards.png",
  "kb-3": "/images/keyboards.png",
  "mouse-1": "/images/mice.png",
  "mouse-2": "/images/products/Gaming mice.png",
  "mouse-3": "/images/products/Gaming mice.png",
  "headset-1": "/images/products/gaming headsets.png",
  "headset-2": "/images/products/gaming headsets.png",
  "lap-1": "/images/laptops.png",
  "lap-2": "/images/laptops.png",
  "lap-3": "/images/laptops.png",
  "lap-4": "/images/laptops.png",
  "dt-1": "/images/desktops.png",
  "dt-2": "/images/desktops.png",
  "prn-1": "/images/printers.png",
  "prn-2": "/images/printers.png",
  "prn-3": "/images/printers.png",
  "cctv-1": "/images/cctv.png",
  "cctv-2": "/images/cctv.png",
  "cctv-3": "/images/cctv.png",
  "net-1": "/images/networking.png",
  "net-2": "/images/networking.png",
  "srv-1": "/images/services.png",
  "srv-2": "/images/services.png",
  "srv-3": "/images/services.png",
};

export default function ProductImage({
  categorySlug,
  productId,
  imageUrl,
  className = "",
}: {
  categorySlug: string;
  productId?: string;
  imageUrl?: string;
  className?: string;
}) {
  const src =
    imageUrl ||
    (productId ? PRODUCT_IMAGE_MAP[productId] : undefined) ||
    `/images/${categorySlug}.png`;

  return (
    <div className={`relative flex items-center justify-center rounded-lg overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={categorySlug}
        fill
        className="object-contain p-2"
      />
    </div>
  );
}
