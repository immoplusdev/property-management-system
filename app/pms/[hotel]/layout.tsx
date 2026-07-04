import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/api/auth/session";
import { getHotelSettings } from "@/lib/api/pms/settings.actions";
import { PMSShell } from "@/components/pms/PMSShell";
import { HotelProvider } from "@/lib/pms/HotelContext";
import { slugify } from "@/lib/utils/slugify";

export default async function HotelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ hotel: string }>;
}) {
  const { hotel } = await params;
  const [user, settingsRes] = await Promise.all([
    getCurrentUser(),
    getHotelSettings(),
  ]);

  // If we can't reach the API, allow access (fail-open) so a backend glitch
  // doesn't lock out hotel managers. Slug can't be validated in that case.
  if (!settingsRes.ok) {
    return (
      <HotelProvider hotel={hotel}>
        <PMSShell user={user} hotelName="Hôtel">
          {children}
        </PMSShell>
      </HotelProvider>
    );
  }

  const hotelName = settingsRes.data.name;
  // Modèle actuel : 1 compte = 1 hôtel, et le slug n'est pas encore persisté côté
  // backend (pas de champ `hotel.slug`) — il est donc dérivé du nom à chaque requête.
  // Le jour où le multi-hôtel et un vrai champ `slug` existent, seule cette résolution
  // change (lookup en base + vraie vérification de permissions), pas l'architecture
  // des routes/layouts ci-dessous.
  const canonicalSlug = slugify(hotelName);

  if (hotel !== canonicalSlug) {
    redirect(`/pms/${canonicalSlug}`);
  }

  return (
    <HotelProvider hotel={hotel}>
      <PMSShell user={user} hotelName={hotelName}>
        {children}
      </PMSShell>
    </HotelProvider>
  );
}
