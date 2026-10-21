import type { NextConfig } from "next";
 
// Two CSPs are sent, and browsers enforce both (the intersection):
//
// 1. middleware.ts — a strict, nonce-based policy ('strict-dynamic', no
//    'unsafe-inline'). Under Next.js 15 + the older @opennextjs/cloudflare,
//    middleware never ran on Cloudflare, so this only applied in local dev.
//    Since the Next.js 16 upgrade (Oct 2026) it does run on Cloudflare —
//    verified in workerd: every script tag carries the per-request nonce.
//
// 2. This static header — a looser fallback ('unsafe-inline' for scripts)
//    kept as a safety net in case middleware is ever bypassed (e.g. a
//    static asset route or an adapter regression). Because both apply, the
//    effective policy is the stricter nonce-based one wherever middleware
//    runs. Keep the two in sync when adding domains (e.g. frame-src).
const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co",
  "frame-src https://challenges.cloudflare.com https://www.youtube-nocookie.com https://cdn.yoshki.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");
 
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
];
 
const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // Default is 1MB, which silently rejects any Server Action request
    // (e.g. the image upload FormData in uploadFeaturedImage/
    // uploadPageImage) before it even reaches our own code — that's what
    // was showing up as a generic "Failed to fetch" rather than the
    // "Image must be under 5MB" message those actions already return. Set
    // just above that 5MB app-level check, not equal to it, so our own
    // validation is what actually fires at the boundary.
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // The Work With Us form briefly lived here (Oct 2026); query strings
      // such as ?interest=referral are carried across automatically.
      { source: "/work-with-us/get-in-touch", destination: "/work-with-us/enquiry", permanent: true },
    ];
  },
};
 
export default nextConfig;