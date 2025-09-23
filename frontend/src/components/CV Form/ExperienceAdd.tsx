import React, { useState } from "react";
import styles from "../styles/CvForm.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toYMD, bulletsFromTextarea } from "./cvUtils";

type Props = {
  onAdd: (item: {
    role: string;
    company: string;
    start?: string;
    end?: string;
    bullets: string[];
    tech: string[];
  }) => void;
};

const ExperienceAdd: React.FC<Props> = ({ onAdd }) => {
  const [draft, setDraft] = useState({
    role: "",
    company: "",
    start: null as Date | null,
    end: null as Date | null,
    bullets: "",
    tech: "",
  });

  const add = () => {
    const item = {
      role: draft.role.trim(),
      company: draft.company.trim(),
      start: toYMD(draft.start),
      end: toYMD(draft.end),
      bullets: bulletsFromTextarea(draft.bullets),
      tech: draft.tech.split(",").map((s) => s.trim()).filter(Boolean),
    };
    if (!item.role || !item.company) return;
    onAdd(item);
    setDraft({ role: "", company: "", start: null, end: null, bullets: "", tech: "" });
  };

  return (
    <>
      <input
        className={styles.input}
        placeholder="Role"
        value={draft.role}
        onChange={(e) => setDraft((s) => ({ ...s, role: e.target.value }))}
      />
      <input
        className={styles.input}
        placeholder="Company"
        value={draft.company}
        onChange={(e) => setDraft((s) => ({ ...s, company: e.target.value }))}
      />

      <div className={styles.row2}>
        <DatePicker
          selected={draft.start}
          onChange={(date) => setDraft((s) => ({ ...s, start: date }))}
          placeholderText="Start date"
          dateFormat="yyyy-MM-dd"
        />
        <DatePicker
          selected={draft.end}
          onChange={(date) => setDraft((s) => ({ ...s, end: date }))}
          placeholderText="End date"
          dateFormat="yyyy-MM-dd"
        />
      </div>

      <textarea
        className={styles.textarea}
        placeholder={`Bullets (one per line)\nExample:\n- Built feature X\n- Improved load time by 40%`}
        rows={4}
        value={draft.bullets}
        onChange={(e) => setDraft((s) => ({ ...s, bullets: e.target.value }))}
      />
      <input
        className={styles.input}
        placeholder="Tech (comma separated)"
        value={draft.tech}
        onChange={(e) => setDraft((s) => ({ ...s, tech: e.target.value }))}
      />

      <button type="button" className={styles.btnPrimary} onClick={add}>
        Add Experience
      </button>
    </>
  );
};

export default ExperienceAdd;
