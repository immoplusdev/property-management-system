import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/api/auth/session";
import { getStaffInvitation } from "@/lib/api/pms/staff.actions";
import InvitationContent from "./InvitationContent";

export const metadata: Metadata = {
  title: "Invitation à collaborer · Immo Plus PMS",
  robots: { index: false, follow: false },
};

export default async function InvitationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const preview = token ? await getStaffInvitation(token) : null;
  const user = await getCurrentUser();
  return <InvitationContent token={token || ""} preview={preview?.ok ? preview.data : null}
    error={preview && !preview.ok ? preview.error.message : "Lien d'invitation manquant"}
    signedInEmail={user?.email || null} />;
}
