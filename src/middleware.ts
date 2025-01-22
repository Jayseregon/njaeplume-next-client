import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";

// New CSP middleware function
function cspMiddleware(req: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.google.com https://www.gstatic.com https://vercel.live;
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data: https://njaeink-remote-pull.b-cdn.net;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://www.google.com;
    connect-src 'self' https://ny.storage.bunnycdn.com;
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(req.headers);

  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

// Combined middleware function
export async function middleware(req: NextRequest) {
  // const { pathname } = req.nextUrl;

  // Apply your existing CSP middleware in production
  const isDev = process.env.NODE_ENV === "development";

  if (!isDev) {
    return cspMiddleware(req);
  } else {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/", // Root for CSP
    "/((?!_next/static|_vercel|.*\\..*).*)", // Exclude Next.js static routes and other specified patterns
    "/((?!api|_next/static|_next/image|_next/data|static|favicon.ico|favicon.png|favicon.webp).*)", // Exclude API routes, static assets, etc.
  ],
};
