"use client";

import { motion } from "framer-motion";
import { Mail, Github, Send } from "lucide-react";
import { FaXTwitter, FaDiscord } from "react-icons/fa6";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function Contact() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  return (
    <section id="contact" className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-block px-3 py-1 rounded-full glass mb-4 text-xs font-mono uppercase tracking-wider text-accent">{t("contact.badge")}</div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{t("contact.title_prefix")} <span className="gradient-text">{t("contact.title_gradient")}</span></h2>
          <p className="text-muted-foreground text-lg mb-8">
            {t("contact.subtitle")}
          </p>

          <div className="space-y-4">
            <a href="mailto:hello@perturb.ai" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="w-5 h-5 text-primary-glow" />
              hello@perturbai.io
            </a>
            <div className="flex items-center gap-3 pt-2">
              {[
                { Icon: FaDiscord, href: "https://discord.gg/swaJRFSF" },
                { Icon: Github, href: "https://github.com/0xsigurd/Perturb" },
                { Icon: FaXTwitter, href: "https://x.com/perturbaix" },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg glass flex items-center justify-center hover:border-primary/50 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="mt-10 glass rounded-2xl p-6">
            <h3 className="font-bold mb-1">{t("contact.newsletter_title")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("contact.newsletter_desc")}</p>
            <div className="flex gap-2">
              <input type="email" placeholder={t("contact.newsletter_placeholder")} className="flex-1 bg-input rounded-lg px-3 py-2 text-sm border border-border focus:border-primary outline-none" />
              <button className="px-4 py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium">{t("contact.newsletter_btn")}</button>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="glass rounded-2xl p-8 space-y-5"
        >
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t("contact.form_name")}</label>
            <input required className="mt-2 w-full bg-input rounded-lg px-4 py-3 border border-border focus:border-primary outline-none transition-colors" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t("contact.form_email")}</label>
            <input type="email" required className="mt-2 w-full bg-input rounded-lg px-4 py-3 border border-border focus:border-primary outline-none transition-colors" />
          </div>
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{t("contact.form_message")}</label>
            <textarea required rows={5} className="mt-2 w-full bg-input rounded-lg px-4 py-3 border border-border focus:border-primary outline-none resize-none transition-colors" />
          </div>
          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl gradient-bg text-primary-foreground font-medium glow hover:scale-[1.02] transition-transform">
            {sent ? t("contact.form_sent") : <>{t("contact.form_send")} <Send className="w-4 h-4" /></>}
          </button>
        </motion.form>
      </div>
    </section>
  );
}