"use server";
import { getAccessToken, getHotelId, setHotelId } from "@/lib/api/server/cookies";
import { getOnboardingProgress } from "@/lib/api/onboarding/onboarding.actions";
import { toFormError, type FormError } from "@/lib/api/errors";

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: FormError };

export interface PmsRealtimeCredentials {
  /** JWT used as the Socket.IO `auth.token` handshake param. */
  token: string;
  /** Active hotel UUID, sent as the `x-hotel-id` handshake header. */
  hotelId: string;
  /** Base WS URL (e.g. wss://api-dev.immoplus.ci) — namespace is appended client-side. */
  wsUrl: string;
}

/**
 * Resolve the active PMS hotelId for the current user and cache it in a cookie.
 *
 * Source of truth (per backend): `GET /pms/onboarding/progress` returns `hotelId`
 * from the onboarding session linked to the userId. We read the cached cookie
 * first, then fall back to the endpoint and persist the result so subsequent
 * requests (WebSocket handshake, etc.) don't refetch it.
 */
export async function getActiveHotelId(): Promise<string | null> {
  const cached = await getHotelId();
  if (cached) return cached;

  try {
    const res = await getOnboardingProgress();
    const id = res.ok ? res.data.hotelId : undefined;
    if (id) {
      await setHotelId(id);
      return id;
    }
  } catch {
    /* fall through — no hotel resolvable */
  }
  return null;
}

/**
 * Credentials a browser needs to open the PMS Socket.IO connection.
 *
 * The access token is httpOnly (unreadable by client JS), but a browser
 * Socket.IO handshake authenticates via `auth.token` — so the token is handed to
 * the client for this single purpose (kept in memory only, never persisted).
 */
export async function getPmsRealtimeCredentials(): Promise<ActionResult<PmsRealtimeCredentials>> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: { message: "Session introuvable. Reconnectez-vous." } };

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? deriveWsUrl();
  if (!wsUrl) return { ok: false, error: { message: "URL WebSocket non configurée." } };

  let hotelId: string | null;
  try {
    hotelId = await getActiveHotelId();
  } catch (err) {
    return { ok: false, error: toFormError(err) };
  }
  if (!hotelId) {
    return { ok: false, error: { message: "Hôtel actif introuvable pour le temps réel." } };
  }

  return { ok: true, data: { token, hotelId, wsUrl } };
}

/** Derive wss:// base from the server-only API_URL when NEXT_PUBLIC_WS_URL is unset. */
function deriveWsUrl(): string | null {
  const api = process.env.API_URL;
  if (!api) return null;
  return api.replace(/^http/, "ws").replace(/\/+$/, "");
}
