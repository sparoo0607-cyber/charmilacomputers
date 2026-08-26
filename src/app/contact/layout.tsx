import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Charmila Computers for sales, support and store locations. Call, WhatsApp or send us a message.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout(props: LayoutProps<"/contact">) {
  return <>{props.children}</>;
}
