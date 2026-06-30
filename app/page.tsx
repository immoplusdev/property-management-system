import { getCurrentUser } from "@/lib/api/auth/session";
import LandingPage from "@/components/landing/LandingPage";

export default async function Home() {
  const user = await getCurrentUser();
  return <LandingPage user={user} />;
}
