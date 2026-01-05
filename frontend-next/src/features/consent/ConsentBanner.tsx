"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./ConsentBanner.module.css";
import { consentFlags, readConsent, writeConsent } from "./consent";

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState({ analytics: false, ads: false, requireConsent: false });

  useEffect(() => {
    const flags = consentFlags();
    setEnabled(flags);
    if (!flags.analytics && !flags.ads && !flags.requireConsent) {
      setVisible(false);
      return;
    }
    const existing = readConsent();
    setVisible(!existing);
  }, []);

  const acceptAll = () => {
    writeConsent({
      analytics: enabled.analytics,
      ads: enabled.ads,
      updatedAt: new Date().toISOString(),
    });
    setVisible(false);
  };

  const declineAll = () => {
    writeConsent({
      analytics: false,
      ads: false,
      updatedAt: new Date().toISOString(),
    });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-live="polite">
      <div className={styles.content}>
        <div>
          <strong>Cookie preferences</strong>
          <p className={styles.text}>
            We use cookies and local storage for core features. If enabled, we also use analytics and ads to improve
            the experience. You can learn more in our <Link href="/privacy">Privacy Policy</Link>.
          </p>
        </div>
        <div className={styles.actions}>
          <button className={styles.ghost} type="button" onClick={declineAll}>
            Decline
          </button>
          <button className={styles.primary} type="button" onClick={acceptAll}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
