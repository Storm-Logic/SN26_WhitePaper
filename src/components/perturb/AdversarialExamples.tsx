"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Play, X } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AdversarialExamples() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  // close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* ── Video modal ──── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* close button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
                aria-label={t("adversarial_examples.close_video")}
              >
                <X className="w-7 h-7" />
              </button>

              {/* iframe */}
              <div className="aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-primary/20">
                <iframe
                  src="https://www.youtube.com/embed/OnKe5YgW4zk?autoplay=1"
                  title={t("adversarial_examples.video_title")}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    <section id="adversarial-examples" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid py-6 lg:grid-cols-2 gap-18 items-center">
          {/* Left — YouTube video */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            {/* Diffuse background glow */}
            <div
              className="absolute -inset-6 bg-primary/10 blur-3xl -z-10 pointer-events-none"
              style={{ borderRadius: "60% 40% 55% 45% / 45% 55% 40% 60%" }}
            />

            {/* Gradient border wrapper — creates 2px gradient ring */}
            <div
              className="p-0.5 bg-linear-to-br from-primary via-accent/60 to-primary/30"
              style={{ borderRadius: "60% 40% 55% 45% / 45% 55% 40% 60%" }}
            >
              {/* Video container with matching blob shape */}
              <div
                className="overflow-hidden bg-zinc-950"
                style={{ borderRadius: "60% 40% 55% 45% / 45% 55% 40% 60%" }}
              >
                <div className="aspect-square w-full relative">
                  <button
                    onClick={() => setOpen(true)}
                    className="relative w-full h-full group"
                    aria-label={t("adversarial_examples.play_video")}
                  >
                    <Image
                      src="/assets/thubnail.jpg"
                      alt="Video thumbnail"
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover scale-110 group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* dark overlay */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                    {/* play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-6 h-6 text-zinc-900 fill-zinc-900 ml-1" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Floating accent dots */}
            <div className="absolute -top-4 -right-4 w-3 h-3 rounded-full bg-primary/80 blur-[1px]" />
            <div className="absolute -bottom-4 -left-4 w-2 h-2 rounded-full bg-accent/80 blur-[1px]" />
          </motion.div>

          {/* Right — text content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-block px-3 py-1 rounded-full glass mb-6 text-xs font-mono uppercase tracking-wider text-accent">
              {t("adversarial_examples.badge")}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {t("adversarial_examples.title_prefix")} <span className="gradient-text">{t("adversarial_examples.title_gradient")}</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              {t("adversarial_examples.p1")}
            </p>

            <div className="glass rounded-2xl p-6 border border-primary/10">
              <h3 className="text-xl font-bold mb-4 gradient-text">
                {t("adversarial_examples.card_title")}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("adversarial_examples.card_p1")}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t("adversarial_examples.card_p2")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
    </>
  );
}
