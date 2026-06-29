import { type NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/config/env";
import { getAccessToken } from "@/lib/api/server/cookies";
import { refreshSession } from "@/lib/api/auth/auth.actions";
import { logRequest } from "@/lib/logger";

export const dynamic = "force-dynamic";

const STRIP_REQUEST_HEADERS = new Set([
  "host", "connection", "cookie", "authorization", "content-length",
]);

const STRIP_RESPONSE_HEADERS = new Set([
  "content-encoding", "content-length", "transfer-encoding", "connection",
]);

/** Try to parse an ArrayBuffer as JSON for logging. Returns a label string for non-JSON bodies. */
function tryParseBody(buf: ArrayBuffer, contentType: string): unknown {
  if (contentType.includes("multipart/form-data")) return "[multipart/form-data]";
  if (contentType.includes("application/json")) {
    try { return JSON.parse(new TextDecoder().decode(buf)); } catch { /* fall through */ }
  }
  return undefined;
}

async function proxy(req: NextRequest, segments: string[]): Promise<Response> {
  const path    = segments.map(encodeURIComponent).join("/");
  const target  = `${env.API_URL}/${path}${req.nextUrl.search}`;
  const logPath = `/${path}${req.nextUrl.search}`;

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const bodyBuf = hasBody ? await req.arrayBuffer() : undefined;

  // Parse request body for logging (best-effort, never blocks the request)
  const reqContentType = req.headers.get("content-type") ?? "";
  const reqBodyLog = bodyBuf ? tryParseBody(bodyBuf, reqContentType) : undefined;

  const done = logRequest({ source: "BFF", method: req.method, path: logPath, body: reqBodyLog });

  const buildHeaders = (accessToken: string | undefined): Headers => {
    const headers = new Headers();
    req.headers.forEach((value, key) => {
      if (!STRIP_REQUEST_HEADERS.has(key.toLowerCase())) headers.set(key, value);
    });
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    return headers;
  };

  const send = async (accessToken: string | undefined): Promise<Response> =>
    fetch(target, {
      method: req.method,
      headers: buildHeaders(accessToken),
      body: bodyBuf ? Buffer.from(bodyBuf) : undefined,
      cache: "no-store",
      redirect: "manual",
    });

  let accessToken = await getAccessToken();
  let upstream = await send(accessToken);

  // Transparent refresh-and-retry on 401.
  if (upstream.status === 401 && accessToken) {
    const refreshed = await refreshSession();
    if (refreshed.ok) {
      accessToken = await getAccessToken();
      upstream = await send(accessToken);
    }
  }

  // Clone to read response body for logging while still forwarding the original stream.
  const resContentType = upstream.headers.get("content-type") ?? "";
  let resBodyLog: unknown;
  if (resContentType.includes("application/json")) {
    resBodyLog = await upstream.clone().json().catch(() => null);
  }

  done(upstream.status, resBodyLog);

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!STRIP_RESPONSE_HEADERS.has(key.toLowerCase())) responseHeaders.set(key, value);
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

type Ctx = { params: Promise<{ path: string[] }> };

const handler = async (req: NextRequest, ctx: Ctx): Promise<Response> => {
  const { path } = await ctx.params;
  return proxy(req, path ?? []);
};

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
