"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FinalCTA() {
  const { t } = useTranslation();
  return (
    <section className="relative py-32 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden glass p-12 md:p-20 text-center"
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-transparent to-secondary/20" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-125 h-125 bg-primary/30 blur-[120px] rounded-full" />
        <div className="relative">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            {t("cta.title_prefix")} <br /> <span className="gradient-text">{t("cta.title_gradient")}</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            {t("cta.subtitle")}
          </p>
          <a href="#contact" className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl gradient-bg text-primary-foreground font-medium glow hover:scale-105 transition-transform">
            {t("cta.btn")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}