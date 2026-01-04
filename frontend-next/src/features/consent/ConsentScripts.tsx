"use client";

import React, { useEffect, useState } from "react";
import { consentFlags, readConsent } from "./consent";

export default function ConsentScripts() {
  const [consent, setConsent] = useState<{ analytics: boolean; ads: boolean } | null>(null);
  const flags = consentFlags();

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
      {flags.ads && consent.ads ? (
        <>
          {/* Add ads scripts here once IDs are available. */}
        </>
      ) : null}
    </>
  );
}
