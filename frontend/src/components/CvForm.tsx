import React from "react";
import styles from "./styles/CvForm.module.css";

// Define the CV data type (can also be imported from a shared types file)
export type CvData = {
  fullName: string;
  title: string;
  summary: string;
  contacts: {
    email?: string;
    phone?: string;
    location?: string;
    links?: string[];
  };
  skills: string[];
  experience: {
    role: string;
    company: string;
    start?: string;
    end?: string;
    bullets: string[];
    tech: string[];
  }[];
  education: {
    school: string;
    program: string;
    start?: string;
    end?: string;
  }[];
  projects: {
    name: string;
    url?: string;
    bullets: string[];
  }[];
  languages: { name: string; level: string }[];
};

type Props = {
  value: CvData;
  onChange: (next: CvData) => void;
};

const CvForm: React.FC<Props> = ({ value, onChange }) => {
  const set = <K extends keyof CvData>(k: K, v: CvData[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <form className={styles.form}>
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

      <div className={styles.field}>
        <label className={styles.label}>Skills (comma separated)</label>
        <input
          className={styles.input}
          value={value.skills.join(", ")}
          onChange={(e) =>
            set(
              "skills",
              e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          }
        />
      </div>

      {/* TODO: map experience, education, projects, languages with add/remove buttons */}
    </form>
  );
};

export default CvForm;
