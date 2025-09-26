// ContactInput.tsx
import React from "react";
import styles from "../styles/CvForm.module.css";
import { CvData } from "../types";

type Props = {
  value: CvData;
  set: <K extends keyof CvData>(k: K, v: CvData[K]) => void;
};

const ContactInput: React.FC<Props> = ({ value, set }) => {
  const contacts = value.contacts ?? {};

  const setContact = <K extends keyof NonNullable<CvData["contacts"]>>(
    key: K,
    v: NonNullable<CvData["contacts"]>[K]
  ) => {
    set("contacts", { ...contacts, [key]: v });
  };

  const linksCsv =
    contacts.links && contacts.links.length > 0 ? contacts.links.join(", ") : "";

  return (
    <div className={styles.fieldGroup}>
      <div className={styles.field}>
        <label className={styles.label}>Email</label>
        <input
          className={styles.input}
          type="email"
          value={contacts.email ?? ""}
          onChange={(e) => setContact("email", e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Phone</label>
        <input
          className={styles.input}
          type="tel"
          value={contacts.phone ?? ""}
          onChange={(e) => setContact("phone", e.target.value)}
          placeholder="+xx XX XXX XX XX"
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Location</label>
        <input
          className={styles.input}
          value={contacts.location ?? ""}
          onChange={(e) => setContact("location", e.target.value)}
          placeholder=""
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Links (comma-separated)</label>
        <input
          className={styles.input}
          value={linksCsv}
          onChange={(e) =>
            setContact(
              "links",
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
          placeholder="GitHub, LinkedIn, Portfolio, etc."
        />
      </div>
    </div>
  );
};

export default ContactInput;
