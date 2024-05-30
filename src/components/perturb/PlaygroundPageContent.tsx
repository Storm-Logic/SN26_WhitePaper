"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import {
  Upload,
  ImageIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Minus,
  Cpu,
  Lock,
  Zap,
  Clock,
} from "lucide-react";
import { createJob, getJob, proceedJob, getDailyLimit, addToWaitlist, type Job, type DailyLimit } from "@/lib/api";
import { useAuth } from "@/components/perturb/AuthProvider";

type UIState = "upload" | "classifying" | "classified" | "perturbing" | "result" | "error";

const POLL_INTERVAL_MS = 5000;

function ScoreBar({ value }: { value: number }) {
  const pct = Math.round(value);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-muted-foreground mb-1">
        <span>Confidence</span>
        <span className="font-mono font-semibold text-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full gradient-bg"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  score,
  delay = 0,
  className = "",
}: {
  label: string;
  value?: string | null;
  score?: number | null;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`glass rounded-2xl p-5 flex flex-col gap-3 ${className}`}
    >
      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
      {value ? (
        <>
          <p className="text-xl font-bold leading-tight gradient-text">{value}</p>
          {score != null && <ScoreBar value={score} />}
        </>
      ) : (
        <div className="space-y-2">
          <div className="h-5 w-3/4 rounded-lg bg-white/10 animate-pulse" />
          <div className="h-1.5 w-full rounded-full bg-white/10 animate-pulse" />
        </div>
      )}
    </motion.div>
  );
}

function SkeletonMetricCard({ label }: { label: string }) {
  return (
    <div className="glass rounded-2xl p-5 flex flex-col gap-3">
      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="space-y-2">
        <div className="h-5 w-3/4 rounded-lg bg-white/10 animate-pulse" />
        <div className="h-1.5 w-full rounded-full bg-white/10 animate-pulse" />
      </div>
    </div>
  );
}

const CLASSIFYING_STEPS = [
  "playground.steps.upload",
  "playground.steps.queued",
  "playground.steps.classifying",
  "playground.steps.classified",
];

const PERTURBING_STEPS = [
  "playground.steps.classification_done",
  "playground.steps.perturbing",
  "playground.steps.perturb_complete",
];

function ProcessingSteps({ steps, activeStep }: { steps: string[]; activeStep: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      {steps.map((key, i) => {
        const done = i < activeStep;
        const active = i === activeStep;
        return (
          <div key={key} className="flex items-center gap-3 text-sm">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                done
                  ? "bg-accent/20 border border-accent/50"
                  : active
                  ? "bg-primary/20 border border-primary/50"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              {done ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
              ) : active ? (
                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              )}
            </div>
            <span
              className={`transition-colors duration-300 ${
                done ? "text-accent" : active ? "text-foreground" : "text-muted-foreground/50"
              }`}
            >
              {t(key)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function PlaygroundPageContent() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistDone, setWaitlistDone] = useState(false);
  const [waitlistError, setWaitlistError] = useState("");

  const handleWaitlist = async () => {
    if (!user) return;
    setWaitlistLoading(true);
    setWaitlistError("");
    try {
      await addToWaitlist(user.id);
      setWaitlistDone(true);
    } catch (e) {
      setWaitlistError(e instanceof Error ? e.message : t("playground.auth.waitlist_error"));
    } finally {
      setWaitlistLoading(false);
    }
  };

  const [uiState, setUiState] = useState<UIState>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [dailyLimit, setDailyLimit] = useState<DailyLimit | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProceeding, setIsProceeding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const previewRef = useRef<string | null>(null);

  useEffect(() => {
    previewRef.current = preview;
  }, [preview]);

  // ─── Fetch daily limit ─────────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading || !user || (user.role !== "granted" && user.role !== "admin")) return;
    getDailyLimit().then(setDailyLimit).catch(() => {});
  }, [user, authLoading]);

  useEffect(() => {
    return () => {
      if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    };
  }, []);

  // ─── Poll: WAITING → CLASSIFIED ───────────────────────────────────────────
  useEffect(() => {
    if (uiState !== "classifying" || !jobId) return;

    const stepTimer = setTimeout(() => setActiveStep(1), 1500);

    intervalRef.current = setInterval(async () => {
      try {
        const data = await getJob(jobId);
        if (data.status === "CLASSIFIED") {
          clearInterval(intervalRef.current!);
          setActiveStep(3);
          await new Promise((r) => setTimeout(r, 500));
          setJob(data);
          setUiState("classified");
          setActiveStep(0);
        }
      } catch {
        // transient error — keep polling
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalRef.current!);
      clearTimeout(stepTimer);
    };
  }, [uiState, jobId]);

  // ─── Poll: PENDING → COMPLETE ─────────────────────────────────────────────
  useEffect(() => {
    if (uiState !== "perturbing" || !jobId) return;

    const stepTimer = setTimeout(() => setActiveStep(1), 2000);

    intervalRef.current = setInterval(async () => {
      try {
        const data = await getJob(jobId);
        if (data.status === "COMPLETE") {
          clearInterval(intervalRef.current!);
          setActiveStep(2);
          await new Promise((r) => setTimeout(r, 600));
          setJob(data);
          setUiState("result");
        }
      } catch {
        // transient error — keep polling
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(intervalRef.current!);
      clearTimeout(stepTimer);
    };
  }, [uiState, jobId]);

  const handleFile = useCallback(
    (f: File) => {
      if (!f.type.startsWith("image/")) {
        setErrorMsg(t("playground.upload.invalid_type"));
        setUiState("error");
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        setErrorMsg(t("playground.upload.too_large"));
        setUiState("error");
        return;
      }
      if (preview) URL.revokeObjectURL(preview);
      const url = URL.createObjectURL(f);
      setFile(f);
      setPreview(url);
    },
    [preview, t]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = async () => {
    if (!file) return;
    setIsSubmitting(true);
    setActiveStep(0);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const created = await createJob(fd);
      setJobId(created.id);
      // Decrement local limit counter
      setDailyLimit((prev) =>
        prev && prev.remaining !== null
          ? { ...prev, used: prev.used + 1, remaining: prev.remaining - 1 }
          : prev
      );
      setIsSubmitting(false);
      setUiState("classifying");
    } catch {
      setErrorMsg(t("playground.error.submit_failed"));
      setIsSubmitting(false);
      setUiState("error");
    }
  };

  const handleProceed = async () => {
    if (!jobId) return;
    setIsProceeding(true);
    try {
      await proceedJob(jobId);
      setActiveStep(0);
      setUiState("perturbing");
    } catch {
      setErrorMsg(t("playground.error.proceed_failed"));
      setUiState("error");
    } finally {
      setIsProceeding(false);
    }
  };

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    setFile(null);
    setJobId(null);
    setJob(null);
    setErrorMsg("");
    setActiveStep(0);
    setIsRefreshing(false);
    setIsProceeding(false);
    setUiState("upload");
  }, [preview]);

  const handleRefresh = useCallback(async () => {
    if (!jobId || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const data = await getJob(jobId);
      setJob(data);
      if (uiState === "classifying" && data.status === "CLASSIFIED") {
        clearInterval(intervalRef.current!);
        setActiveStep(3);
        await new Promise((r) => setTimeout(r, 300));
        setUiState("classified");
        setActiveStep(0);
      } else if (uiState === "perturbing" && data.status === "COMPLETE") {
        clearInterval(intervalRef.current!);
        setActiveStep(2);
        await new Promise((r) => setTimeout(r, 300));
        setUiState("result");
      }
    } catch {
      // silently ignore
    } finally {
      setIsRefreshing(false);
    }
  }, [jobId, isRefreshing, uiState]);

  const classDiff = job && job.initialClass && job.afterClass && job.initialClass !== job.afterClass;
  const scoreDiff =
    job?.initialModelScore != null && job?.afterScore != null
      ? job.afterScore - job.initialModelScore
      : null;

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 relative">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative text-center mb-8"
        >
          {(user?.role === "admin" || user?.role === "granted") && (
            <Link
              href="/playground/history"
              className="absolute top-0 right-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl glass text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Clock className="w-3.5 h-3.5" />
              {t("nav.history")}
            </Link>
          )}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 text-xs font-mono uppercase tracking-wider text-accent">
            <Sparkles className="w-3.5 h-3.5" />
            {t("playground.badge")}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {t("playground.title_prefix")}{" "}
            <span className="gradient-text">{t("playground.title_gradient")}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            {t("playground.subtitle")}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/30 text-xs font-mono text-primary">
            <Cpu className="w-3.5 h-3.5" />
            <span className="text-muted-foreground">{t("playground.model_label")}</span>
            <span className="font-semibold tracking-wide">EfficientNetV2-L</span>
          </div>
          {user?.role === "granted" && dailyLimit && dailyLimit.limit !== null && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center mt-3"
            >
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-mono ${
                dailyLimit.remaining === 0
                  ? "border border-red-400/30 text-red-400"
                  : "border-white/10 text-muted-foreground"
              }`}>
                <span>{dailyLimit.used} / {dailyLimit.limit} {t("playground.limit.jobs_today")}</span>
                {dailyLimit.remaining !== null && dailyLimit.remaining > 0 && (
                  <>
                    <span className="text-white/20">·</span>
                    <span className="text-accent">{dailyLimit.remaining} {t("playground.limit.remaining")}</span>
                  </>
                )}
                {dailyLimit.remaining === 0 && (
                  <>
                    <span className="text-white/20">·</span>
                    <span>{t("playground.limit.limit_reached")}</span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ─── UPLOAD STATE ──────────────────────────────────────────────────── */}
          {uiState === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl mx-auto"
            >
              {/* Auth gate: still loading */}
              {authLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : !user ? (
                /* Not authenticated */
                <div className="glass rounded-3xl p-10 text-center border border-primary/20">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                    <Lock className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t("playground.auth.login_required_title")}</h3>
                  <p className="text-muted-foreground text-sm mb-7 leading-relaxed">
                    {t("playground.auth.login_required_desc")}
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-primary-foreground font-medium glow hover:scale-105 transition-transform"
                  >
                    {t("auth.login_btn")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : user.role === "general" ? (
                /* Authenticated but no access — show waitlist CTA */
                <div className="glass rounded-3xl p-10 text-center border border-primary/20">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
                    <Lock className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{t("playground.auth.access_restricted_title")}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-7">
                    {t("playground.auth.access_restricted_desc")}
                  </p>
                  {waitlistDone ? (
                    <p className="text-sm font-medium text-accent">{t("playground.auth.waitlist_success")}</p>
                  ) : (
                    <>
                      <button
                        onClick={handleWaitlist}
                        disabled={waitlistLoading}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-primary-foreground font-medium glow hover:scale-105 transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                      >
                        {waitlistLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                        {waitlistLoading ? t("playground.auth.waitlist_pending") : t("playground.auth.waitlist_btn")}
                      </button>
                      {waitlistError && (
                        <p className="text-xs text-red-400 mt-3">{waitlistError}</p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                /* granted or admin — show upload form */
                <>
                  {dailyLimit?.remaining === 0 ? (
                    <div className="glass rounded-3xl p-10 text-center border border-amber-400/20 space-y-3">
                      <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                      <h3 className="text-xl font-bold">{t("playground.limit.exceeded_title")}</h3>
                      <p className="text-muted-foreground text-sm">{t("playground.limit.exceeded_desc")}</p>
                      {dailyLimit.resetsAt && (
                        <p className="text-xs text-muted-foreground font-mono">
                          {t("playground.limit.resets_label")}{" "}
                          {new Date(dailyLimit.resetsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      )}
                    </div>
                  ) : (<>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => !file && fileInputRef.current?.click()}
                    className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
                      ${isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-white/20 hover:border-primary/50 hover:bg-white/2"}
                      ${file ? "cursor-default" : ""}
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                    />

                    {preview ? (
                      <div className="relative">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full max-h-80 object-contain bg-black/20 p-2"
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); reset(); }}
                          className="absolute top-3 right-3 p-1.5 rounded-lg glass hover:border-red-400/50 transition-colors"
                        >
                          <XCircle className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                          <Upload className="w-7 h-7 text-primary" />
                        </div>
                        <p className="font-semibold text-foreground mb-1">{t("playground.upload.drag_title")}</p>
                        <p className="text-sm text-muted-foreground mb-4">{t("playground.upload.drag_subtitle")}</p>
                        <span className="px-4 py-1.5 rounded-lg glass text-xs font-mono text-muted-foreground">
                          PNG · JPG · WEBP · max 10 MB
                        </span>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {file && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.3 }}
                        className="mt-5 space-y-4"
                      >
                        <div className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                          <ImageIcon className="w-4 h-4 text-accent shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                        </div>

                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting}
                          className="w-full group inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl gradient-bg text-primary-foreground font-medium glow hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              {t("playground.upload.submitting")}
                            </>
                          ) : (
                            <>
                              {t("playground.upload.submit")}
                              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ─── CLASSIFYING STATE ─────────────────────────────────────────────── */}
          {uiState === "classifying" && (
            <motion.div
              key="classifying"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="flex flex-row justify-center items-center gap-2">
                <div className="flex items-center gap-3 glass rounded-2xl px-6 py-3 max-w-sm">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-sm font-medium">{t("playground.classifying.banner")}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-2  rounded-lg glass text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {t("playground.processing.original_label")}
                  </p>
                  {preview && (
                    <div className="glass rounded-2xl overflow-hidden">
                      <img src={preview} alt="Uploaded" className="w-full object-contain max-h-64 bg-black/20" />
                    </div>
                  )}
                  <ProcessingSteps steps={CLASSIFYING_STEPS} activeStep={activeStep} />
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {t("playground.classifying.results_label")}
                  </p>
                  <div className="glass rounded-2xl overflow-hidden">
                    <div className="w-full h-64 bg-white/5 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                        <ImageIcon className="w-10 h-10" />
                        <span className="text-xs font-mono">{t("playground.classifying.pending_label")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <SkeletonMetricCard label={t("playground.result.initial_class")} />
                    <SkeletonMetricCard label={t("playground.result.initial_score")} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── CLASSIFIED STATE ──────────────────────────────────────────────── */}
          {uiState === "classified" && job && (
            <motion.div
              key="classified"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >

              {/* Image + classification */}
              <div className="grid md:grid-cols-3 gap-8 items-stretch">
                <div className="flex flex-col gap-4 col-span-2">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {t("playground.result.original_label")}
                  </p>
                  <div className="glass rounded-2xl overflow-hidden h-72">
                    <Image
                      src={job.userImageUrl}
                      alt="Original"
                      width={600}
                      height={400}
                      className="w-full h-full object-contain bg-black/20"
                    />
                  </div>
                </div>

                <div className="flex flex-col justify-start gap-3">
                  <p className="text-xs mb-2 font-mono uppercase tracking-wider text-muted-foreground">
                    {t("playground.classified.classification_label")}
                  </p>
                  <div className="flex flex-col flex-1 gap-3">
                    <MetricCard
                      label={t("playground.result.initial_class")}
                      value={job.initialClass}
                      delay={0.05}
                    />
                    <MetricCard
                      label={t("playground.result.initial_score")}
                      value={job.initialModelScore != null ? `${Math.round(job.initialModelScore * 100)}%` : undefined}
                      score={job.initialModelScore != null ? job.initialModelScore * 100 : undefined}
                      delay={0.1}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              {/* Example images of same class */}
              {job.exampleImageUrls && job.exampleImageUrls.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {t("playground.classified.examples_label", { class: job.initialClass ?? "" })}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {job.exampleImageUrls.map((url, i) => (
                      <motion.div
                        key={url}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass rounded-xl overflow-hidden aspect-square"
                      >
                        <Image
                          src={url}
                          alt={`Example ${i + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proceed CTA */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-6 border border-primary/20 text-center space-y-4"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold">{t("playground.classified.proceed_title")}</h3>
                </div>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  {t("playground.classified.proceed_desc")}
                </p>
                <button
                  onClick={handleProceed}
                  disabled={isProceeding}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl gradient-bg text-primary-foreground font-medium glow hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                >
                  {isProceeding ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("playground.classified.proceeding")}
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      {t("playground.classified.proceed_btn")}
                    </>
                  )}
                </button>
              </motion.div>

              <div className="flex justify-center">
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground text-sm hover:text-foreground transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  {t("playground.result.try_another")}
                </button>
              </div>
            </motion.div>
          )}

          {/* ─── PERTURBING STATE ──────────────────────────────────────────────── */}
          {uiState === "perturbing" && (
            <motion.div
              key="perturbing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8"
            >
              <div className="flex flex-row justify-center items-center gap-2">
                <div className="flex items-center gap-3 glass rounded-2xl px-6 py-3 max-w-sm">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-sm font-medium">{t("playground.perturbing.banner")}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-2  rounded-lg glass text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-stretch">
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {t("playground.result.original_label")}
                  </p>
                  {job?.userImageUrl && (
                    <div className="glass rounded-2xl overflow-hidden h-64">
                      <Image
                        src={job.userImageUrl}
                        alt="Original"
                        width={600}
                        height={400}
                        className="w-full h-full object-contain bg-black/20"
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <MetricCard label={t("playground.result.initial_class")} value={job?.initialClass} />
                    <MetricCard
                      label={t("playground.result.initial_score")}
                      value={job?.initialModelScore != null ? `${Math.round(job.initialModelScore * 100)}%` : undefined}
                      score={job?.initialModelScore != null ? job.initialModelScore * 100 : undefined}
                    />
                  </div>
                  <ProcessingSteps steps={PERTURBING_STEPS} activeStep={activeStep} />
                </div>

                <div className="flex flex-col gap-4">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {t("playground.result.adversarial_label")}
                  </p>
                  <div className="glass rounded-2xl overflow-hidden h-64">
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                        <ImageIcon className="w-10 h-10" />
                        <span className="text-xs font-mono">{t("playground.perturbing.pending_label")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <SkeletonMetricCard label={t("playground.result.after_class")} />
                    <SkeletonMetricCard label={t("playground.result.after_score")} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ─── RESULT STATE ──────────────────────────────────────────────────── */}
          {uiState === "result" && job && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 glass rounded-2xl px-6 py-3 max-w-sm mx-auto border border-accent/30"
              >
                <CheckCircle2 className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">{t("playground.result.success_banner")}</span>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {t("playground.result.original_label")}
                  </p>
                  <div className="glass rounded-2xl overflow-hidden">
                    <Image
                      src={job.userImageUrl}
                      alt="Original"
                      width={600}
                      height={400}
                      className="w-full object-contain max-h-64 bg-black/20"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {t("playground.result.adversarial_label")}
                  </p>
                  {job.processedImageUrl ? (
                    <div className="glass rounded-2xl overflow-hidden ring-1 ring-primary/30">
                      <Image
                        src={job.processedImageUrl}
                        alt="Adversarial"
                        width={600}
                        height={400}
                        className="w-full object-contain max-h-64 bg-black/20"
                      />
                    </div>
                  ) : (
                    <div className="glass rounded-2xl h-64 flex items-center justify-center text-muted-foreground/50">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label={t("playground.result.initial_class")} value={job.initialClass} delay={0.05} />
                <MetricCard
                  label={t("playground.result.initial_score")}
                  value={job.initialModelScore != null ? `${Math.round(job.initialModelScore * 100)}%` : undefined}
                  score={job.initialModelScore != null ? job.initialModelScore * 100 : undefined}
                  delay={0.1}
                />
                <MetricCard label={t("playground.result.after_class")} value={job.afterClass} delay={0.15} />
                <MetricCard
                  label={t("playground.result.after_score")}
                  value={job.afterScore != null ? `${Math.round(job.afterScore * 100)}%` : undefined}
                  score={job.afterScore != null ? job.afterScore * 100 : undefined}
                  delay={0.2}
                />
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex justify-end"
              >
                <div className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground/60">
                  <Cpu className="w-3 h-3" />
                  <span>{t("playground.model_label")}</span>
                  <span className="text-muted-foreground">EfficientNetV2-L</span>
                </div>
              </motion.div>

              {(classDiff || scoreDiff != null) && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="glass rounded-2xl p-5 border border-primary/20"
                >
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    {classDiff && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{t("playground.result.class_changed")}</span>
                        <span className="font-mono text-foreground font-medium">{job.initialClass}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-primary" />
                        <span className="font-mono text-primary font-medium">{job.afterClass}</span>
                      </div>
                    )}
                    {scoreDiff != null && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{t("playground.result.score_change")}</span>
                        {scoreDiff < -0.01 ? (
                          <span className="flex items-center gap-1 text-accent font-mono font-medium">
                            <TrendingDown className="w-3.5 h-3.5" />
                            {Math.round(scoreDiff * 100)}%
                          </span>
                        ) : scoreDiff > 0.01 ? (
                          <span className="flex items-center gap-1 text-red-400 font-mono font-medium">
                            <TrendingUp className="w-3.5 h-3.5" />
                            +{Math.round(scoreDiff * 100)}%
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-muted-foreground font-mono">
                            <Minus className="w-3.5 h-3.5" />
                            0%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {job.exampleImageUrls && job.exampleImageUrls.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="space-y-3"
                >
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {t("playground.result.original_examples_label", { class: job.initialClass ?? "" })}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {job.exampleImageUrls.map((url, i) => (
                      <motion.div
                        key={url}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.35 + i * 0.05 }}
                        className="glass rounded-xl overflow-hidden aspect-square"
                      >
                        <Image
                          src={url}
                          alt={`Original example ${i + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {job.perturbedExampleImageUrls && job.perturbedExampleImageUrls.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    {t("playground.result.perturbed_examples_label", { class: job.afterClass ?? "" })}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {job.perturbedExampleImageUrls.map((url, i) => (
                      <motion.div
                        key={url}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.05 }}
                        className="glass rounded-xl overflow-hidden aspect-square"
                      >
                        <Image
                          src={url}
                          alt={`Perturbed example ${i + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass text-foreground font-medium hover:border-primary/40 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t("playground.result.try_another")}
                </button>
              </div>
            </motion.div>
          )}
          {uiState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="max-w-md mx-auto"
            >
              <div className="glass rounded-3xl p-10 text-center border border-red-400/20">
                <div className="w-14 h-14 rounded-2xl bg-red-400/10 border border-red-400/20 flex items-center justify-center mx-auto mb-5">
                  <AlertTriangle className="w-7 h-7 text-red-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t("playground.error.title")}</h3>
                <p className="text-muted-foreground text-sm mb-7 leading-relaxed">{errorMsg}</p>
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-bg text-primary-foreground font-medium glow hover:scale-105 transition-transform"
                >
                  <RefreshCw className="w-4 h-4" />
                  {t("playground.error.try_again")}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
