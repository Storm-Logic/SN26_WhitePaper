"use client"

import { motion } from "framer-motion";
import { ArrowRight, Network } from "lucide-react";
import { FaXTwitter, FaGithub, FaDiscord } from "react-icons/fa6";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Hero() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const heroImage =
    mounted && resolvedTheme === "light"
      ? "/assets/hero-mesh-light.png"
      : "/assets/hero-mesh.jpg";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      <div className="absolute inset-0">
        <Image src={heroImage} alt="Abstract mesh background" className="w-full h-full object-cover opacity-50" width={1920} height={1280} />
        <div className="absolute inset-0 bg-linear-to-b from-background/40 via-background/60 to-background" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-xs font-mono uppercase tracking-wider text-muted-foreground"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          {t("hero.badge")}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6"
        >
          {t("hero.title1")} <br />
          {t("hero.title2")} <span className="gradient-text">{t("hero.title_gradient")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a href="/whitepaper" className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl gradient-bg text-primary-foreground font-medium glow hover:scale-105 transition-transform">
            {t("hero.cta_whitepaper")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="/playground" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl glass text-foreground font-medium hover:border-primary/40 transition-colors">
            <Network className="w-4 h-4" />
            {t("hero.cta_network")}
          </a>
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-20 grid grid-cols-3 gap-6 max-w-2xl mx-auto"
        >
          {[
            { v: "10K+", l: "Adversarial tests" },
            { v: "500+", l: "Active miners" },
            { v: "99.2%", l: "Detection rate" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-2xl md:text-3xl font-display font-bold gradient-text">{s.v}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="mt-20 flex items-center justify-center gap-6"
        >
          {/* TODO: Add social links back in once we have them live. */}
          {[
            { icon: <FaXTwitter className="w-5 h-5" />, label: "X", href: "https://x.com/perturbaix" },
            { icon: <FaGithub className="w-5 h-5" />, label: "GitHub", href: "https://github.com/0xsigurd/Perturb" },
            { icon: <FaDiscord className="w-5 h-5" />, label: "Discord", href: "https://discord.gg/swaJRFSF" },
          ].map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors text-sm font-medium"
            >
              {s.icon}
              {/* {s.label} */}
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}