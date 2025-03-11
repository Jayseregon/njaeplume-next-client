import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Helper to apply CSP headers to any response
function applyCsp(response: NextResponse, _req: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://www.google.com https://www.gstatic.com https://vercel.live https://*.clerk.accounts.dev https://clerk.njaeplume.com;
    style-src 'self' 'nonce-${nonce}' 'unsafe-inline';
    img-src 'self' blob: data: https://njaeink-remote-pull.b-cdn.net https://njae-plume-public-assets-pull.b-cdn.net https://img.clerk.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://www.google.com https://vercel.live;
    worker-src 'self' blob:;
    connect-src 'self' https://ny.storage.bunnycdn.com https://storage.bunnycdn.com https://*.clerk.accounts.dev https://clerk-telemetry.com https://clerk.njaeplume.com;
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("x-nonce", nonce);

  return response;
}

// Apply CSP in production on all responses
const isDev = process.env.NODE_ENV === "development";

const isAdminCastleRoute = createRouteMatcher(["/castle(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Role protection logic
  let response;

  if (
    isAdminCastleRoute(req) &&
    (await auth()).sessionClaims?.metadata?.role !== "castleAdmin"
  ) {
    const url = new URL("/", req.url);

    response = NextResponse.redirect(url);
  } else {
    response = NextResponse.next();
  }

  if (!isDev) {
    return applyCsp(response, req);
  }

  return response;
});

export const config = {
  matcher: [
    "/", // Root
    "/((?!_next/static|_vercel|.*\\..*).*)",
    "/((?!api|_next/static|_next/image|_next/data|static|favicon.ico|favicon.png|favicon.webp).*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
