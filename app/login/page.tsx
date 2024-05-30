import type { Metadata } from "next";
import { LoginPageContent } from "@/components/perturb/LoginPageContent";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Perturb AI account.",
};

export default function LoginPage() {
  return <LoginPageContent />;
}
