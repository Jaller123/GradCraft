import React, { useState } from "react";
import styles from "./styles/CvForm.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CvData } from "./types";

type Props = {
  value: CvData;
  onChange: (next: CvData) => void;
};

const toYMD = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : undefined);

// Helpers to go between strings and UI
const bulletsFromTextarea = (txt: string) =>
  txt
    .split(/\r?\n/)
    .map((s) => s.replace(/^\s*[-•]\s*/, "").trim())
    .filter(Boolean);

const bulletsToTextarea = (arr: string[]) =>
  (arr || []).map((b) => (b.startsWith("- ") ? b : `- ${b}`)).join("\n");

const parseYearOrYearMonth = (s?: string): Date | null => {
  if (!s) return null;
  const ym = /^(\d{4})-(\d{2})$/.exec(s);
  if (ym) {
    const y = Number(ym[1]);
    const m = Number(ym[2]) - 1;
    if (y >= 1900 && y <= 2100 && m >= 0 && m <= 11) return new Date(Date.UTC(y, m, 1));
  }
  const y = /^(\d{4})$/.exec(s);
  if (y) {
    const yy = Number(y[1]);
    if (yy >= 1900 && yy <= 2100) return new Date(Date.UTC(yy, 0, 1));
  }
  return null;
};

const CvForm: React.FC<Props> = ({ value, onChange }) => {
  const set = <K extends keyof CvData>(k: K, v: CvData[K]) => onChange({ ...value, [k]: v });

  // ----- Add experience draft (unchanged) -----
  const [expDraft, setExpDraft] = useState<{
    role: string;
    company: string;
    start: Date | null;
    end: Date | null;
    bullets: string;
    tech: string;
  }>({ role: "", company: "", start: null, end: null, bullets: "", tech: "" });

  const addExperience = () => {
    const newItem = {
      role: expDraft.role.trim(),
      company: expDraft.company.trim(),
      start: toYMD(expDraft.start),
      end: toYMD(expDraft.end),
      bullets: bulletsFromTextarea(expDraft.bullets),
      tech: expDraft.tech.split(",").map((s) => s.trim()).filter(Boolean),
    };
    if (!newItem.role || !newItem.company) return;

    set("experience", [...value.experience, newItem]);
    setExpDraft({ role: "", company: "", start: null, end: null, bullets: "", tech: "" });
  };

  const removeExperience = (idx: number) => {
    const next = value.experience.slice();
    next.splice(idx, 1);
    set("experience", next);
    if (editIndex === idx) {
      setEditIndex(null);
      setEditDraft(null);
    }
  };

  // ----- Inline edit state -----
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{
    role: string;
    company: string;
    start: Date | null;
    end: Date | null;
    bullets: string; // textarea
    tech: string; // comma string
  } | null>(null);

  const beginEdit = (idx: number) => {
    const exp = value.experience[idx];
    setEditIndex(idx);
    setEditDraft({
      role: exp.role,
      company: exp.company,
      start: parseYearOrYearMonth(exp.start),
      end: parseYearOrYearMonth(exp.end),
      bullets: bulletsToTextarea(exp.bullets || []),
      tech: (exp.tech || []).join(", "),
    });
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditDraft(null);
  };

  const saveEdit = () => {
    if (editIndex === null || !editDraft) return;
    const next = value.experience.slice();
    const updated = {
      role: editDraft.role.trim(),
      company: editDraft.company.trim(),
      start: toYMD(editDraft.start),
      end: toYMD(editDraft.end),
      bullets: bulletsFromTextarea(editDraft.bullets),
      tech: editDraft.tech.split(",").map((s) => s.trim()).filter(Boolean),
    };
    if (!updated.role || !updated.company) return;
    next[editIndex] = updated;
    set("experience", next);
    setEditIndex(null);
    setEditDraft(null);
  };

  return (
    <div className={styles.cardSurface}>
      <form className={styles.form}>
        {/* Basic fields */}
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

        {/* Experience list */}
        <div className={styles.field}>
          <label className={styles.label}>Experience</label>

          {value.experience.map((exp, i) => {
            const isEditing = editIndex === i && editDraft;

            if (isEditing) {
              // ----- Inline edit mode for this card -----
              return (
                <div key={i} className={styles.card}>
                  <input
                    className={styles.input}
                    placeholder="Role"
                    value={editDraft!.role}
                    onChange={(e) => setEditDraft({ ...editDraft!, role: e.target.value })}
                  />
                  <input
                    className={styles.input}
                    placeholder="Company"
                    value={editDraft!.company}
                    onChange={(e) => setEditDraft({ ...editDraft!, company: e.target.value })}
                  />

                  <div className={styles.row2}>
                    <DatePicker
                      selected={editDraft!.start}
                      onChange={(date: Date | null) => setEditDraft({ ...editDraft!, start: date })}
                      placeholderText="Start date"
                      dateFormat="yyyy-MM-dd"
                    />
                    <DatePicker
                      selected={editDraft!.end}
                      onChange={(date: Date | null) => setEditDraft({ ...editDraft!, end: date })}
                      placeholderText="End date"
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>

                  <textarea
                    className={styles.textarea}
                    rows={4}
                    placeholder="Bullets (one per line)"
                    value={editDraft!.bullets}
                    onChange={(e) => setEditDraft({ ...editDraft!, bullets: e.target.value })}
                  />
                  <input
                    className={styles.input}
                    placeholder="Tech (comma separated)"
                    value={editDraft!.tech}
                    onChange={(e) => setEditDraft({ ...editDraft!, tech: e.target.value })}
                  />

                  <div className={styles.btnRow}>
                    <button type="button" className={styles.btnPrimary} onClick={saveEdit}>
                      Save
                    </button>
                    <button type="button" className={styles.btnGhost} onClick={cancelEdit}>
                      Cancel
                    </button>
                    <button type="button" className={styles.btnGhost} onClick={() => removeExperience(i)}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            }

            // ----- Display mode -----
            return (
              <div key={i} className={styles.card}>
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
                  <button type="button" className={styles.btnPrimary} onClick={() => beginEdit(i)}>
                    Edit
                  </button>
                  <button type="button" className={styles.btnGhost} onClick={() => removeExperience(i)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add new experience (unchanged) */}
          <input
            className={styles.input}
            placeholder="Role"
            value={expDraft.role}
            onChange={(e) => setExpDraft((s) => ({ ...s, role: e.target.value }))}
          />
          <input
            className={styles.input}
            placeholder="Company"
            value={expDraft.company}
            onChange={(e) => setExpDraft((s) => ({ ...s, company: e.target.value }))}
          />

          <div className={styles.row2}>
            <DatePicker
              selected={expDraft.start}
              onChange={(date: Date | null) => setExpDraft((s) => ({ ...s, start: date }))}
              placeholderText="Start date"
              dateFormat="yyyy-MM-dd"
            />
            <DatePicker
              selected={expDraft.end}
              onChange={(date: Date | null) => setExpDraft((s) => ({ ...s, end: date }))}
              placeholderText="End date"
              dateFormat="yyyy-MM-dd"
            />
          </div>

          <textarea
            className={styles.textarea}
            placeholder={`Bullets (one per line)\nExample:\n- Built feature X\n- Improved load time by 40%`}
            rows={4}
            value={expDraft.bullets}
            onChange={(e) => setExpDraft((s) => ({ ...s, bullets: e.target.value }))}
          />
          <input
            className={styles.input}
            placeholder="Tech (comma separated)"
            value={expDraft.tech}
            onChange={(e) => setExpDraft((s) => ({ ...s, tech: e.target.value }))}
          />

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

          <button type="button" onClick={addExperience} className={styles.btnPrimary}>
            Add Experience
          </button>
        </div>

        {/* TODO: map education, projects, languages with add/remove buttons */}
      </form>
    </div>
  );
};

export default CvForm;
