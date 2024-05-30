import type { Metadata } from "next";
import { AdminPageContent } from "@/components/perturb/AdminPageContent";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "User management for Perturb AI admins.",
};

export default function AdminPage() {
  return <AdminPageContent />;
}
