import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "View and manage items in your Charmila Computers shopping cart.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
