import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Festive Deals & Offers",
  description:
    "Limited-time festive deals on processors, graphics cards, RAM, SSDs and custom PC combos at Charmila Computers.",
  alternates: { canonical: "/deals" },
};

export default function DealsLayout(props: LayoutProps<"/deals">) {
  return <>{props.children}</>;
}
