import "server-only";
import { cache } from "react";
import { backendFetch } from "@/lib/api/server/http";
import { getAccessToken } from "@/lib/api/server/cookies";
import { ApiError } from "@/lib/api/errors";
import type { WrapperResponseUserDto, UserDto } from "@/lib/api/generated/model";

/**
 * Server-side current-user resolution for Server Components, layouts and
 * route guards.
 *
 * Reads the httpOnly access token and fetches `/users/data/me`. Returns `null`
 * when unauthenticated instead of throwing, so callers can branch cleanly.
 * A 401 here means "not logged in" — we don't refresh from a Server Component
 * (cookies can't be written there); client data calls refresh via the /bff
 * proxy, and a dedicated middleware/refresh flow can be added later.
 *
 * Wrapped in React's `cache` so multiple components in one render share a
 * single request.
 */
export const getCurrentUser = cache(async (): Promise<UserDto | null> => {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    const envelope = await backendFetch<WrapperResponseUserDto>(
      "/users/data/me",
      { accessToken },
    );
    return envelope.data;
  } catch (err) {
    if (err instanceof ApiError && (err.isUnauthorized || err.status === 403)) {
      return null;
    }
    throw err;
  }
});

export async function isAuthenticated(): Promise<boolean> {
  return (await getCurrentUser()) !== null;
}
