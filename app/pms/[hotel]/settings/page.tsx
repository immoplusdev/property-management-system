import { redirect } from "next/navigation";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ hotel: string }>;
}) {
  const { hotel } = await params;
  redirect(`/pms/${hotel}/settings/hotel`);
}
