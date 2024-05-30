"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuth } from "./AuthProvider";
import { getMyJobs, deleteJob, Job } from "@/lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ImageOff,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  Trash2,
  Zap,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.colorCls} ${cfg.bgCls}`}
    >
      <Icon className="w-3 h-3" />
      {t(cfg.i18nKey)}
    </span>
  );
}

function Thumb({ src, alt }: { src?: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/20 flex items-center justify-center">
        <ImageOff className="w-5 h-5 text-muted-foreground/50" />
      </div>
    );
  }
  return (
    <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/20">
      <Image src={src} alt={alt} width={80} height={80} className="w-full h-full object-cover" />
    </div>
  );
}

function JobCard({ job, index, onDelete }: { job: Job; index: number; onDelete: (id: string) => void }) {
  const { t } = useTranslation();
  const [pendingDelete, setPendingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    setPendingDelete(false);
    setDeleting(true);
    try {
      await deleteJob(job.id);
      onDelete(job.id);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPendingDelete(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="relative"
    >
      <Link
        href={`/playground/history/${job.id}`}
        className="group glass rounded-2xl p-5 flex flex-col sm:flex-row gap-5 pr-12 hover:border-primary/40 transition-colors cursor-pointer"
      >
      {/* Thumbnails */}
      <div className="flex gap-3 shrink-0">
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-xs text-muted-foreground">{t("history.original_image")}</span>
          <Thumb src={job.userImageUrl} alt="Original" />
        </div>
        {job.status === "COMPLETE" || job.processedImageUrl ? (
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{t("history.adversarial_image")}</span>
            <Thumb src={job.processedImageUrl} alt="Adversarial" />
          </div>
        ) : null}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <StatusBadge status={job.status} />
          <div className="flex items-center gap-2 shrink-0">
            {job.createdAt && (
              <span className="text-xs text-muted-foreground">
                {t("history.submitted")}:{" "}
                {new Date(job.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
            <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">{t("history.original_class")}</p>
            <p className="text-sm font-medium truncate">{job.initialClass ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">{t("history.original_score")}</p>
            <p className="text-sm font-medium">
              {job.initialModelScore != null
                ? `${Math.round(job.initialModelScore * 100)}%`
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">{t("history.adversarial_class")}</p>
            <p className="text-sm font-medium truncate">{job.afterClass ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">{t("history.adversarial_score")}</p>
            <p className="text-sm font-medium">
              {job.afterScore != null ? `${Math.round(job.afterScore * 100)}%` : "—"}
            </p>
          </div>
        </div>
      </div>

      </Link>
      <button
        type="button"
        onClick={handleDeleteClick}
        title={t("history.delete")}
        className="absolute top-4 right-4 z-10 p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
      >
        {deleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>

      <AlertDialog
        open={pendingDelete}
        onOpenChange={(open) => { if (!open) setPendingDelete(false); }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this job?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete job{" "}
              <span className="font-mono text-foreground">{job.id.slice(0, 8)}…</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}

export function HistoryPageContent() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user || (user.role !== "granted" && user.role !== "admin")) {
      setLoading(false);
      return;
    }
    getMyJobs()
      .then(setJobs)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  const isRestricted =
    !authLoading && !loading && (!user || (user.role !== "granted" && user.role !== "admin"));

  return (
    <div className="min-h-screen gradient-bg grid-bg">
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-16 space-y-8">
        {/* Header */}
        <div>
          <Link
            href="/playground"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            {t("history.back_playground")}
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-display font-bold gradient-text"
          >
            {t("history.title")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-muted-foreground mt-2"
          >
            {t("history.subtitle")}
          </motion.p>
        </div>

        {/* Body */}
        {authLoading || loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass rounded-2xl p-5 h-32 animate-pulse" />
            ))}
          </div>
        ) : isRestricted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-10 text-center"
          >
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">{t("playground.access_restricted_desc")}</p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-10 text-center"
          >
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-muted-foreground">{error}</p>
          </motion.div>
        ) : jobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-10 text-center space-y-3"
          >
            <p className="font-semibold text-lg">{t("history.empty_title")}</p>
            <p className="text-muted-foreground">{t("history.empty_desc")}</p>
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              {t("history.go_playground")}
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job, i) => (
              <JobCard
                key={job.id}
                job={job}
                index={i}
                onDelete={(id) => setJobs((prev) => prev.filter((j) => j.id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
