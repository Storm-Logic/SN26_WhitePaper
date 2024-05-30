import type { Metadata } from "next";
import { JobDetailPageContent } from "@/components/perturb/JobDetailPageContent";

export const metadata: Metadata = {
  title: "Task Detail | Perturb AI",
};

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <JobDetailPageContent id={id} />;
}
