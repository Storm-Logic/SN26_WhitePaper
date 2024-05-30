import type { Metadata } from "next";
import { RegisterPageContent } from "@/components/perturb/RegisterPageContent";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create a Perturb AI account.",
};

export default function RegisterPage() {
  return <RegisterPageContent />;
}
