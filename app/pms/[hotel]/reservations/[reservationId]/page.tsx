import { notFound } from "next/navigation";
import { getReservation } from "@/lib/api/pms/reservations.actions";
import { ReservationDetail } from "@/components/pms/modules/ReservationDetail";

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ reservationId: string }>;
}) {
  const { reservationId } = await params;
  const res = await getReservation(reservationId);
  if (!res.ok) notFound();
  return <ReservationDetail booking={res.data} />;
}
