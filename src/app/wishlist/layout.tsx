import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Wishlist",
  description: "View and manage your saved PC hardware components and wishlist at Charmila Computers.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
