import Image from "next/image";

const PRODUCT_IMAGE_MAP: Record<string, string> = {
  "cpu-1": "/images/products/cpu-3-intel-i3-12100f.png",
  "cpu-2": "/images/products/cpu-2-intel-i5-10400.png",
  "cpu-3": "/images/products/cpu-3-intel-i3-12100f.png",
  "cpu-4": "/images/products/cpu-2-intel-i5-10400.png",
  "cpu-5": "/images/products/ryzen-5-5600g.png",
  "cpu-6": "/images/products/cpu-6-ryzen-7-5700x.png",
  "cpu-7": "/images/products/cpu-7-intel-ultra-7-265k.png",
  "gpu-1": "/images/products/graphic card.png",
  "gpu-2": "/images/products/gpu-2-rtx-3060.png",
  "gpu-3": "/images/products/galax-rtx-5060ti.png",
  "gpu-4": "/images/products/gpu-4-rtx-4070-super.png",
  "gpu-5": "/images/products/gpu-5-rx-7800-xt.png",
  "gpu-6": "/images/products/gpu-6-rtx-4080-super.png",
  "gpu-suprim": "/images/products/graphic card.png",
  "mb-1": "/images/products/mb-1-h610m.png",
  "mb-2": "/images/products/mb-2-b660m.png",
  "mb-3": "/images/products/mb-2-b660m.png",
  "mb-4": "/images/products/mb-5-z790.png",
  "mb-5": "/images/products/mb-5-z790.png",
  "ram-1": "/images/products/ram-1-corsair-8gb.png",
  "ram-2": "/images/products/corsair-lpx-16gb.png",
  "ram-3": "/images/products/corsair-lpx-16gb.png",
  "ram-4": "/images/products/kingston-fury-32gb.png",
  "ram-5": "/images/products/kingston-fury-32gb.png",
  "ssd-1": "/images/products/ssd.png",
  "ssd-2": "/images/products/samsung-980-500gb.png",
  "ssd-3": "/images/products/ssd-3-crucial-1tb.png",
  "ssd-4": "/images/products/ssd-4-wd-black-1tb.png",
  "ssd-5": "/images/products/ssd-4-wd-black-1tb.png",
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
