"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { consentFlags, readConsent } from "./consent";

export default function ConsentScripts() {
  const [consent, setConsent] = useState<{ analytics: boolean; ads: boolean } | null>(null);
  const flags = consentFlags();
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const autoAds = process.env.NEXT_PUBLIC_ADSENSE_AUTO === "true";

  useEffect(() => {
    if (!flags.analytics && !flags.ads) return;
    const update = () => {
      const existing = readConsent();
      if (existing) setConsent({ analytics: existing.analytics, ads: existing.ads });
    };
    update();
    window.addEventListener("gc:consent", update);
    return () => window.removeEventListener("gc:consent", update);
  }, [flags.ads, flags.analytics]);

  if (!consent) return null;

  return (
    <>
      {flags.analytics && consent.analytics ? (
        <>
          {/* Add analytics scripts here once IDs are available. */}
        </>
      ) : null}
      {flags.ads && consent.ads && adsenseClient && autoAds ? (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
          />
        </>
      ) : null}
    </>
  );
}
