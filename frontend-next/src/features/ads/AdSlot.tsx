"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./AdSlot.module.css";
import { consentFlags, readConsent } from "../consent/consent";

type Props = {
  label?: string;
  className?: string;
};

const AdSlot: React.FC<Props> = ({ label = "Ad slot", className }) => {
  const flags = consentFlags();
  const [allowed, setAllowed] = useState(false);
  const slotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT;
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const autoAds = process.env.NEXT_PUBLIC_ADSENSE_AUTO === "true";
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    const consent = readConsent();
    setAllowed(flags.ads && (consent?.ads ?? false));
  }, [flags.ads]);

  useEffect(() => {
    if (!allowed || !slotId || !clientId) return;
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch {}
  }, [allowed, slotId, clientId]);

  if (!allowed || autoAds || !slotId || !clientId) return null;

  return (
    <div className={`${styles.slot} ${className ?? ""}`}>
      <div className={styles.label}>{label}</div>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSlot;
