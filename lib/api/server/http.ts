import "server-only";
import { env } from "@/lib/config/env";
import { apiErrorFromResponse, apiErrorFromThrown } from "@/lib/api/errors";
import { logRequest } from "@/lib/logger";
import { getHotelId, setHotelId } from "@/lib/api/server/cookies";

export async function resolveHotelId(accessToken: string): Promise<string> {
  const cached = await getHotelId();
  if (cached) return cached;
  const headers = { Accept: "application/json", Authorization: `Bearer ${accessToken}` };
  const memberships = await fetch(`${env.API_URL}/pms/context/hotels`, {
    headers,
    cache: "no-store",
  });
  if (!memberships.ok) throw await apiErrorFromResponse(memberships);
  const membershipData: unknown = await memberships.json();
  const available = membershipData && typeof membershipData === "object" && "data" in membershipData && Array.isArray(membershipData.data)
    ? membershipData.data as Array<{ id?: unknown }>
    : [];
  if (available.length === 1 && typeof available[0].id === "string") {
    await setHotelId(available[0].id);
    return available[0].id;
  }
  const response = await fetch(`${env.API_URL}/pms/onboarding/progress`, {
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    if (available.length > 1) throw new Error("Plusieurs hôtels sont accessibles. Sélectionnez un établissement avant de continuer.");
    throw await apiErrorFromResponse(response);
  }
  const progress: unknown = await response.json();
  const hotelId = progress && typeof progress === "object" && "hotelId" in progress
    ? progress.hotelId : undefined;
  if (typeof hotelId !== "string" || !hotelId) {
    throw new Error("Hôtel introuvable pour cette session.");
  }
  if (available.length > 1 && !available.some(item => item.id === hotelId)) {
    throw new Error("Plusieurs hôtels sont accessibles. Sélectionnez un établissement avant de continuer.");
  }
  await setHotelId(hotelId);
  return hotelId;
}

export interface BackendFetchInit extends Omit<RequestInit, "body"> {
  accessToken?: string;
  json?: unknown;
  cache?: RequestCache;
}

export async function backendFetch<T = unknown>(
  path: string,
  init: BackendFetchInit = {},
): Promise<T> {
  const { accessToken, json, headers, cache = "no-store", ...rest } = init;
  const method = rest.method ?? "GET";

  const url  = `${env.API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
  const done = logRequest({ source: "SRV", method, path, body: json });

  const hotelId = path.startsWith("/pms/") && !path.startsWith("/pms/onboarding/") && accessToken
    ? await resolveHotelId(accessToken)
    : await getHotelId();
  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
  };
  if (json !== undefined) requestHeaders["Content-Type"] = "application/json";
  if (accessToken) requestHeaders.Authorization = `Bearer ${accessToken}`;
  if (hotelId) requestHeaders["x-hotel-id"] = hotelId;
  Object.assign(requestHeaders, headers);

  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      cache,
      headers: requestHeaders,
      ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
    });
  } catch (err) {
    done(undefined, undefined, err instanceof Error ? err.message : String(err));
    throw apiErrorFromThrown(err);
  }

  if (!res.ok) {
    // Read body for logging before throwing
    const errBody = await res.clone().json().catch(() => null);
    done(res.status, errBody);
    throw await apiErrorFromResponse(res);
  }

  const data = await parseBody<T>(res);
  done(res.status, data);
  return data;
}

async function parseBody<T>(res: Response): Promise<T> {
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const text = await res.text();
    return (text ? JSON.parse(text) : undefined) as T;
  }
  return (await res.text()) as unknown as T;
}
