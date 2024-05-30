"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export function BlogPageContent() {
  const { t } = useTranslation();
  const POSTS = [
    {
      slug: "adversarial-attacks-101",
      title: t("blog.post1_title"),
      excerpt: t("blog.post1_excerpt"),
      date: t("blog.coming_soon"),
      tag: t("blog.post1_tag"),
    },
    {
      slug: "decentralized-red-teaming",
      title: t("blog.post2_title"),
      excerpt: t("blog.post2_excerpt"),
      date: t("blog.coming_soon"),
      tag: t("blog.post2_tag"),
    },
    {
      slug: "robustness-benchmarks",
      title: t("blog.post3_title"),
      excerpt: t("blog.post3_excerpt"),
      date: t("blog.coming_soon"),
      tag: t("blog.post3_tag"),
    },
  ];
  return (
    <div className="min-h-[60vh] bg-background text-foreground">
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 text-xs font-mono uppercase tracking-wider text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              {t("blog.badge")}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-2">
              {t("blog.title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("blog.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSTS.map((post, i) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group glass rounded-2xl p-6 hover:border-primary/40 transition-colors flex flex-col"
              >
                <div className="flex items-center justify-between mb-4 text-xs font-mono uppercase text-muted-foreground">
                  <span className="text-accent">{post.tag}</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                </div>
                <h2 className="font-display font-bold text-xl mb-3 group-hover:gradient-text transition-all">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-6 flex-1">{post.excerpt}</p>
                <span className="inline-flex items-center gap-1.5 text-sm text-primary-glow">
                  {t("blog.read_article")}{" "}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("blog.back_home")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
