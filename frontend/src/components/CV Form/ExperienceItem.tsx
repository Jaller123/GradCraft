import React from "react";
import styles from "../styles/CvForm.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { bulletsFromTextarea, bulletsToTextarea, parseYearOrYearMonth } from "./cvUtils";

type Exp = {
  role: string;
  company: string;
  start?: string;
  end?: string;
  bullets: string[];
  tech: string[];
};

type EditDraft = {
  role: string;
  company: string;
  start: Date | null;
  end: Date | null;
  bullets: string;
  tech: string;
};

type Props = {
  exp: Exp;
  index: number;
  isEditing: boolean;
  editDraft: EditDraft | null;
  onBeginEdit: (index: number, draft: EditDraft) => void;
  onCancel: () => void;
  onSave: (index: number, draft: EditDraft) => void;
  onRemove: (index: number) => void;
};

const ExperienceItem: React.FC<Props> = ({
  exp, index, isEditing, editDraft, onBeginEdit, onCancel, onSave, onRemove
}) => {
  if (isEditing && editDraft) {
    return (
      <div className={styles.card}>
        <input
          className={styles.input}
          placeholder="Role"
          value={editDraft.role}
          onChange={(e) => onBeginEdit(index, { ...editDraft, role: e.target.value })}
        />
        <input
          className={styles.input}
          placeholder="Company"
          value={editDraft.company}
          onChange={(e) => onBeginEdit(index, { ...editDraft, company: e.target.value })}
        />

        <div className={styles.row2}>
          <DatePicker
            selected={editDraft.start}
            onChange={(date) => onBeginEdit(index, { ...editDraft, start: date })}
            placeholderText="Start date"
            dateFormat="yyyy-MM-dd"
          />
          <DatePicker
            selected={editDraft.end}
            onChange={(date) => onBeginEdit(index, { ...editDraft, end: date })}
            placeholderText="End date"
            dateFormat="yyyy-MM-dd"
          />
        </div>

        <textarea
          className={styles.textarea}
          rows={4}
          placeholder="Bullets (one per line)"
          value={editDraft.bullets}
          onChange={(e) => onBeginEdit(index, { ...editDraft, bullets: e.target.value })}
        />
        <input
          className={styles.input}
          placeholder="Tech (comma separated)"
          value={editDraft.tech}
          onChange={(e) => onBeginEdit(index, { ...editDraft, tech: e.target.value })}
        />

        <div className={styles.btnRow}>
          <button type="button" className={styles.btnPrimary} onClick={() => onSave(index, editDraft)}>
            Save
          </button>
          <button type="button" className={styles.btnGhost} onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className={styles.btnGhost} onClick={() => onRemove(index)}>
            Remove
          </button>
        </div>
      </div>
    );
  }

  // display mode
  return (
    <div className={styles.card}>
      <div>
        <strong>{exp.role}</strong> @ {exp.company}
      </div>
      <div>{exp.start || "—"} – {exp.end || "Present"}</div>

      {exp.bullets?.length > 0 && (
        <ul className={styles.list}>
          {exp.bullets.map((b, bi) => (
            <li key={bi}>{b}</li>
          ))}
        </ul>
      )}

      <div className={styles.btnRow}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={() =>
            onBeginEdit(index, {
              role: exp.role,
              company: exp.company,
              start: parseYearOrYearMonth(exp.start),
              end: parseYearOrYearMonth(exp.end),
              bullets: bulletsToTextarea(exp.bullets || []),
              tech: (exp.tech || []).join(", "),
            })
          }
        >
          Edit
        </button>
        <button type="button" className={styles.btnGhost} onClick={() => onRemove(index)}>
          Remove
        </button>
      </div>
    </div>
  );
};

export default ExperienceItem;
