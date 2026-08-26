import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warranty & RMA Center",
  description:
    "Register a warranty claim or RMA request for your Charmila Computers purchase. Genuine manufacturer warranty support pan-India.",
  alternates: { canonical: "/warranty-rma" },
};

export default function WarrantyRmaLayout(props: LayoutProps<"/warranty-rma">) {
  return <>{props.children}</>;
}
