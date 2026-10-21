/**
 * Verifies a Turnstile token against Cloudflare's siteverify endpoint.
 * Server-side only — the secret key must never reach the browser.
 * If TURNSTILE_SECRET_KEY isn't configured (e.g. local dev before Cloudflare
 * setup), verification is skipped with a console warning rather than
 * blocking every submission — but this must be set in production.
 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.warn("[forms] TURNSTILE_SECRET_KEY not set — skipping bot verification. Set this before production.");
    return true;
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const result = (await response.json()) as { success: boolean };
    return result.success === true;
  } catch (err) {
    console.error("[forms] Turnstile verification request failed:", err);
    return false;
  }
}
