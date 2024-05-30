import type { Metadata } from "next";
import { ProfilePageContent } from "@/components/perturb/ProfilePageContent";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Edit your Perturb AI profile.",
};

export default function ProfilePage() {
  return <ProfilePageContent />;
}
