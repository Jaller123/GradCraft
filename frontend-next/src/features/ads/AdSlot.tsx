"use client";

import React from "react";
import styles from "./AdSlot.module.css";
import { consentFlags, readConsent } from "../consent/consent";

type Props = {
  label?: string;
  className?: string;
};

const AdSlot: React.FC<Props> = ({ label = "Ad slot", className }) => {
  const flags = consentFlags();
  const consent = readConsent();
  const allowed = flags.ads && (consent?.ads ?? false);

  if (!allowed) return null;

  return (
    <div className={`${styles.slot} ${className ?? ""}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.placeholder}>AdSense placement (enable ID when approved)</div>
    </div>
  );
};

export default AdSlot;
