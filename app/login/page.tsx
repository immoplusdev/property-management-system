import type { Metadata } from "next";
import LoginPage from "@/components/signup/LoginPage";

export const metadata: Metadata = {
  title: "Connexion · Immo Plus PMS",
  description: "Connectez-vous à votre espace hôtelier Immo Plus.",
};

export default function Page() {
  return <LoginPage />;
}
