import { NextResponse, type NextRequest } from "next/server";

const PROTECTED = ["/pms", "/inscription"];

/**
 * Edge middleware — protect hotel-manager routes.
 *
 * Tokens live in httpOnly cookies set by auth server actions. If neither
 * an access token nor a refresh token is present, the session is definitely
 * gone and we redirect to the landing page with ?login=1 so the login modal
 * opens immediately. When at least one token exists we let the request
 * through; the BFF proxy handles 401 → refresh → retry transparently.
 */
export function middleware(req: NextRequest): Response | undefined {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (!isProtected) return NextResponse.next();

  const accessToken  = req.cookies.get("ip_access_token")?.value;
  const refreshToken = req.cookies.get("ip_refresh_token")?.value;

  if (!accessToken && !refreshToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("login", "1");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/pms/:path*", "/inscription/:path*"],
};
