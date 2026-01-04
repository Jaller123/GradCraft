"use client";

import React from "react";
import styles from "../OptionsPage.module.css";
import type { Tab } from "../types";

type Props = {
  tab: Tab;
  onChange: (tab: Tab) => void;
};

const OptionsTabs: React.FC<Props> = ({ tab, onChange }) => {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${tab === "profile" ? styles.tabActive : ""}`}
        type="button"
        onClick={() => onChange("profile")}
      >
        Profile
      </button>
      <button
        className={`${styles.tab} ${tab === "security" ? styles.tabActive : ""}`}
        type="button"
        onClick={() => onChange("security")}
      >
        Security
      </button>
    </div>
  );
};

export default OptionsTabs;
