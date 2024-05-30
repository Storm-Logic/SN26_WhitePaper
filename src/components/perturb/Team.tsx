"use client";

import { motion } from "framer-motion";
import { Linkedin, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";

const team = [
  { name: "Koyuki Nakamori", role: "Co-Founder & CEO", initials: "KN" },
  { name: "Jeffrey Lamb", role: "Co-Founder & CTO", initials: "JL" },
  { name: "Vadym Shakuro", role: "Co-Founder & AI Advisor", initials: "VS" },
  { name: "Vidusha Sanidu", role: "Full Stack Engineer", initials: "VS" },
];

export function Team() {
  const { t } = useTranslation();
  return (
    <section id="team" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <div className="inline-block px-3 py-1 rounded-full glass mb-4 text-xs font-mono uppercase tracking-wider text-accent">{t("team.badge")}</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">{t("team.title_prefix")} <span className="gradient-text">{t("team.title_gradient")}</span></h2>
          <p className="text-muted-foreground text-lg italic">
            &quot;{t("team.quote")}&quot;
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {team.map((m, i) => (
            <motion.div
              key={m.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center hover:border-primary/40 transition-all hover:-translate-y-1"
            >
              <div className="w-20 h-20 mx-auto rounded-full gradient-bg flex items-center justify-center text-2xl font-display font-bold text-primary-foreground mb-4 glow">
                {m.initials}
              </div>
              <h3 className="font-bold">{m.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{m.role}</p>
              <div className="flex items-center justify-center gap-3 text-muted-foreground">
                <a href="#" className="hover:text-primary-glow transition-colors"><Linkedin className="w-4 h-4" /></a>
                <a href="#" className="hover:text-primary-glow transition-colors"><Twitter className="w-4 h-4" /></a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}