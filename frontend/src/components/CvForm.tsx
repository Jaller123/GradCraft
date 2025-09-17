import React from "react";
import styles from "./styles/CvForm.module.css";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; 

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

  const [expDraft, setExpDraft] = useState<{
    role: string;
    company: string;
    start: Date | null;
    end: Date | null;
    bullets: string;
    tech: string;
  }>({
    role: "",
    company: "",
    start: null,
    end: null,
    bullets: "",
    tech: "",
  });

  const toYMD = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : undefined);

   const addExperience = () => {
    const newItem = {
      role: expDraft.role.trim(),
      company: expDraft.company.trim(),
      start: toYMD(expDraft.start),
      end: toYMD(expDraft.end),
      bullets: expDraft.bullets.split(",").map(s => s.trim()).filter(Boolean),
      tech: expDraft.tech.split(",").map(s => s.trim()).filter(Boolean),
    };
    if (!newItem.role || !newItem.company) return;

    set("experience", [...value.experience, newItem]);

    setExpDraft({
      role: "",
      company: "",
      start: null,
      end: null,
      bullets: "",
      tech: "",
    });
  };

  const removeExperience = (idx: number) => {
    const next = value.experience.slice()
    next.splice(idx, 1)
    set("experience", next)
  }

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
        <label className={styles.label}>Experience</label>

        {value.experience.map((exp, i) => (
          <div key={i} className={styles.card}>
            <div><strong>{exp.role}</strong> @ {exp.company}</div>
            <div>{exp.start || "—"} – {exp.end || "Present"}</div>
            <button type="button" onClick={() => removeExperience(i)} className={styles.btnGhost}>
              Remove
            </button>
          </div>
        ))}

        {/* Add new experience */}
        <input
          className={styles.input}
          placeholder="Role"
          value={expDraft.role}
          onChange={e => setExpDraft(s => ({ ...s, role: e.target.value }))}
        />
        <input
          className={styles.input}
          placeholder="Company"
          value={expDraft.company}
          onChange={e => setExpDraft(s => ({ ...s, company: e.target.value }))}
        />

        <div className={styles.row2}>
          <DatePicker
            selected={expDraft.start}                // ✅ Date | null
            onChange={(date: Date | null) => setExpDraft(s => ({ ...s, start: date }))}
            placeholderText="Start date"
            dateFormat="yyyy-MM-dd"
          />
          <DatePicker
            selected={expDraft.end}                  // ✅ Date | null
            onChange={(date: Date | null) => setExpDraft(s => ({ ...s, end: date }))}
            placeholderText="End date"
            dateFormat="yyyy-MM-dd"
          />
        </div>

        <input
          className={styles.input}
          placeholder="Bullets (comma separated)"
          value={expDraft.bullets}
          onChange={e => setExpDraft(s => ({ ...s, bullets: e.target.value }))}
        />
        <input
          className={styles.input}
          placeholder="Tech (comma separated)"
          value={expDraft.tech}
          onChange={e => setExpDraft(s => ({ ...s, tech: e.target.value }))}
        />

        <button type="button" onClick={addExperience} className={styles.btnPrimary}>
          Add Experience
        </button>
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
