"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export function Problem() {
  const { t } = useTranslation();
  return (
    <section id="problem" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-6 text-xs font-mono uppercase tracking-wider text-accent">
            <AlertTriangle className="w-3 h-3" /> {t("problem.badge")}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            {t("problem.title_prefix")} <span className="gradient-text">{t("problem.title_gradient")}</span> {t("problem.title_suffix")}...
          </h2> 
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            {t("problem.p1")}
          </p>
          <p className="text-muted-foreground leading-relaxed">
            {t("problem.p2")}
          </p>

          <div className="mt-8 flex items-center gap-6 font-mono text-xs">
            <div>
              <div className="text-muted-foreground">{t("problem.label_original")}</div>
              <div className="text-foreground font-medium">Panda · 57.7%</div>
            </div>
            <div className="text-accent text-2xl">→</div>
            <div>
              <div className="text-muted-foreground">{t("problem.label_perturbed")}</div>
              <div className="text-destructive font-medium">Gibbon · 99.3%</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="absolute -inset-4 bg-linear-to-tr from-primary/30 to-secondary/30 rounded-3xl blur-2xl" />
          <div className="relative rounded-2xl overflow-hidden border border-primary/20 glow">
            <Image src="/assets/adversarial.jpg" alt="Adversarial attack" className="w-full" loading="lazy" width={1280} height={896} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}