import { notFound } from "next/navigation";
import { getStaff } from "@/lib/api/pms/staff.actions";
import { StaffDetail } from "@/components/pms/modules/StaffDetail";

// Le backend n'expose pas encore `GET /pms/staff/:id` (cf. PMS_CONCORDANCE.md) —
// on récupère la liste et on filtre côté serveur en attendant un vrai endpoint par id.
export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ staffId: string }>;
}) {
  const { staffId } = await params;
  const res = await getStaff();
  if (!res.ok) notFound();
  const member = res.data.staff.find(m => m.id === staffId);
  if (!member) notFound();
  return <StaffDetail member={member} />;
}
