import type { NextRequest } from "next/server";

import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Helper to apply CSP headers to any response
function applyCsp(response: Response, _req: NextRequest): Response {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'unsafe-eval' 'strict-dynamic' https://www.google.com https://www.gstatic.com https://vercel.live https://*.clerk.accounts.dev https://clerk.njaeplume.com https://app.termageddon.com https://privacy-proxy.usercentrics.eu https://app.usercentrics.eu https://termageddon.ams3.cdn.digitaloceanspaces.com;
    style-src 'self' 'nonce-${nonce}' 'unsafe-inline' https://app.termageddon.com ;
    img-src 'self' blob: data: https://njaeink-remote-pull.b-cdn.net https://njae-plume-public-assets-pull.b-cdn.net https://img.clerk.com https://app.usercentrics.eu https://uct.service.usercentrics.eu;
    font-src 'self';
    connect-src 'self' https://app.termageddon.com https://privacy-proxy.usercentrics.eu https://app.usercentrics.eu https://api.usercentrics.eu https://fonts.gstatic.com https://consent-api.service.consent.usercentrics.eu https://graphql.usercentrics.eu https://aggregator.service.usercentrics.eu https://termageddon.ams3.cdn.digitaloceanspaces.com https://*.clerk.accounts.dev https://ny.storage.bunnycdn.com https://storage.bunnycdn.com https://clerk-telemetry.com https://clerk.njaeplume.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' https://www.google.com https://vercel.live;
    worker-src 'self' blob:;
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
const isUserAccountRoute = createRouteMatcher(["/account(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();
  let response;

  // Castle routes: check for admin role
  if (isAdminCastleRoute(req)) {
    if ((await auth()).sessionClaims?.metadata?.role !== "castleAdmin") {
      const url = new URL("/", req.url);

      response = NextResponse.redirect(url);
    } else {
      response = NextResponse.next();
    }
  }
  // Account routes: check for authentication
  else if (isUserAccountRoute(req)) {
    if (!userId) {
      response = redirectToSignIn();
    } else {
      response = NextResponse.next();
    }
  }
  // Non-protected routes
  else {
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
    "/((?!api/webhooks/stripe|api|_next/static|_next/image|_next/data|static|favicon.ico|favicon.png|favicon.webp).*)",
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api(?!/webhooks/stripe))(.*)",
    "/(trpc)(.*)",
  ],
};
