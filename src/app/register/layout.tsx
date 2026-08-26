import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a new Charmila Computers account.",
  robots: { index: false, follow: true },
};

export default function RegisterLayout(props: LayoutProps<"/register">) {
  return <>{props.children}</>;
}
