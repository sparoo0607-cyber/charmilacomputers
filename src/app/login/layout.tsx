import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Login",
  description: "Sign in to your Charmila Computers account to track orders and manage purchases.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
