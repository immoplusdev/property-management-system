import { Dashboard } from "@/components/pms/Dashboard";
import { getCurrentUser } from "@/lib/api/auth/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  return <Dashboard user={user} />;
}
