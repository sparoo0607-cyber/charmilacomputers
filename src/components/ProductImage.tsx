import Image from "next/image";

// Products carry their own image_url from Supabase. There used to be a
// hand-written id → file map here (a second copy of the one in
// src/data/products.ts) covering the bundled seed catalog only, pointing at
// photos under /images/products/. Those files are gone along with the seed
// catalog, and the map could never cover a product added from the admin
// panel anyway — a product with no image now gets a neutral placeholder.
export const PRODUCT_PLACEHOLDER = "/images/product-placeholder.svg";

export default function ProductImage({
  categorySlug,
  imageUrl,
  alt,
  className = "",
  priority = false,
}: {
  categorySlug: string;
  imageUrl?: string;
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  const src = imageUrl || PRODUCT_PLACEHOLDER;

  const fallbackAlt = alt || `${categorySlug.replace(/-/g, " ")} hardware product`;

  return (
    <div className={`relative flex items-center justify-center rounded-lg overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={fallbackAlt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        priority={priority}
        className="object-contain p-2"
      />
    </div>
  );
}
