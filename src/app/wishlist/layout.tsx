import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "Your saved products at Charmila Computers.",
  robots: { index: false, follow: true },
};

export default function WishlistLayout(props: LayoutProps<"/wishlist">) {
  return <>{props.children}</>;
}
