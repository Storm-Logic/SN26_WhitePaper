import type { Metadata } from "next";
import { HistoryPageContent } from "@/components/perturb/HistoryPageContent";

export const metadata: Metadata = {
  title: "My Jobs | Perturb AI",
  description: "View your last 10 adversarial perturbation jobs.",
};

export default function HistoryPage() {
  return <HistoryPageContent />;
}
