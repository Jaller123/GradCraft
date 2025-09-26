import React from "react";
import styles from "../styles/CvForm.module.css";
import { CvData } from "../types";

type Props = {
  value: CvData;
  set: <K extends keyof CvData>(k: K, v: CvData[K]) => void;
};

const ContactInput: React.FC<Props> = ({ value, set }) => (
  <div className={styles.field}>
    <label className={styles.label}>Contact</label>
    <input
      className={styles.input}
      value={value.skills.join(", ")}
      onChange={(e) =>
        set(
          "contact",
          e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        )
      }
    />
  </div>
);

export default ContactInput;
