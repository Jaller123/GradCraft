import React from "react";
import styles from "../styles/CvForm.module.css";
import { CvData } from "../types";

type Props = {
  value: CvData;
  set: <K extends keyof CvData>(k: K, v: CvData[K]) => void;
};

const BasicInfoSection: React.FC<Props> = ({ value, set }) => (
  <>
    <div className={styles.field}>
      <label className={styles.label}>Full name</label>
      <input
        className={styles.input}
        value={value.fullName}
        onChange={(e) => set("fullName", e.target.value)}
      />
    </div>

    <div className={styles.field}>
      <label className={styles.label}>Title</label>
      <input
        className={styles.input}
        value={value.title}
        onChange={(e) => set("title", e.target.value)}
      />
    </div>

    <div className={styles.field}>
      <label className={styles.label}>Summary</label>
      <textarea
        className={styles.textarea}
        rows={4}
        value={value.summary}
        onChange={(e) => set("summary", e.target.value)}
      />
    </div>
  </>
);

export default BasicInfoSection;
