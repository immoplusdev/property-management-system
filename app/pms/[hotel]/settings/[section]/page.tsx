import { notFound } from "next/navigation";
import { Settings } from "@/components/pms/modules/Settings";
import { SETTINGS_NAV, type SettingsSection } from "@/lib/pms/settingsNav";

export default async function SettingsSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const isValid = SETTINGS_NAV.some(n => n.id === section);
  if (!isValid) notFound();
  return <Settings section={section as SettingsSection} />;
}
