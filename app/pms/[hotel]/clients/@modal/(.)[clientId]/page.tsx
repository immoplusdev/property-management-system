import { notFound } from "next/navigation";
import { getGuest } from "@/lib/api/pms/clients.actions";
import { ClientDetailModal } from "@/components/pms/modules/ClientDetailModal";

export default async function ClientModalPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const res = await getGuest(clientId);
  if (!res.ok) notFound();
  return <ClientDetailModal client={res.data} />;
}
