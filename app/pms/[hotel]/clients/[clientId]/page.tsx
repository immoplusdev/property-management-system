import { notFound } from "next/navigation";
import { getGuest } from "@/lib/api/pms/clients.actions";
import { ClientDetail } from "@/components/pms/modules/ClientDetail";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const res = await getGuest(clientId);
  if (!res.ok) notFound();
  return <ClientDetail client={res.data} />;
}
