"use client";

import { motion } from "framer-motion";
import { Network, Coins, Repeat, Zap, Target, LineChart } from "lucide-react";
import { useTranslation } from "react-i18next";

export function Features() {
  const { t } = useTranslation();
  const features = [
    { icon: Network, title: t("features.f1_title"), desc: t("features.f1_desc") },
    { icon: Coins, title: t("features.f2_title"), desc: t("features.f2_desc") },
    { icon: Repeat, title: t("features.f3_title"), desc: t("features.f3_desc") },
    { icon: Zap, title: t("features.f4_title"), desc: t("features.f4_desc") },
    { icon: Target, title: t("features.f5_title"), desc: t("features.f5_desc") },
    { icon: LineChart, title: t("features.f6_title"), desc: t("features.f6_desc") },
  ];
  return (
    <section id="features" className="relative py-32 px-6">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20 max-w-2xl mx-auto"
        >
          <div className="inline-block px-3 py-1 rounded-full glass mb-4 text-xs font-mono uppercase tracking-wider text-accent">{t("features.badge")}</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("features.title_prefix")} <span className="gradient-text">{t("features.title_gradient")}</span></h2>
          <p className="text-muted-foreground text-lg">{t("features.subtitle")}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group glass rounded-2xl p-7 hover:border-primary/50 transition-all hover:-translate-y-1 text-center"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors mx-auto">
                <f.icon className="w-5 h-5 text-primary-glow " />
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}