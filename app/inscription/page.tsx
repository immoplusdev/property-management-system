import type { Metadata } from "next";
import { InscriptionPage } from "@/components/inscription/InscriptionPage";
import "@/styles/inscription.css";

export const metadata: Metadata = {
  title: "Inscription hôtelier · Immo Plus PRO",
  description: "Enregistrez votre hôtel sur la plateforme Immo Plus en 7 étapes simples.",
};

export default function Page() {
  return <InscriptionPage />;
}
