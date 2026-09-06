import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Customer Account",
  description: "Create a new Charmila Computers account to earn bonus coins and track orders.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
