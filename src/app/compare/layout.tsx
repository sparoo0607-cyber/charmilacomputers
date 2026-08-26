import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Products",
  description: "Compare specifications, pricing and features of PC components side by side at Charmila Computers.",
  alternates: { canonical: "/compare" },
};

export default function CompareLayout(props: LayoutProps<"/compare">) {
  return <>{props.children}</>;
}
