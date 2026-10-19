import type { NextConfig } from "next";
 
// This static CSP is the one that actually applies on the deployed
// Cloudflare Worker — middleware.ts's nonce-based CSP never runs there
// (confirmed directly: Next.js middleware does not execute at all under
// the current @opennextjs/cloudflare + Next.js 15.5.21 combination, a
// real gap in that adapter, not something fixable in our own code). This
// header mechanism, by contrast, is proven to work in production — the
// other five headers below were already confirmed present in live
// response headers.
//
// The trade-off: a static header can't carry a fresh nonce per request,
// so unlike middleware's version, script-src here allows 'unsafe-inline'
// to let Next.js's own inline RSC-hydration <script> tags run. That does
// lose CSP's protection against inline-script injection specifically —
// but every other restriction (no scripts from arbitrary remote domains,
// no framing, no unexpected image/connect sources) still applies exactly
// as strictly as before. Going from "no CSP at all" (the actual live
// state until this change) to this is a clear net improvement.
//
// middleware.ts's own CSP logic is left untouched — it still applies
// correctly in local `next dev`, and browsers enforce the intersection
// when multiple Content-Security-Policy headers are present, so having
// both is safe rather than conflicting: local dev effectively gets the
// stronger nonce-based policy, Cloudflare gets this one.
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
};
 
export default nextConfig;