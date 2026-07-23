"use client";

import { useEffect, useId, useRef } from "react";
import Script from "next/script";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

export function TurnstileWidget({
  onVerify,
  onExpire,
}: {
  onVerify: (token: string) => void;
  onExpire: () => void;
}) {
  const containerId = useId().replace(/:/g, "");
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    if (!siteKey || !window.turnstile || widgetIdRef.current) return;
    widgetIdRef.current = window.turnstile.render(`#${containerId}`, {
      sitekey: siteKey,
      callback: onVerify,
      "expired-callback": onExpire,
      "error-callback": onExpire,
      theme: "light",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey, containerId]);

  if (!siteKey) {
    // Local dev without a configured site key — don't block the form,
    // but make the gap visible rather than silently rendering nothing.
    return (
      <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
        Turnstile isn&apos;t configured (NEXT_PUBLIC_TURNSTILE_SITE_KEY missing) —
        bot protection is inactive in this environment.
      </p>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (window.turnstile && !widgetIdRef.current) {
            widgetIdRef.current = window.turnstile.render(`#${containerId}`, {
              sitekey: siteKey,
              callback: onVerify,
              "expired-callback": onExpire,
              "error-callback": onExpire,
              theme: "light",
            });
          }
        }}
      />
      <div id={containerId} />
    </>
  );
}
