import { Suspense } from "react";
import { Rooms } from "@/components/pms/modules/Rooms";

export default function RoomsPage() {
  return (
    <Suspense>
      <Rooms />
    </Suspense>
  );
}
