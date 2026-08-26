import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your Charmila Computers account.",
  robots: { index: false, follow: true },
};

export default function LoginLayout(props: LayoutProps<"/login">) {
  return <>{props.children}</>;
}
