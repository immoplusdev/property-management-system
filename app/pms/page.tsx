import type { Metadata } from "next";
import { PMSApp } from "@/components/pms/PMSApp";
import { getCurrentUser } from "@/lib/api/auth/session";

export const metadata: Metadata = {
  title: "Tableau de bord PMS · Immo Plus",
  description: "Property Management System — Résidence Lagune Bleue",
};

export default async function PMSPage() {
  const user = await getCurrentUser();
  return <PMSApp user={user} />;
}
