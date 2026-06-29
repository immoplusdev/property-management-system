import "server-only";
import { env } from "@/lib/config/env";
import { apiErrorFromResponse, apiErrorFromThrown } from "@/lib/api/errors";
import { logRequest } from "@/lib/logger";

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

  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      cache,
      headers: {
        Accept: "application/json",
        ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
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
