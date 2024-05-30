import type { Metadata } from "next";
import { Hero } from "@/components/perturb/Hero";
import { Problem } from "@/components/perturb/Problem";
import { AdversarialExamples } from "@/components/perturb/AdversarialExamples";
import { Features } from "@/components/perturb/Features";
import { Product } from "@/components/perturb/Product";
import { Team } from "@/components/perturb/Team";
import { FAQ } from "@/components/perturb/FAQ";
import { Contact } from "@/components/perturb/Contact";
import { FinalCTA } from "@/components/perturb/FinalCTA";

export const metadata: Metadata = {
  title: "Perturb AI — Harden Your AI Against Invisible Attacks",
  description:
    "Decentralized adversarial robustness network on Bittensor. Discover and patch AI vulnerabilities before attackers do.",
  openGraph: {
    title: "Perturb — Adversarial Robustness for AI",
    description:
      "A global, incentivized network that stress-tests your AI models against adversarial attacks.",
  },
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <main>
        <Hero />
        <Problem />
        <AdversarialExamples />
        <Product />
        <Features />
        <Team />
        <FAQ />
        <Contact />
        <FinalCTA />
      </main>
    </div>
  );
}
