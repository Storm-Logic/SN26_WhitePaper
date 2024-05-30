"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Loader2, Mail, User, Lock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { updateMe } from "@/lib/api";
import { useAuth } from "@/components/perturb/AuthProvider";

export function ProfilePageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, refresh } = useAuth();

  // ── Info form ──────────────────────────────────────────────────────────────
  const [name, setName] = useState(user?.name ?? "");
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [infoSaved, setInfoSaved] = useState(false);

  // ── Password form ──────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaved, setPwSaved] = useState(false);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError(null);
    setInfoSaved(false);
    setInfoLoading(true);
    try {
      await updateMe({ name: name });
      await refresh();
      setInfoSaved(true);
      setTimeout(() => setInfoSaved(false), 3000);
    } catch (err) {
      setInfoError(err instanceof Error ? err.message : t("auth.error_generic"));
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPwError(t("profile.error_password_short"));
      return;
    }
    setPwError(null);
    setPwSaved(false);
    setPwLoading(true);
    try {
      await updateMe({ currentPassword, password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setPwSaved(true);
      setTimeout(() => setPwSaved(false), 3000);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : t("auth.error_generic"));
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-5 px-6 flex items-start justify-center relative">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-5xl space-y-6"
      >
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t("profile.back")}
        </button>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">{t("profile.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("profile.subtitle")}</p>
        </div>

        {/* ── Two-column layout: Account Info (2) + Change Password (1) ─────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── Account Info (spans 2 cols) ────────────────────────────────── */}
          <div className="lg:col-span-2 glass rounded-3xl p-8">
          <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-6">
            {t("profile.section_info")}
          </h2>

          <form onSubmit={handleInfoSubmit} className="space-y-4">
            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t("profile.field_email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  disabled
                  value={user?.email ?? ""}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-muted-foreground cursor-not-allowed opacity-60"
                />
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t("profile.field_name")}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("profile.field_name_placeholder")}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm transition-colors placeholder:text-muted-foreground/50"
                />
              </div>
              <p className="text-xs text-muted-foreground/60">{t("profile.field_name_hint")}</p>
            </div>



            {infoError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {infoError}
              </motion.div>
            )}

            {infoSaved && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {t("profile.saved")}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={infoLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl gradient-bg text-primary-foreground font-medium glow hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2"
            >
              {infoLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("profile.saving")}
                </>
              ) : (
                t("profile.save_info")
              )}
            </button>
          </form>
          </div>

          {/* ── Change Password (spans 1 col) ──────────────────────────────── */}
          <div className="lg:col-span-1 glass rounded-3xl p-8">
          <h2 className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-6">
            {t("profile.section_security")}
          </h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t("profile.field_current_password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm transition-colors placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t("profile.field_new_password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm transition-colors placeholder:text-muted-foreground/50"
                />
              </div>
              <p className="text-xs text-muted-foreground/60">{t("profile.field_new_password_hint")}</p>
            </div>

            {pwError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {pwError}
              </motion.div>
            )}

            {pwSaved && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {t("profile.saved")}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={pwLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl gradient-bg text-primary-foreground font-medium glow hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2"
            >
              {pwLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("profile.saving")}
                </>
              ) : (
                t("profile.save_password")
              )}
            </button>
          </form>
          </div>

        </div>{/* end two-column grid */}
      </motion.div>
    </div>
  );
}
