import { notFound } from "next/navigation";
import { getRequests } from "@/lib/api/pms/requests.actions";
import { RequestDetail } from "@/components/pms/modules/RequestDetail";

// Le backend n'expose pas encore `GET /pms/requests/:id` (cf. PMS_CONCORDANCE.md) —
// on récupère la liste et on filtre côté serveur en attendant un vrai endpoint par id.
export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const { requestId } = await params;
  const res = await getRequests({ limit: 100 });
  if (!res.ok) notFound();
  const request = res.data.data.find(r => r.id === requestId);
  if (!request) notFound();
  return <RequestDetail request={request} />;
}
