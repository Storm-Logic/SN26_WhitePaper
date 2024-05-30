"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { LogOut, User, Shield } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "./AuthProvider";

export function Navbar() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const { user, loading: authLoading, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc =
    mounted && resolvedTheme === "dark"
      ? "/logo/Perturb_Logo_Dark.svg"
      : "/logo/Perturb_Logo_Light.svg";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
          <Image src={logoSrc} alt="Perturb AI Logo" width={32} height={32} className="rounded-lg" />
          <span className="gradient-text">Perturb AI</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
          <a href="/#problem" className="hover:text-foreground transition-colors">{t("nav.problem")}</a>
          <a href="/#adversarial-examples" className="hover:text-foreground transition-colors">{t("nav.adversarial_examples")}</a>
          <a href="/#features" className="hover:text-foreground transition-colors">{t("nav.features")}</a>
          <Link href="/blog" className="hover:text-foreground transition-colors">{t("nav.blog")}</Link>
          <Link href="/whitepaper" className="hover:text-foreground transition-colors">{t("nav.whitepaper")}</Link>
          {user && (
            <Link href="/playground" className="hover:text-foreground transition-colors">{t("nav.playground")}</Link>
          )}
          <a href="/#contact" className="hover:text-foreground transition-colors">{t("nav.contact")}</a>
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <Shield className="w-3.5 h-3.5" />
              {t("nav.admin")}
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher />
          {!authLoading && (
            user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg glass hover:border-primary/40 transition-colors text-xs"
                >
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span
                    className={`px-1 py-0.5 rounded font-mono text-xs border`}
                  >
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg glass text-sm text-muted-foreground hover:text-foreground hover:border-red-400/30 transition-colors"
                  title={t("auth.logout")}
                >
                  <LogOut className="w-4 h-4" />
                  {/* <span className="hidden md:inline">{t("auth.logout")}</span> */}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg gradient-bg text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                {t("auth.login_btn")}
              </Link>
            )
          )}
        </div>
      </div>
    </motion.header>
  );
}