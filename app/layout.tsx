import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/perturb/Navbar";
import { Footer } from "@/components/perturb/Footer";
import { I18nProvider } from "@/components/perturb/I18nProvider";
import { Providers } from "@/components/perturb/Providers";
import { AuthProvider } from "@/components/perturb/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "Perturb AI — Harden Your AI Against Invisible Attacks",
    template: "%s — Perturb",
  },
  description:
    "Decentralized adversarial robustness network on Bittensor. Discover and patch AI vulnerabilities before attackers do.",
  openGraph: {
    title: "Perturb — Adversarial Robustness for AI",
    description:
      "A global, incentivized network that stress-tests your AI models against adversarial attacks.",
    type: "website",
  },
  twitter: {
    card: "summary",
    site: "@Perturb",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <AuthProvider>
            <I18nProvider>
              <Navbar />
              {children}
              <Footer />
            </I18nProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
