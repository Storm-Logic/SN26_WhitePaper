"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Search,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  getAdminJobs,
  getUsers,
  updateUserRole,
  deleteJob,
  deleteUser,
  type AdminJob,
  type AdminJobsParams,
  type JobStatus,
  type User,
  type UserRole,
} from "@/lib/api";
import { useAuth } from "@/components/perturb/AuthProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

type Tab = "users" | "jobs";

const ROLE_COLOURS: Record<UserRole, string> = {
  admin: "bg-primary/20 text-primary border-primary/30",
  granted: "bg-accent/20 text-accent border-accent/30",
  general: "bg-white/10 text-muted-foreground border-white/10",
};

const STATUS_COLOURS: Record<JobStatus, string> = {
  WAITING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  CLASSIFIED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PENDING: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  COMPLETE: "bg-green-500/10 text-green-400 border-green-500/20",
};

const JOBS_LIMIT = 20;

export function AdminPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("users");

  // ── Users state ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: string; msg: string } | null>(null);
  const [pendingDeleteUserId, setPendingDeleteUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // ── Jobs state ───────────────────────────────────────────────────────────────
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [jobsTotal, setJobsTotal] = useState(0);
  const [jobsPage, setJobsPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "ALL">("ALL");
  const [userSearch, setUserSearch] = useState("");
  const [userSearchDebounced, setUserSearchDebounced] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const jobId = pendingDeleteId;
    setPendingDeleteId(null);
    setDeletingId(jobId);
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setJobsTotal((t) => t - 1);
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!pendingDeleteUserId) return;
    const userId = pendingDeleteUserId;
    setPendingDeleteUserId(null);
    setDeletingUserId(userId);
    try {
      await deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast(userId, "User deleted.");
    } catch (e) {
      showToast(userId, e instanceof Error ? e.message : "Failed to delete user.");
    } finally {
      setDeletingUserId(null);
    }
  };

  // Debounce userSearch → reset to page 1 and trigger fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setUserSearchDebounced(userSearch);
      setJobsPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [userSearch]);

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  // Load users once
  useEffect(() => {
    if (authLoading || !user || user.role !== "admin") return;
    getUsers()
      .then(setUsers)
      .catch((e) =>
        setUsersError(e instanceof Error ? e.message : t("admin.load_error"))
      )
      .finally(() => setLoadingUsers(false));
  }, [authLoading, user, t]);

  // Load jobs when tab active / filters / page change
  const fetchJobs = useCallback(async () => {
    if (!user || user.role !== "admin") return;
    setLoadingJobs(true);
    setJobsError(null);
    const params: AdminJobsParams = { page: jobsPage, limit: JOBS_LIMIT };
    if (statusFilter !== "ALL") params.status = statusFilter;
    if (userSearchDebounced.trim()) params.userSearch = userSearchDebounced.trim();
    try {
      const result = await getAdminJobs(params);
      setJobs(result.data);
      setJobsTotal(result.total);
    } catch (e) {
      setJobsError(e instanceof Error ? e.message : t("admin.jobs.load_error"));
    } finally {
      setLoadingJobs(false);
    }
  }, [user, jobsPage, statusFilter, userSearchDebounced, t]);

  useEffect(() => {
    if (activeTab !== "jobs" || authLoading || !user || user.role !== "admin") return;
    fetchJobs();
  }, [activeTab, authLoading, user, fetchJobs]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleRoleChange = async (targetUser: User, role: UserRole) => {
    if (role === targetUser.role) return;
    setUpdatingId(targetUser.id);
    try {
      const updated = await updateUserRole(targetUser.id, role);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      showToast(
        targetUser.id,
        t("admin.role_updated", { email: updated.email, role: updated.role })
      );
    } catch (e) {
      showToast(
        targetUser.id,
        e instanceof Error ? e.message : t("admin.update_error")
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const showToast = (id: string, msg: string) => {
    setToast({ id, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val as JobStatus | "ALL");
    setJobsPage(1);
  };

  const handleJobDelete = (e: React.MouseEvent, jobId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setPendingDeleteId(jobId);
  };

  const totalPages = Math.max(1, Math.ceil(jobsTotal / JOBS_LIMIT));

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "users", label: t("admin.nav.users"), icon: <Users className="w-4 h-4" /> },
    { id: "jobs", label: t("admin.nav.jobs"), icon: <Briefcase className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 relative">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              {t("admin.badge")}
            </span>
          </div>
          <h1 className="text-3xl font-bold">
            {t("admin.title")}{" "}
            <span className="gradient-text">{t("admin.title_gradient")}</span>
          </h1>
          <p className="text-muted-foreground mt-2">{t("admin.subtitle")}</p>
        </motion.div>

        {/* Layout: sidebar + content */}
        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-44 shrink-0"
          >
            <nav className="glass rounded-2xl p-2 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left w-full ${
                    activeTab === item.id
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.aside>

          {/* Content area */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 min-w-0"
          >
            {activeTab === "users" ? (
              /* ── Users Tab ── */
              <>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {(["admin", "granted", "general"] as UserRole[]).map((role) => {
                    const count = users.filter((u) => u.role === role).length;
                    return (
                      <div key={role} className="glass rounded-2xl px-5 py-4">
                        <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                          {role}
                        </p>
                        <p className="text-2xl font-bold">
                          {loadingUsers ? "—" : count}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Users table */}
                <div className="glass rounded-2xl overflow-hidden">
                  {usersError ? (
                    <div className="flex items-center gap-3 px-6 py-8 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {usersError}
                    </div>
                  ) : loadingUsers ? (
                    <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("admin.loading")}
                    </div>
                  ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                      <Users className="w-8 h-8 opacity-30" />
                      <p className="text-sm">{t("admin.no_users")}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                            {t("admin.col_email")}
                          </TableHead>
                          <TableHead className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                            {t("admin.col_role")}
                          </TableHead>
                          <TableHead className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                            {t("admin.col_joined")}
                          </TableHead>
                          <TableHead className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                            Waitlist
                          </TableHead>
                          <TableHead className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                            {t("admin.col_actions")}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow
                            key={u.id}
                            className="border-white/5 hover:bg-white/2 transition-colors"
                          >
                            <TableCell className="font-medium text-sm">
                              {u.email}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono border ${ROLE_COLOURS[u.role]}`}
                              >
                                {u.role}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground font-mono">
                              {u.createdAt
                                ? new Date(u.createdAt).toLocaleDateString()
                                : "—"}
                            </TableCell>
                            <TableCell>
                              {u.waitlist && u.role === "general" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono border bg-amber-500/10 text-amber-400 border-amber-500/20">
                                  <Clock className="w-3 h-3" />
                                  requested
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={u.role}
                                  onValueChange={(val) =>
                                    handleRoleChange(u, val as UserRole)
                                  }
                                  disabled={updatingId === u.id}
                                >
                                  <SelectTrigger className="w-32 h-8 text-xs bg-white/5 border-white/10">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="general">general</SelectItem>
                                    <SelectItem value="granted">granted</SelectItem>
                                    <SelectItem value="admin">admin</SelectItem>
                                  </SelectContent>
                                </Select>
                                {updatingId === u.id && (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                                )}
                                {u.id !== user.id && (
                                  <button
                                    type="button"
                                    onClick={() => setPendingDeleteUserId(u.id)}
                                    disabled={deletingUserId === u.id}
                                    title="Delete user"
                                    className="p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                                  >
                                    {deletingUserId === u.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </>
            ) : (
              /* ── Jobs Tab ── */
              <>
                {/* Filters */}
                <div className="glass rounded-2xl px-5 py-4 mb-4 flex flex-wrap gap-4 items-end">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      {t("admin.jobs.filter_status")}
                    </span>
                    <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                      <SelectTrigger className="w-40 h-9 text-sm bg-white/5 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <SelectItem value="WAITING">WAITING</SelectItem>
                        <SelectItem value="CLASSIFIED">CLASSIFIED</SelectItem>
                        <SelectItem value="PENDING">PENDING</SelectItem>
                        <SelectItem value="COMPLETE">COMPLETE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-1 min-w-48">
                    <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      {t("admin.jobs.filter_search")}
                    </span>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Search by name or email…"
                        className="h-9 text-sm bg-white/5 border-white/10 pl-8"
                      />
                    </div>
                  </div>
                </div>

                {/* Jobs table */}
                <div className="glass rounded-2xl overflow-hidden">
                  {jobsError ? (
                    <div className="flex items-center gap-3 px-6 py-8 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {jobsError}
                    </div>
                  ) : loadingJobs ? (
                    <div className="flex items-center justify-center gap-3 py-16 text-muted-foreground text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("admin.jobs.loading")}
                    </div>
                  ) : jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                      <Briefcase className="w-8 h-8 opacity-30" />
                      <p className="text-sm">{t("admin.jobs.no_jobs")}</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                            {t("admin.jobs.col_id")}
                          </TableHead>
                          <TableHead className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                            {t("admin.jobs.col_status")}
                          </TableHead>
                          <TableHead className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                            {t("admin.jobs.col_user")}
                          </TableHead>
                          <TableHead className="text-muted-foreground font-mono text-xs uppercase tracking-wider">
                            {t("admin.jobs.col_created")}
                          </TableHead>
                          <TableHead className="w-8" />
                          <TableHead className="w-8" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs.map((job) => (
                          <TableRow
                            key={job.id}
                            className="border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                            onClick={() => router.push(`/playground/history/${job.id}`)}
                          >
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {job.id.slice(0, 8)}…
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono border ${STATUS_COLOURS[job.status]}`}
                              >
                                {job.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                {job.userName && (
                                  <span className="text-sm font-medium">{job.userName}</span>
                                )}
                                <span className={job.userName ? "text-xs text-muted-foreground" : "text-sm"}>
                                  {job.userEmail ?? job.userId ?? "—"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground font-mono">
                              {job.createdAt
                                ? new Date(job.createdAt).toLocaleDateString()
                                : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <button
                                type="button"
                                onClick={(e) => handleJobDelete(e, job.id)}
                                title="Delete job"
                                className="p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                              >
                                {deletingId === job.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {/* Pagination */}
                {!loadingJobs && jobs.length > 0 && (
                  <div className="flex items-center justify-between mt-4 px-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      {t("admin.jobs.page_info", {
                        page: jobsPage,
                        total: totalPages,
                        count: jobsTotal,
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={jobsPage <= 1}
                        onClick={() => setJobsPage((p) => Math.max(1, p - 1))}
                        className="h-8 border-white/10 bg-white/5 hover:bg-white/10 px-2"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <span className="text-xs font-mono text-muted-foreground min-w-12 text-center">
                        {jobsPage} / {totalPages}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={jobsPage >= totalPages}
                        onClick={() => setJobsPage((p) => Math.min(totalPages, p + 1))}
                        className="h-8 border-white/10 bg-white/5 hover:bg-white/10 px-2"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>

        {/* Toast */}
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-24 right-6 z-50 glass rounded-xl px-5 py-3 text-sm border border-accent/30 text-accent max-w-sm"
          >
            {toast.msg}
          </motion.div>
        )}

        {/* Delete job confirmation dialog */}
        <AlertDialog
          open={!!pendingDeleteId}
          onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this job?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete job{" "}
                <span className="font-mono text-foreground">
                  {pendingDeleteId?.slice(0, 8)}…
                </span>.
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

        {/* Delete user confirmation dialog */}
        <AlertDialog
          open={!!pendingDeleteUserId}
          onOpenChange={(open) => { if (!open) setPendingDeleteUserId(null); }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this user?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete{" "}
                <span className="font-medium text-foreground">
                  {users.find((u) => u.id === pendingDeleteUserId)?.email ?? "this user"}
                </span>{" "}
                and all their associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
