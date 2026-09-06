import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  description: "View and manage your orders, saved addresses, and profile at Charmila Computers.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
