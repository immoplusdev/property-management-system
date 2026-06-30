"use server";

import { z } from "zod";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken, setHotelId } from "@/lib/api/server/cookies";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: FormError };

function fromZod(error: z.ZodError): { ok: false; error: FormError } {
  const flat = z.flattenError(error);
  const rawFieldErrors = flat.fieldErrors as Record<string, string[] | undefined>;
  const fieldErrors: Record<string, string> = {};
  for (const [key, msgs] of Object.entries(rawFieldErrors)) {
    if (msgs?.length) fieldErrors[key] = msgs[0]!;
  }
  return {
    ok: false,
    error: {
      message: flat.formErrors[0] ?? "Veuillez corriger les champs.",
      fieldErrors: Object.keys(fieldErrors).length ? fieldErrors : undefined,
    },
  };
}

/** POST /pms/onboarding/start — à appeler juste après l'inscription. */
export async function startOnboarding(hotelName?: string): Promise<ActionResult> {
  const accessToken = await getAccessToken();
  if (!accessToken)
    return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };

  try {
    await backendFetch("/pms/onboarding/start", {
      method: "POST",
      accessToken,
      json: hotelName ? { hotelName } : {},
    });
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

// ─── Step save response (returned by every PUT /pms/onboarding/step/*) ────────

export interface StepSaveData {
  hotelId: string;
  currentStep: number;
  completedSteps: number[];
  completionScore: number;
  hasMobileMoney: boolean;
}

// ─── Final submission ─────────────────────────────────────────────────────────

/** POST /pms/onboarding/submit — soumet le dossier pour validation (score ≥ 60 requis côté API). */
export async function submitOnboarding(): Promise<ActionResult> {
  const accessToken = await getAccessToken();
  if (!accessToken)
    return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };

  try {
    await backendFetch("/pms/onboarding/submit", {
      method: "POST",
      accessToken,
      json: {},
    });
    return { ok: true, data: undefined };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface OnboardingStepData {
  completed: boolean;
  data: Record<string, unknown> | null;
}

export interface OnboardingProgressDto {
  hotelId?: string;
  status?: string;
  currentStep?: number;
  completedSteps?: number[];
  completionScore?: number;
  steps?: Record<string, OnboardingStepData>;
}

/** GET /pms/onboarding/progress — récupère l'état d'avancement du dossier. */
export async function getOnboardingProgress(): Promise<ActionResult<OnboardingProgressDto>> {
  const accessToken = await getAccessToken();
  if (!accessToken)
    return { ok: false, error: { message: "Session introuvable." } };

  try {
    const data = await backendFetch<OnboardingProgressDto>("/pms/onboarding/progress", {
      method: "GET",
      accessToken,
    });
    if (data.hotelId) {
      await setHotelId(data.hotelId);
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

export type OnboardingStatus = "draft" | "submitted" | "under_review" | "published" | "rejected";

export interface OnboardingStatusData {
  status: OnboardingStatus;
  completionScore: number;
  completedSteps: number[];
  currentStep?: number;
  hotelId?: string;
  rejectionReason?: string;
}

/** Lightweight status check used by the PMS access gate. */
export async function getOnboardingStatus(): Promise<ActionResult<OnboardingStatusData>> {
  const accessToken = await getAccessToken();
  if (!accessToken)
    return { ok: false, error: { message: "Session introuvable." } };

  try {
    const data = await backendFetch<OnboardingStatusData>(
      "/pms/onboarding/progress",
      { method: "GET", accessToken },
    );
    if (data.hotelId) {
      await setHotelId(data.hotelId);
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

// ─── Step 6 ──────────────────────────────────────────────────────────────────

export interface Step6Input {
  payWave: boolean;
  payOM: boolean;
  payCard: boolean;
  payCash: boolean;
  depositRequired: boolean;
  depositPct: number;
  cancelPolicy: string;
  cityTax: number | string;
}

/** PUT /pms/onboarding/step/6 — tarification & conditions. */
export async function submitStep6(input: Step6Input): Promise<ActionResult<StepSaveData>> {
  const accessToken = await getAccessToken();
  if (!accessToken)
    return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };

  const paymentMethods: string[] = [];
  if (input.payWave) paymentMethods.push("wave");
  if (input.payOM)   paymentMethods.push("orange_money");
  if (input.payCard) paymentMethods.push("card");
  if (input.payCash) paymentMethods.push("cash");

  const payload = {
    paymentMethods,
    depositPercent:      input.depositRequired ? Number(input.depositPct) : 0,
    cancellationPolicy:  input.cancelPolicy || undefined,
    touristTax:          input.cityTax !== "" && input.cityTax !== 0 ? Number(input.cityTax) : undefined,
    payoutAccount:       {},
  };

  try {
    const data = await backendFetch<StepSaveData>("/pms/onboarding/step/6", {
      method: "PUT",
      accessToken,
      json: payload,
    });
    if (data.hotelId) {
      await setHotelId(data.hotelId);
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

// ─── Step 5 ──────────────────────────────────────────────────────────────────

const VA_API_TYPES: Record<string, string> = {
  restaurant: "restaurant",
  bar:        "bar",
  pool:       "piscine",
  gym:        "salle_de_sport",
  spa:        "spa",
  conference: "salle_conference",
  outdoor:    "terrasse",
};

export interface Step5SpaceInput {
  id: string;
  spaceKey?: string;
  apiType?: string;
  name?: string;
  description?: string;
  isOpenToPublic: boolean;
  imageIds: string[];
  // config fields
  cuisine?: string; priceAvg?: number; capacity?: string | number;
  type?: string; depth?: number;
  rooms?: number; hours?: string;
}

export interface Step5Input {
  fixedSpaces: Array<Step5SpaceInput & { spaceKey: string }>;
  customSpaces: Array<{ id: string; title: string; description: string; icon: string; isOpenToPublic: boolean; imageIds: string[] }>;
}

/** PUT /pms/onboarding/step/5 — espaces & services. */
export async function submitStep5(input: Step5Input): Promise<ActionResult<StepSaveData>> {
  const accessToken = await getAccessToken();
  if (!accessToken)
    return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };

  const spaces = [
    ...input.fixedSpaces.map((s) => {
      const { spaceKey, imageIds, isOpenToPublic, name, description, ...rest } = s;
      // remaining fields (cuisine, priceAvg, type, capacity, rooms, depth, hours) go in config
      const config: Record<string, unknown> = {};
      if (rest.cuisine)    config.cuisine    = rest.cuisine;
      if (rest.priceAvg)   config.priceAvg   = rest.priceAvg;
      if (rest.capacity)   config.capacity   = rest.capacity;
      if (rest.type)       config.type       = rest.type;
      if (rest.depth)      config.depth      = rest.depth;
      if (rest.rooms)      config.rooms      = rest.rooms;
      if (rest.hours)      config.hours      = rest.hours;
      return {
        type:         VA_API_TYPES[spaceKey] ?? spaceKey,
        name:         name || undefined,
        description:  description || undefined,
        config:       Object.keys(config).length ? config : undefined,
        images:       imageIds.length ? imageIds : undefined,
        isOpenToPublic,
      };
    }),
    ...input.customSpaces.map((cs) => ({
      type:         cs.title.toLowerCase().replace(/\s+/g, "_"),
      name:         cs.title,
      description:  cs.description || undefined,
      config:       { icon: cs.icon },
      images:       cs.imageIds.length ? cs.imageIds : undefined,
      isOpenToPublic: cs.isOpenToPublic,
    })),
  ];

  try {
    const data = await backendFetch<StepSaveData>("/pms/onboarding/step/5", {
      method: "PUT",
      accessToken,
      json: { spaces },
    });
    if (data.hotelId) {
      await setHotelId(data.hotelId);
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

// ─── Step 4 ──────────────────────────────────────────────────────────────────

export interface Step4RoomInput {
  id: string;
  name: string;
  totalRooms: number;
  surface: number | string;
  bedType: string;
  bedCount: number;
  maxOccupancy: number;
  basePrice: number;
  weekendPrice: number | string;
  longStayPrice: number | string;
  breakfastOption: "included" | "available" | "not_available";
  imageIds: string[];
  amenities: string[];
}

/** PUT /pms/onboarding/step/4 — types de chambres. */
export async function submitStep4(rooms: Step4RoomInput[]): Promise<ActionResult<StepSaveData>> {
  const accessToken = await getAccessToken();
  if (!accessToken)
    return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };

  if (rooms.length === 0)
    return { ok: false, error: { message: "Ajoutez au moins un type de chambre." } };

  const roomTypes = rooms.map((r) => {
    // surface has no direct backend field → put in amenities if set
    const extraAmenities = r.surface !== "" && r.surface !== 0
      ? [`surface:${r.surface}m2`]
      : [];

    return {
      id:              r.id.startsWith("rt-") ? undefined : r.id,
      name:            r.name,
      basePrice:       r.basePrice,
      weekendPrice:    r.weekendPrice !== "" ? Number(r.weekendPrice) : undefined,
      longStayPrice:   r.longStayPrice !== "" ? Number(r.longStayPrice) : undefined,
      bedType:         r.bedType || undefined,
      bedCount:        r.bedCount || undefined,
      maxOccupancy:    r.maxOccupancy || undefined,
      totalRooms:      r.totalRooms || undefined,
      images:          r.imageIds.length ? r.imageIds : undefined,
      breakfastOption: r.breakfastOption,
      amenities:       [...r.amenities, ...extraAmenities].length
                         ? [...r.amenities, ...extraAmenities]
                         : undefined,
    };
  });

  try {
    const data = await backendFetch<StepSaveData>("/pms/onboarding/step/4", {
      method: "PUT",
      accessToken,
      json: { roomTypes },
    });
    if (data.hotelId) {
      await setHotelId(data.hotelId);
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

// ─── Step 3 ──────────────────────────────────────────────────────────────────

export interface Step3Input {
  wifi: boolean; wifiFree: boolean;
  aircon: boolean; hotWater: boolean;
  security247: boolean; cctv: boolean;
  parking: boolean;
  safe: boolean; accessBadge: boolean;
  reception247: boolean; laundry: boolean;
  shuttle: boolean; carRental: boolean;
  concierge: boolean; roomService: boolean;
  breakfastInRoom: boolean; dailyCleaning: boolean;
  pool: boolean; gym: boolean; spa: boolean;
  sports: boolean; kids: boolean; garden: boolean;
  conference: boolean; coworking: boolean;
  printer: boolean; secretariat: boolean;
}

/** PUT /pms/onboarding/step/3 — équipements de l'établissement. */
export async function submitStep3(input: Step3Input): Promise<ActionResult<StepSaveData>> {
  const accessToken = await getAccessToken();
  if (!accessToken)
    return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };

  const amenities = {
    general: {
      wifi_gratuit:    input.wifiFree,
      parking_prive:   input.parking,
      climatisation:   input.aircon,
      chauffage:       false,
      ascenseur:       false,
      acces_handicape: false,
      animaux_acceptes: false,
      non_fumeur:      false,
    },
    services: {
      reception_24_7:    input.reception247,
      service_en_chambre: input.roomService,
      blanchisserie:     input.laundry,
      navette_aeroport:  input.shuttle,
      bagagerie:         false,
      conciergerie:      input.concierge,
    },
    loisirs_bien_etre: {
      piscine_exterieure: input.pool,
      piscine_interieure: false,
      spa:               input.spa,
      salle_de_sport:    input.gym,
      massage:           false,
    },
    restauration: {
      restaurant:           false,
      bar:                  false,
      petit_dejeuner_inclus: input.breakfastInRoom,
      buffet:               false,
      snack:                false,
    },
    business: {
      salle_de_reunion:       input.conference,
      centre_d_affaires:      input.coworking,
      equipement_audiovisuel: input.printer,
    },
  };

  try {
    const data = await backendFetch<StepSaveData>("/pms/onboarding/step/3", {
      method: "PUT",
      accessToken,
      json: { amenities },
    });
    if (data.hotelId) {
      await setHotelId(data.hotelId);
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

// ─── Step 2 ──────────────────────────────────────────────────────────────────

const step2Schema = z.object({
  name:             z.string().min(2, "Nom de l'établissement requis"),
  type:             z.string().min(1, "Type d'établissement requis"),
  stars:            z.number().optional(),
  address:          z.string().optional(),
  villeId:          z.string().nullable().optional(),
  communeId:        z.string().nullable().optional(),
  lat:              z.number().optional(),
  lng:              z.number().optional(),
  descriptionShort: z.string().optional(),
  descriptionLong:  z.string().optional(),
  coverFileId:      z.string().nullable().optional(),
  images:           z.array(z.string()).optional(),
  videoFileId:      z.string().nullable().optional(),
  droneVideoFileId: z.string().nullable().optional(),
  phone:            z.string().optional(),
  email:            z.string().optional(),
  website:          z.string().optional(),
});

export interface Step2Input {
  name:             string;
  type:             string;
  stars:            number;
  address:          string;
  villeId:          string | null;
  communeId:        string | null;
  lat:              number;
  lng:              number;
  shortDesc:        string;
  longDesc:         string;
  coverFileId:      string | null;
  galleryFileIds:   string[];
  videoFileId:      string | null;
  droneVideoFileId: string | null;
  phone:            string;
  email:            string;
  website:          string;
}

/** PUT /pms/onboarding/step/2 — informations hôtel, localisation, médias. */
export async function submitStep2(input: Step2Input): Promise<ActionResult<StepSaveData>> {
  const accessToken = await getAccessToken();
  if (!accessToken)
    return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };

  const payload = {
    name:             input.name,
    type:             input.type,
    stars:            input.stars || undefined,
    address:          input.address || undefined,
    villeId:          input.villeId || undefined,
    communeId:        input.communeId || undefined,
    lat:              input.lat || undefined,
    lng:              input.lng || undefined,
    descriptionShort: input.shortDesc || undefined,
    descriptionLong:  input.longDesc || undefined,
    coverFileId:      input.coverFileId || undefined,
    images:           input.galleryFileIds.length ? input.galleryFileIds : undefined,
    videoFileId:      input.videoFileId || undefined,
    droneVideoFileId: input.droneVideoFileId || undefined,
    phone:            input.phone ? input.phone.replace(/\s+/g, "") : undefined,
    email:            input.email || undefined,
    website:          input.website || undefined,
  };

  const parsed = step2Schema.safeParse(payload);
  if (!parsed.success) return fromZod(parsed.error);

  try {
    const data = await backendFetch<StepSaveData>("/pms/onboarding/step/2", {
      method: "PUT",
      accessToken,
      json: payload,
    });
    if (data.hotelId) {
      await setHotelId(data.hotelId);
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}

// ─── Step 1 ──────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  fullName:          z.string().min(2,  "Nom complet requis"),
  phone:             z.string().min(6,  "Téléphone requis"),
  email:             z.string().email("Email invalide"),
  idCardFrontFileId: z.string().min(1,  "Recto de la pièce d'identité requis"),
  idCardBackFileId:  z.string().min(1,  "Verso de la pièce d'identité requis"),
  rccm:              z.string().optional(),
  acceptedTerms:     z.literal(true, {
    error: () => ({ message: "Vous devez accepter les conditions d'utilisation" }),
  }),
});

export interface Step1Input {
  fullName:          string;
  phone:             string;
  email:             string;
  idCardFrontFileId: string | null;
  idCardBackFileId:  string | null;
  rccm:              string;
  acceptedTerms:     boolean;
}

/** PUT /pms/onboarding/step/1 — informations légales et identité du gérant. */
export async function submitStep1(input: Step1Input): Promise<ActionResult<StepSaveData>> {
  const accessToken = await getAccessToken();
  if (!accessToken)
    return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };

  const parsed = step1Schema.safeParse(input);
  if (!parsed.success) return fromZod(parsed.error);

  // AccountState conserve le phone sous forme "+225 XXXXXXXXXX" — on retire l'espace.
  const phone = parsed.data.phone.replace(/\s+/g, "");

  try {
    const data = await backendFetch<StepSaveData>("/pms/onboarding/step/1", {
      method: "PUT",
      accessToken,
      json: {
        fullName:          parsed.data.fullName,
        phone,
        email:             parsed.data.email,
        idCardFrontFileId: parsed.data.idCardFrontFileId,
        idCardBackFileId:  parsed.data.idCardBackFileId,
        rccm:              parsed.data.rccm || undefined,
        acceptedTerms:     true,
      },
    });
    if (data.hotelId) {
      await setHotelId(data.hotelId);
    }
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
}
