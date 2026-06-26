import type { Metadata } from "next";
import { PMSApp } from "@/components/pms/PMSApp";
import "@/styles/pms.css";

export const metadata: Metadata = {
  title: "Tableau de bord PMS · Immo Plus",
  description: "Property Management System — Résidence Lagune Bleue",
};

export default function PMSPage() {
  return <PMSApp />;
}
