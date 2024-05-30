import type { Metadata } from "next";
import { PlaygroundPageContent } from "@/components/perturb/PlaygroundPageContent";

export const metadata: Metadata = {
  title: "Playground",
  description:
    "Upload an image and see how Perturb AI generates adversarial examples — revealing invisible vulnerabilities in AI models.",
};

export default function PlaygroundPage() {
  return <PlaygroundPageContent />;
}
