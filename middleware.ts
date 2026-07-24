import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const isDev = process.env.NODE_ENV === "development";

export async function middleware(request: NextRequest) {
  // A fresh nonce per request is what allows a strict CSP (no
  // 'unsafe-inline') to coexist with Next.js's own inline <script> tags
  // used for streaming React Server Components — Next automatically
  // applies this exact nonce to its own generated inline scripts once it
  // sees it in the CSP response header below.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https://*.supabase.co;
    connect-src 'self' https://*.supabase.co;
    frame-src https://challenges.cloudflare.com;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
  `;
  const contentSecurityPolicyHeaderValue = cspHeader.replace(/\s{2,}/g, " ").trim();

  // Forward the nonce to Server Components (via next/headers) so our own
  // inline/external scripts — currently just the Turnstile widget — can
  // apply it explicitly. 'strict-dynamic' means a script tagged with this
  // nonce is trusted to load further scripts of its own (e.g. Turnstile
  // loading its own sub-resources), without needing a domain allow-list.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);

  const response = await updateSession(request, requestHeaders);
  response.headers.set("Content-Security-Policy", contentSecurityPolicyHeaderValue);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};