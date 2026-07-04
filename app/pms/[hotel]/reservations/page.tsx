import { Suspense } from "react";
import { Reservations } from "@/components/pms/modules/Reservations";

export default function ReservationsPage() {
  return (
    <Suspense>
      <Reservations />
    </Suspense>
  );
}
