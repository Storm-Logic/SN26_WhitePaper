"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export function Product() {
  const { t } = useTranslation();
  const bullets = [
    t("product.b1"),
    t("product.b2"),
    t("product.b3"),
    t("product.b4"),
  ];
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-block px-3 py-1 rounded-full glass mb-4 text-xs font-mono uppercase tracking-wider text-accent">{t("product.badge")}</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("product.title_prefix")} <span className="gradient-text">{t("product.title_gradient")}</span></h2>
          <p className="text-muted-foreground text-lg">{t("product.subtitle")}</p>
        </motion.div>


        {/* Adversarial Example */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-20"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* Original */}
            <div className="glass rounded-2xl overflow-hidden border border-green-500/30 flex flex-col">
              <div className="relative w-full aspect-square bg-black/20">
                <Image
                  src="/example/original.jpg.webp"
                  alt="Original dog image"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 flex flex-col gap-2 flex-1">
                <p className="text-xs font-mono uppercase tracking-wider text-primary">
                  {t("product.example_original_title")}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("product.example_original_caption")}
                </p>
                {/* confidence */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-semibold ">
                    {t("product.example_prediction")}
                  </span>
                  <span className="text-xs ml-1">
                    59.2%
                  </span>
                </div>
                <div className="mt-auto pt-2 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm font-semibold text-green-400">
                    {t("product.example_prediction_original")}
                  </span>
                  <span className="text-xs text-green-400 ml-2 font-semibold">
                    · {t("product.example_correct")}
                  </span>
                </div>
              </div>
            </div>

            {/* Noise */}
            <div className="glass rounded-2xl overflow-hidden border border-accent/30 flex flex-col">
              <div className="relative w-full aspect-square bg-black/20">
                <Image
                  src="/example/noise.png"
                  alt="Imperceptible perturbation noise"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 flex flex-col gap-2 flex-1 items-center text-center">
                <p className="text-xs font-mono uppercase tracking-wider text-accent">
                  {t("product.example_noise_label")}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("product.example_noise_caption")}
                </p>
              </div>
            </div>

            {/* Adversarial */}
            <div className="glass rounded-2xl overflow-hidden border border-red-500/30 flex flex-col">
              <div className="relative w-full aspect-square bg-black/20">
                <Image
                  src="/example/adv.png.webp"
                  alt="Adversarial dog image"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 flex flex-col gap-2 flex-1">
                <p className="text-xs font-mono uppercase tracking-wider text-secondary">
                  {t("product.example_adversarial_title")}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("product.example_adversarial_caption")}
                </p>
                {/* confidence */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-semibold ">
                    {t("product.example_prediction")}
                  </span>
                  <span className="text-xs ml-1">
                    · 94.3%
                  </span>
                </div>
                <div className="mt-auto pt-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    {t("product.example_prediction_changed")}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-sm font-semibold text-red-400">
                      {t("product.example_prediction_adversarial")}
                    </span>
                    <span className="text-xs text-red-400 font-semibold ml-2">
                      · {t("product.example_fooled")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}