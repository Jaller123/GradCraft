import React from "react";
import styles from "../styles/CvForm.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parseYearOrYearMonth } from "./cvUtils";
import { CvEducation } from "../types";

type EditDraft = {
  school: string;
  program: string;
  start: Date | null;
  end: Date | null;
};

type Props = {
  edu: CvEducation;
  index: number;
  isEditing: boolean;
  editDraft: EditDraft | null;
  onBeginEdit: (index: number, draft: EditDraft) => void;
  onCancel: () => void;
  onSave: (index: number, draft: EditDraft) => void;
  onRemove: (index: number) => void;
};

const EducationItem: React.FC<Props> = ({
  edu, index, isEditing, editDraft, onBeginEdit, onCancel, onSave, onRemove
}) => {
  if (isEditing && editDraft) {
    return (
      <div className={styles.card}>
        <input
          className={styles.input}
          placeholder="School"
          value={editDraft.school}
          onChange={(e) => onBeginEdit(index, { ...editDraft, school: e.target.value })}
        />
        <input
          className={styles.input}
          placeholder="Program / Degree"
          value={editDraft.program}
          onChange={(e) => onBeginEdit(index, { ...editDraft, program: e.target.value })}
        />

        <div className={styles.row2}>
          <DatePicker
            selected={editDraft.start}
            onChange={(date) => onBeginEdit(index, { ...editDraft, start: date })}
            placeholderText="Start date"
            dateFormat="yyyy-MM-dd"
            portalId="datepicker-portal"
          />
          <DatePicker
            selected={editDraft.end}
            onChange={(date) => onBeginEdit(index, { ...editDraft, end: date })}
            placeholderText="End date"
            dateFormat="yyyy-MM-dd"
            portalId="datepicker-portal"
          />
        </div>

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
        <strong>{edu.program}</strong> @ {edu.school}
      </div>
      <div>{edu.start || "—"} – {edu.end || "Present"}</div>

      <div className={styles.btnRow}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={() =>
            onBeginEdit(index, {
              school: edu.school,
              program: edu.program,
              start: parseYearOrYearMonth(edu.start),
              end: parseYearOrYearMonth(edu.end),
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

export default EducationItem;
