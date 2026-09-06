import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const productionCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://www.google.com/s2/favicons",
  "font-src 'self'",
  "connect-src 'self'",
  "upgrade-insecure-requests"
].join("; ");

const developmentCsp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' http://gc.kis.v2.scr.kaspersky-labs.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: http: https:",
  "font-src 'self' data:",
  "connect-src 'self' ws: http://gc.kis.v2.scr.kaspersky-labs.com ws://gc.kis.v2.scr.kaspersky-labs.com"
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: isDev ? developmentCsp : productionCsp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
          { key: "X-Frame-Options", value: "DENY" },
          ...(isDev
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload"
                }
              ])
        ]
      }
    ];
  }
};

export default nextConfig;
