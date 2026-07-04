import { Suspense } from "react";
import { Planning } from "@/components/pms/modules/Planning";
import { getHotelSettings } from "@/lib/api/pms/settings.actions";

export default async function PlanningPage() {
  const settingsRes = await getHotelSettings();
  const hotelName = settingsRes.ok ? settingsRes.data.name : "Hôtel";
  return (
    <Suspense>
      <Planning hotelName={hotelName} />
    </Suspense>
  );
}
