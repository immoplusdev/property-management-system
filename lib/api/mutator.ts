import { apiErrorFromResponse, apiErrorFromThrown } from "./errors";

/**
 * `bffFetch` — the single transport used by every Orval-generated React Query
 * hook (client side).
 *
 * All calls are routed to the SAME-ORIGIN `/bff` proxy, never directly to the
 * backend. The proxy (app/bff/[...path]/route.ts) reads the httpOnly access
 * token cookie and injects the `Authorization: Bearer` header server-side, so
 * the token is never exposed to client JavaScript. `credentials: "include"`
 * makes the browser forward our auth cookies to the proxy.
 *
 * Orval's fetch client bakes the `{ data, status, headers }` envelope into the
 * generated response type, so this mutator returns `T` (that full envelope)
 * directly rather than re-wrapping it.
 */

const BFF_PREFIX = "/bff";

async function parseBody<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") ?? "";
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

export const bffFetch = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const requestUrl = url.startsWith("http")
    ? url
    : `${BFF_PREFIX}${url.startsWith("/") ? "" : "/"}${url}`;

  let res: Response;
  try {
    res = await fetch(requestUrl, {
      ...options,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...options?.headers,
      },
    });
  } catch (err) {
    throw apiErrorFromThrown(err);
  }

  if (!res.ok) {
    throw await apiErrorFromResponse(res);
  }

  const data = await parseBody<unknown>(res);
  return { status: res.status, data, headers: res.headers } as T;
};

export default bffFetch;
