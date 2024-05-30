import type { Metadata } from "next";
import { BlogPageContent } from "@/components/perturb/BlogPageContent";

export const metadata: Metadata = {
  title: "Blog — Perturb",
  description:
    "Insights on adversarial robustness, AI security, and decentralized model testing.",
  openGraph: {
    title: "Perturb Blog — Adversarial AI Research",
    description:
      "Insights on adversarial robustness, AI security, and decentralized model testing.",
  },
};

export default function BlogPage() {
  return <BlogPageContent />;
}
