import type { Metadata } from "next";
import { InscriptionPage } from "@/components/inscription/InscriptionPage";
import { getCurrentUser } from "@/lib/api/auth/session";

export const metadata: Metadata = {
  title: "Inscription hôtelier · Immo Plus PRO",
  description: "Enregistrez votre hôtel sur la plateforme Immo Plus en 7 étapes simples.",
};

export default async function Page() {
  const user = await getCurrentUser();
  return <InscriptionPage initialUser={user} />;
}
