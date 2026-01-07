"use client";

import React, { useEffect, useState } from "react";
import styles from "./AdSlot.module.css";
import { consentFlags, readConsent } from "../consent/consent";

type Props = {
  label?: string;
  className?: string;
};

const AdSlot: React.FC<Props> = ({ label = "Ad slot", className }) => {
  const flags = consentFlags();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const consent = readConsent();
    setAllowed(flags.ads && (consent?.ads ?? false));
  }, [flags.ads]);

  if (!allowed) return null;

  return (
    <div className={`${styles.slot} ${className ?? ""}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.placeholder}>Advertisement</div>
    </div>
  );
};

export default AdSlot;
