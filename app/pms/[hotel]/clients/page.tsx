import { Suspense } from "react";
import { Clients } from "@/components/pms/modules/Clients";

export default function ClientsPage() {
  return (
    <Suspense>
      <Clients />
    </Suspense>
  );
}
