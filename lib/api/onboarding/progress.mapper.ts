/**
 * Maps a GET /pms/onboarding/progress response back to InscriptionState.
 * Best-effort: maps what the API returns, leaves the rest at INITIAL_STATE defaults.
 */
import { INITIAL_STATE } from "@/components/inscription/constants";
import type { InscriptionState, RoomType, SpaceKey } from "@/components/inscription/types";
import type { OnboardingProgressDto } from "./onboarding.actions";

// Reverse of VA_API_TYPES used in submitStep5
const API_TYPE_TO_KEY: Record<string, SpaceKey> = {
  restaurant:       "restaurant",
  bar:              "bar",
  piscine:          "pool",
  salle_de_sport:   "gym",
  spa:              "spa",
  salle_conference: "conference",
  terrasse:         "outdoor",
};

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function arr<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

export interface RestoredProgress {
  state: InscriptionState;
  currentStep: number;
}

export function mapProgressToState(
  dto: OnboardingProgressDto,
  base: InscriptionState = INITIAL_STATE,
): RestoredProgress {
  const state: InscriptionState = JSON.parse(JSON.stringify(base));
  const steps = dto.steps ?? {};
  const currentStep = Math.max(1, Math.min(7, num(dto.currentStep, 1)));

  // ── Step 1 — Compte gérant ──────────────────────────────────────────────
  const s1 = steps["1"]?.data;
  if (s1) {
    state.account = {
      ...INITIAL_STATE.account,
      fullName:          str(s1.fullName),
      phone:             str(s1.phone),
      email:             str(s1.email),
      rccm:              str(s1.rccm),
      idCardFrontFileId: (s1.idCardFrontFileId as string) || null,
      idCardBackFileId:  (s1.idCardBackFileId  as string) || null,
      acceptedTerms:     !!s1.acceptedTerms,
    };
  }

  // ── Step 2 — Établissement ──────────────────────────────────────────────
  const s2 = steps["2"]?.data;
  if (s2) {
    state.hotel = {
      ...INITIAL_STATE.hotel,
      name:             str(s2.name),
      type:             str(s2.type),
      stars:            num(s2.stars),
      address:          str(s2.address),
      villeId:          (s2.villeId   as string) || null,
      communeId:        (s2.communeId as string) || null,
      lat:              num(s2.lat, INITIAL_STATE.hotel.lat),
      lng:              num(s2.lng, INITIAL_STATE.hotel.lng),
      shortDesc:        str(s2.descriptionShort),
      longDesc:         str(s2.descriptionLong),
      coverFileId:      (s2.coverFileId  as string) || null,
      galleryFileIds:   arr<string>(s2.images),
      videoFileId:      (s2.videoFileId      as string) || null,
      droneVideoFileId: (s2.droneVideoFileId as string) || null,
      phone:            str(s2.phone),
      email:            str(s2.email),
      website:          str(s2.website),
      // Fields not round-tripped through API — keep defaults
      villeName: "", communeName: "", instagram: "", facebook: "",
      yearOpened: "", capacity: "", languages: [], strengths: [],
    };
  }

  // ── Step 3 — Équipements ────────────────────────────────────────────────
  const s3 = steps["3"]?.data;
  if (s3) {
    const a  = (s3.amenities  as Record<string, Record<string, boolean>>) ?? {};
    const g  = a.general              ?? {};
    const sv = a.services             ?? {};
    const lb = a.loisirs_bien_etre    ?? {};
    const rs = a.restauration         ?? {};
    const bz = a.business             ?? {};
    state.equip = {
      wifi:             !!g.wifi_gratuit,
      wifiFree:         !!g.wifi_gratuit,
      aircon:           !!g.climatisation,
      parking:          !!g.parking_prive,
      reception247:     !!sv.reception_24_7,
      roomService:      !!sv.service_en_chambre,
      laundry:          !!sv.blanchisserie,
      shuttle:          !!sv.navette_aeroport,
      concierge:        !!sv.conciergerie,
      pool:             !!lb.piscine_exterieure,
      spa:              !!lb.spa,
      gym:              !!lb.salle_de_sport,
      breakfastInRoom:  !!rs.petit_dejeuner_inclus,
      conference:       !!bz.salle_de_reunion,
      coworking:        !!bz.centre_d_affaires,
      printer:          !!bz.equipement_audiovisuel,
      // Fields not in API — reset to false
      hotWater: false, security247: false, cctv: false,
      safe: false, accessBadge: false, carRental: false,
      dailyCleaning: false, sports: false, kids: false,
      garden: false, secretariat: false,
    };
  }

  // ── Step 4 — Types de chambres ──────────────────────────────────────────
  const s4 = steps["4"]?.data;
  if (s4?.roomTypes) {
    state.roomTypes = arr<Record<string, unknown>>(s4.roomTypes).map(
      (r, i): RoomType => {
        const amenities = arr<string>(r.amenities);
        const surfaceEntry = amenities.find((a) => a.startsWith("surface:"));
        const surface = surfaceEntry
          ? surfaceEntry.replace("surface:", "").replace("m2", "")
          : "";
        const otherAmenities = amenities.filter((a) => !a.startsWith("surface:"));
        return {
          id:              str(r.id) || `rt-restored-${i}`,
          name:            str(r.name),
          description:     str(r.description),
          totalRooms:      num(r.totalRooms),
          surface,
          bedType:         str(r.bedType),
          bedCount:        num(r.bedCount, 1),
          maxOccupancy:    num(r.maxOccupancy, 2),
          basePrice:       num(r.basePrice),
          weekendPrice:    r.weekendPrice !== undefined ? num(r.weekendPrice) : "",
          longStayPrice:   r.longStayPrice !== undefined ? num(r.longStayPrice) : "",
          breakfastOption: (r.breakfastOption as RoomType["breakfastOption"]) ?? "not_available",
          imageIds:        arr<string>(r.images),
          amenities:       otherAmenities,
          complete:        !!(str(r.name) && num(r.basePrice) > 0),
        };
      }
    );
  }

  // ── Step 5 — Espaces valorisés ──────────────────────────────────────────
  const s5 = steps["5"]?.data;
  if (s5?.spaces) {
    // Reset to empty before re-populating from API
    state.valueAdds = JSON.parse(JSON.stringify(INITIAL_STATE.valueAdds));

    for (const space of arr<Record<string, unknown>>(s5.spaces)) {
      const apiType = str(space.type);
      const key     = API_TYPE_TO_KEY[apiType];
      const config  = (space.config as Record<string, unknown>) ?? {};
      const images  = arr<string>(space.images);

      if (key) {
        // Fixed space
        const base: Record<string, unknown> = {
          configured:     true,
          isOpenToPublic: !!space.isOpenToPublic,
          imageIds:       images,
        };
        if (key === "restaurant") {
          base.name     = str(space.name);
          base.cuisine  = str(config.cuisine);
          base.priceAvg = config.priceAvg !== undefined ? num(config.priceAvg) : undefined;
          base.capacity = str(config.capacity);
        } else if (key === "bar") {
          base.name = str(space.name);
          base.type = str(config.type);
        } else if (key === "pool") {
          base.type  = str(config.type);
          base.depth = config.depth !== undefined ? num(config.depth) : undefined;
        } else if (key === "conference") {
          base.rooms       = config.rooms !== undefined ? num(config.rooms) : undefined;
          base.capacity    = config.capacity !== undefined ? num(config.capacity) : undefined;
          base.description = str(config.description) || str(space.description);
          base.hours       = str(config.hours);
        } else {
          base.description = str(config.description) || str(space.description);
          base.hours       = str(config.hours);
        }
        // @ts-expect-error — dynamic key assignment is safe here
        state.valueAdds[key] = base;
      } else {
        // Custom space
        state.valueAdds.customSpaces.push({
          id:            `cs-restored-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          title:         str(space.name) || apiType,
          description:   str(space.description),
          icon:          str(config.icon) || "sparkles",
          isOpenToPublic: !!space.isOpenToPublic,
          imageIds:      images,
        });
      }
    }
  }

  // ── Step 6 — Tarification ───────────────────────────────────────────────
  const s6 = steps["6"]?.data;
  if (s6) {
    const methods = arr<string>(s6.paymentMethods);
    const deposit = num(s6.depositPercent);
    state.pricing = {
      ...INITIAL_STATE.pricing,
      payWave:        methods.includes("wave"),
      payOM:          methods.includes("orange_money"),
      payCard:        methods.includes("card"),
      payCash:        methods.includes("cash"),
      depositRequired: deposit > 0,
      depositPct:     deposit || 30,
      cancelPolicy:   str(s6.cancellationPolicy),
      cityTax:        s6.touristTax !== undefined ? num(s6.touristTax) : "",
    };
  }

  return { state, currentStep };
}
