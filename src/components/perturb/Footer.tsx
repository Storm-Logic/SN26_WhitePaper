"use client";

import { Shield, Github, Twitter, X } from "lucide-react";
import { FaDiscord } from "react-icons/fa6";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    mounted && resolvedTheme === "dark"
      ? "/logo/Perturb_Logo_Dark.svg"
      : "/logo/Perturb_Logo_Light.svg";

  return (
    <footer className="border-t border-border py-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-display font-bold text-xl mb-3">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
               <Image src={logoSrc} alt="Perturb AI Logo" width={32} height={32} className="rounded-lg" />
            </div>
            <span className="gradient-text">Perturb AI</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            {t("footer.tagline")}
          </p>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-3">{t("footer.product")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/#adversarial-examples" className="hover:text-foreground">{t("nav.adversarial_examples")}</a></li>
            <li><a href="/#features" className="hover:text-foreground">{t("nav.features")}</a></li>
            <li><Link href="/blog" className="hover:text-foreground">{t("nav.blog")}</Link></li>
            <li><Link href="/whitepaper" className="hover:text-foreground">{t("nav.whitepaper")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-sm mb-3">{t("footer.company")}</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="/#team" className="hover:text-foreground">{t("nav.team")}</a></li>
            <li><a href="/#contact" className="hover:text-foreground">{t("nav.contact")}</a></li>
          </ul>
          <div className="flex items-center gap-3 mt-4 text-muted-foreground">
            <a href="https://discord.gg/swaJRFSF" target="_blank" rel="noopener noreferrer" className="hover:text-primary-glow"><FaDiscord className="w-4 h-4" /></a>
            <a href="https://github.com/0xsigurd/Perturb" target="_blank" rel="noopener noreferrer" className="hover:text-primary-glow"><Github className="w-4 h-4" /></a>
            <a href="https://x.com/perturbaix" target="_blank" rel="noopener noreferrer" className="hover:text-primary-glow"><X className="w-4 h-4" /></a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-border text-xs text-muted-foreground flex justify-between">
        <span>© {new Date().getFullYear()} Perturb AI. {t("footer.rights")}</span>
        <span className="font-mono">subnet · bittensor</span>
      </div>
    </footer>
  );
}