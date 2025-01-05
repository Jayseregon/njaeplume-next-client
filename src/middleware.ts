import type { NextRequest } from "next/server";

import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

import { localePrefix, defaultLocale, locales, pathnames } from "./config";

// Existing middleware configuration
const intlMiddleware = createMiddleware({
  defaultLocale,
  locales,
  localePrefix,
  pathnames,
  localeDetection: false,
});

// Refactored locale middleware function
function localeMiddleware(req: NextRequest) {
  // Check if the request is for an API route and bypass the locale handling
  if (req.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Use the existing intl middleware to handle initial locale setup
  const response = intlMiddleware(req);

  // Check if the NEXT_LOCALE cookie is set and if it's different from the current locale
  const currentLocale = req.nextUrl.locale;
  const nextLocale = req.cookies.get("NEXT_LOCALE")?.value;

  if (
    nextLocale &&
    typeof nextLocale === "string" &&
    currentLocale !== nextLocale &&
    locales.includes(nextLocale as "en" | "fr")
  ) {
    // If the locale has changed, redirect to the same URL with the new locale
    const url = req.nextUrl.clone();

    // Ensure we do not add the locale multiple times
    const segments = req.nextUrl.pathname.split("/");

    if (segments[1] === nextLocale) {
      // Locale is already present in the path
      return response;
    }
    url.pathname = `/${nextLocale}${req.nextUrl.pathname}`;

    return NextResponse.redirect(url);
  }

  return response;
}

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
  const { pathname } = req.nextUrl;

  const isDev = process.env.NODE_ENV === "development";

  let response = localeMiddleware(req);

  if (!isDev) {
    return cspMiddleware(req);
  } else {
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/", // Root for CSP
    "/(fr|en)/:path*", // Set a cookie to remember the previous locale
    "/((?!_next/static|_vercel|.*\\..*).*)", // Exclude Next.js static routes and other specified patterns
    "/((?!api|_next/static|_next/image|_next/data|static|favicon.ico|favicon.png|favicon.webp).*)", // Exclude API routes, static assets, etc.
  ],
};
