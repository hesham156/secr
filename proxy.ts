import { NextResponse, type NextRequest } from "next/server";

const isDev = process.env.NODE_ENV !== "production";

const protectedPrefixes = [
  "/dashboard",
  "/vault",
  "/favorites",
  "/categories",
  "/secure-notes",
  "/password-generator",
  "/security",
  "/settings",
  "/backup"
];

function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

function createCsp(nonce: string): string {
  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    "'wasm-unsafe-eval'",
    ...(isDev
      ? ["'unsafe-eval'", "http://gc.kis.v2.scr.kaspersky-labs.com", "https://gc.kis.v2.scr.kaspersky-labs.com"]
      : [])
  ].join(" ");

  const connectSrc = [
    "'self'",
    ...(isDev
      ? [
          "ws:",
          "wss:",
          "http://gc.kis.v2.scr.kaspersky-labs.com",
          "https://gc.kis.v2.scr.kaspersky-labs.com",
          "ws://gc.kis.v2.scr.kaspersky-labs.com",
          "wss://gc.kis.v2.scr.kaspersky-labs.com"
        ]
      : [])
  ].join(" ");

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: ${isDev ? "http: https:" : "https://www.google.com/s2/favicons"}`,
    "font-src 'self' data:",
    `connect-src ${connectSrc}`,
    ...(isDev ? [] : ["upgrade-insecure-requests"])
  ].join("; ");
}

export function proxy(request: NextRequest) {
  const nonce = createNonce();
  const csp = createCsp(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix));
  const hasSession = Boolean(request.cookies.get("authjs.session-token") ?? request.cookies.get("__Secure-authjs.session-token"));

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    const redirect = NextResponse.redirect(loginUrl);
    redirect.headers.set("Content-Security-Policy", csp);
    return redirect;
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  if (!isDev) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
