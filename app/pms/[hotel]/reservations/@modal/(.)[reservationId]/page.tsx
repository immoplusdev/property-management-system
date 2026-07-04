import { notFound } from "next/navigation";
import { getReservation } from "@/lib/api/pms/reservations.actions";
import { ReservationDetailModal } from "@/components/pms/modules/ReservationDetailModal";

export default async function ReservationModalPage({
  params,
}: {
  params: Promise<{ reservationId: string }>;
}) {
  const { reservationId } = await params;
  const res = await getReservation(reservationId);
  if (!res.ok) notFound();
  return <ReservationDetailModal booking={res.data} />;
}
