"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthProvider";
import { getJob, Job } from "@/lib/api";
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Zap,
  Loader2,
  AlertCircle,
  ImageOff,
} from "lucide-react";

type StatusKey = NonNullable<Job["status"]>;

const STATUS_CONFIG: Record<
  StatusKey,
  { i18nKey: string; colorCls: string; bgCls: string; Icon: React.ElementType }
> = {
  WAITING: {
    i18nKey: "history.status_waiting",
    colorCls: "text-muted-foreground",
    bgCls: "bg-muted/50",
    Icon: Clock,
  },
  CLASSIFIED: {
    i18nKey: "history.status_classified",
    colorCls: "text-primary",
    bgCls: "bg-primary/10",
    Icon: Zap,
  },
  PENDING: {
    i18nKey: "history.status_pending",
    colorCls: "text-amber-500",
    bgCls: "bg-amber-500/10",
    Icon: Loader2,
  },
  COMPLETE: {
    i18nKey: "history.status_complete",
    colorCls: "text-emerald-500",
    bgCls: "bg-emerald-500/10",
    Icon: CheckCircle2,
  },
};

function StatusBadge({ status }: { status: Job["status"] }) {
  const { t } = useTranslation();
  const cfg = STATUS_CONFIG[status ?? "WAITING"];
  const { Icon } = cfg;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${cfg.colorCls} ${cfg.bgCls}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {t(cfg.i18nKey)}
    </span>
  );
}

function LargeImage({ src, label }: { src?: string | null; label: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="glass rounded-2xl overflow-hidden aspect-square w-full flex items-center justify-center bg-black/20">
        {src ? (
          <Image
            src={src}
            alt={label}
            width={600}
            height={600}
            className="w-full h-full object-contain"
          />
        ) : (
          <ImageOff className="w-10 h-10 text-muted-foreground/30" />
        )}
      </div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold font-mono">{value}</span>
    </div>
  );
}

export function JobDetailPageContent({ id }: { id: string }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== "granted" && user.role !== "admin")) {
      setLoading(false);
      return;
    }
    getJob(id)
      .then(setJob)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, user, authLoading]);

  const isRestricted =
    !authLoading && !loading && (!user || (user.role !== "granted" && user.role !== "admin"));

  return (
    <div className="min-h-screen gradient-bg grid-bg">
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16 space-y-8">
        {/* Header */}
        <div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            {t("history.back_history")}
          </button>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-display font-bold gradient-text"
          >
            {t("history.detail_title")}
          </motion.h1>
        </div>

        {/* Loading */}
        {(authLoading || loading) && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl aspect-square animate-pulse" />
              <div className="glass rounded-2xl aspect-square animate-pulse" />
            </div>
            <div className="glass rounded-2xl p-6 h-40 animate-pulse" />
          </div>
        )}

        {/* Restricted */}
        {isRestricted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-10 text-center"
          >
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t("playground.access_restricted_desc")}</p>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-10 text-center"
          >
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-muted-foreground">{error}</p>
          </motion.div>
        )}

        {/* Content */}
        {job && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-8"
          >
            {/* Status + date */}
            <div className="flex items-center gap-4 flex-wrap">
              <StatusBadge status={job.status} />
              {job.createdAt && (
                <span className="text-sm text-muted-foreground">
                  {t("history.submitted")}:{" "}
                  {new Date(job.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>

            {/* Large images */}
            <div className="grid md:grid-cols-2 gap-6">
              <LargeImage src={job.userImageUrl} label={t("history.original_image")} />
              <LargeImage src={job.processedImageUrl} label={t("history.adversarial_image")} />
            </div>

            {/* Metrics */}
            <div className="glass rounded-2xl p-6">
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-2">
                {t("history.original_class")} → {t("history.adversarial_class")}
              </p>
              <MetricRow
                label={t("history.original_class")}
                value={job.initialClass ?? "—"}
              />
              <MetricRow
                label={t("history.original_score")}
                value={
                  job.initialModelScore != null
                    ? `${Math.round(job.initialModelScore * 100)}%`
                    : "—"
                }
              />
              <MetricRow
                label={t("history.adversarial_class")}
                value={job.afterClass ?? "—"}
              />
              <MetricRow
                label={t("history.adversarial_score")}
                value={job.afterScore != null ? `${Math.round(job.afterScore * 100)}%` : "—"}
              />
            </div>

            {/* Original example images */}
            {job.exampleImageUrls && job.exampleImageUrls.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("playground.result.original_examples_label", {
                    class: job.initialClass ?? "",
                  })}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {job.exampleImageUrls.map((url, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-xl overflow-hidden aspect-square"
                    >
                      <Image
                        src={url}
                        alt={`Original example ${i + 1}`}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Perturbed example images */}
            {job.perturbedExampleImageUrls && job.perturbedExampleImageUrls.length > 0 && (
              <div className="space-y-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("playground.result.perturbed_examples_label", {
                    class: job.afterClass ?? "",
                  })}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {job.perturbedExampleImageUrls.map((url, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass rounded-xl overflow-hidden aspect-square"
                    >
                      <Image
                        src={url}
                        alt={`Example ${i + 1}`}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
