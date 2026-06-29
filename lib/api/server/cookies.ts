import "server-only";
import { cookies } from "next/headers";

/**
 * httpOnly session cookies.
 *
 * Access + refresh tokens are stored as httpOnly cookies so client JavaScript
 * can never read them (XSS-resistant). They are written only from Server
 * Actions and Route Handlers (`cookies().set` is not allowed in Server
 * Components). Reads are allowed everywhere.
 */

export const ACCESS_TOKEN_COOKIE = "ip_access_token";
export const REFRESH_TOKEN_COOKIE = "ip_refresh_token";
export const EXPIRES_COOKIE = "ip_expires";

// Refresh token lifespan (the access token's own lifespan comes from `expires`).
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  /** ISO timestamp at which the access token expires. */
  expires: string;
}

/** Persist a fresh session (after login / register / refresh). */
export async function setSessionCookies(tokens: SessionTokens): Promise<void> {
  const store = await cookies();

  const expiresMs = Date.parse(tokens.expires);
  const accessMaxAge = Number.isFinite(expiresMs)
    ? Math.max(0, Math.floor((expiresMs - Date.now()) / 1000))
    : undefined;

  store.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...baseCookie,
    ...(accessMaxAge !== undefined ? { maxAge: accessMaxAge } : {}),
  });
  store.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...baseCookie,
    maxAge: REFRESH_MAX_AGE,
  });
  store.set(EXPIRES_COOKIE, tokens.expires, {
    ...baseCookie,
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function clearSessionCookies(): Promise<void> {
  const store = await cookies();
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
  store.delete(EXPIRES_COOKIE);
}

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
}

/** True when there's an access token whose `expires` is still in the future. */
export async function hasValidAccessToken(): Promise<boolean> {
  const store = await cookies();
  if (!store.get(ACCESS_TOKEN_COOKIE)?.value) return false;
  const expires = store.get(EXPIRES_COOKIE)?.value;
  if (!expires) return true; // no expiry info — assume usable, let the API decide
  const ms = Date.parse(expires);
  return Number.isFinite(ms) ? ms > Date.now() : true;
}
