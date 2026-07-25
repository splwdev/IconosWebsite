import type { NextConfig } from "next";
 
// Content-Security-Policy is set dynamically in middleware.ts instead of
// here, because it needs a fresh nonce per request (to allow Next.js's own
// inline RSC-streaming <script> tags under a strict policy). These headers
// are the ones that don't need to vary per request, so they stay static.
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
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