import { redirect } from "next/navigation";
import { getHotelSettings } from "@/lib/api/pms/settings.actions";
import { slugify } from "@/lib/utils/slugify";

export default async function PMSPage() {
  const settingsRes = await getHotelSettings();
  const hotelName = settingsRes.ok ? settingsRes.data.name : "Hôtel";
  redirect(`/pms/${slugify(hotelName)}/dashboard`);
}
