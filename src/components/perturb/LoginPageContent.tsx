"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Loader2, Mail, Lock, Chrome, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { login, resendVerification } from "@/lib/api";
import { useAuth } from "@/components/perturb/AuthProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export function LoginPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResend = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    try {
      await resendVerification(email);
      setResendSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.error_generic"));
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverified(false);
    setResendSuccess(false);
    setLoading(true);
    try {
      await login(email, password);
      await refresh();
      router.push("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : t("auth.error_generic");
      setError(msg);
      if (msg.toLowerCase().includes("verif")) {
        setUnverified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 flex items-center justify-center relative">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {t("auth.login_title")}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("auth.login_subtitle")}
            </p>
          </div>

          {/* Google OAuth */}
          <a
            href={`${API_URL}/auth/google`}
            className="flex w-full items-center justify-center gap-3 px-4 py-3 rounded-xl glass border border-white/20 hover:border-primary/40 transition-colors text-sm font-medium mb-6"
          >
            <Chrome className="w-4 h-4" />
            {t("auth.google_signin")}
          </a> 

         <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-muted-foreground font-mono">{t("auth.or")}</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t("auth.email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm transition-colors placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t("auth.password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none text-sm transition-colors placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 px-4 py-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-sm"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
                {unverified && (
                  <div className="flex items-center gap-2 pl-6">
                    {resendSuccess ? (
                      <span className="text-green-400 text-xs">Verification email sent. Check your inbox.</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="text-xs underline underline-offset-2 hover:text-red-300 transition-colors disabled:opacity-60 flex items-center gap-1"
                      >
                        {resendLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                        Send verification email again
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl gradient-bg text-primary-foreground font-medium glow hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("auth.signing_in")}
                </>
              ) : (
                t("auth.login_btn")
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("auth.no_account")}{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              {t("auth.register_link")}
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
