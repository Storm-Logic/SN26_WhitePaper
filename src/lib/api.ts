const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

export type JobStatus = "WAITING" | "CLASSIFIED" | "PENDING" | "COMPLETE";
export type UserRole = "general" | "granted" | "admin";

export interface Job {
  id: string;
  userId?: string;
  status?: JobStatus;
  userImageUrl: string;
  userImageKey: string;
  processedImageUrl?: string | null;
  processedImageKey?: string | null;
  exampleImageUrls?: string[];
  exampleImageKeys?: string[];
  perturbedExampleImageUrls?: string[];
  perturbedExampleImageKeys?: string[];
  initialModelScore?: number | null;
  initialClass?: string | null;
  afterClass?: string | null;
  afterScore?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  createdAt?: string;
  waitlist?: boolean;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function register(email: string, password: string, name?: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password, ...(name ? { name } : {}) }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `Registration failed: ${res.status}`);
  }
  return res.json() as Promise<User>;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `Login failed: ${res.status}`);
  }
  return res.json() as Promise<User>;
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function resendVerification(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `Failed to resend verification: ${res.status}`
    );
  }
}

export async function getMe(): Promise<User | null> {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  return res.json() as Promise<User>;
}

export interface UpdateMePayload {
  name?: string;
  currentPassword?: string;
  password?: string;
}

export async function updateMe(payload: UpdateMePayload): Promise<User> {
  const res = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `Update failed: ${res.status}`);
  }
  return res.json() as Promise<User>;
}

export async function addToWaitlist(userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${userId}/waitlist`, {
    method: "PATCH",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { message?: string }).message ?? `Failed to join waitlist: ${res.status}`);
  }
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export async function createJob(formData: FormData): Promise<Job> {
  const res = await fetch(`${API_URL}/jobs`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Failed to create job: ${res.status}`);
  }
  return res.json() as Promise<Job>;
}

export async function getJob(id: string): Promise<Job> {
  const res = await fetch(`${API_URL}/jobs/${id}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch job: ${res.status}`);
  }
  return res.json() as Promise<Job>;
}

export async function getMyJobs(): Promise<Job[]> {
  const res = await fetch(`${API_URL}/jobs/my`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.status}`);
  }
  return res.json() as Promise<Job[]>;
}

export async function deleteJob(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/jobs/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `Failed to delete job: ${res.status}`
    );
  }
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `Failed to delete user: ${res.status}`
    );
  }
}

export async function proceedJob(id: string): Promise<Job> {
  const res = await fetch(`${API_URL}/jobs/${id}/proceed`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`Failed to proceed job: ${res.status}`);
  }
  return res.json() as Promise<Job>;
}

export interface DailyLimit {
  limit: number | null;
  used: number;
  remaining: number | null;
  resetsAt: string;
}

export async function getDailyLimit(): Promise<DailyLimit> {
  const res = await fetch(`${API_URL}/jobs/daily-limit`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch daily limit: ${res.status}`);
  }
  return res.json() as Promise<DailyLimit>;
}

// ─── Admin Jobs ───────────────────────────────────────────────────────────────

export interface AdminJob {
  id: string;
  status: JobStatus;
  userId: string;
  userEmail: string;
  userName?: string | null;
  userImageUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminJobsResponse {
  data: AdminJob[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminJobsParams {
  status?: JobStatus;
  userSearch?: string;
  page?: number;
  limit?: number;
}

export async function getAdminJobs(params: AdminJobsParams = {}): Promise<AdminJobsResponse> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.userSearch) query.set("userSearch", params.userSearch);
  if (params.page != null) query.set("page", String(params.page));
  if (params.limit != null) query.set("limit", String(params.limit));

  const res = await fetch(`${API_URL}/jobs/admin/all?${query.toString()}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as { message?: string }).message ?? `Failed to fetch admin jobs: ${res.status}`
    );
  }
  return res.json() as Promise<AdminJobsResponse>;
}

// ─── Users (admin) ────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_URL}/users`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch users: ${res.status}`);
  }
  return res.json() as Promise<User[]>;
}

export async function updateUserRole(id: string, role: UserRole): Promise<User> {
  const res = await fetch(`${API_URL}/users/${id}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role }),
  });
  if (!res.ok) {
    throw new Error(`Failed to update user role: ${res.status}`);
  }
  return res.json() as Promise<User>;
}
