import React, { useState } from "react";
import styles from "../styles/CvForm.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toYMD } from "./cvUtils";

type Props = {
  onAdd: (item: {
    school: string;
    program: string;
    start?: string;
    end?: string;
  }) => void;
};

const EducationAdd: React.FC<Props> = ({ onAdd }) => {
  const [draft, setDraft] = useState({
    school: "",
    program: "",
    start: null as Date | null,
    end: null as Date | null,
  });

  const add = () => {
    const item = {
      school: draft.school.trim(),
      program: draft.program.trim(),
      start: toYMD(draft.start),
      end: toYMD(draft.end),
    };
    if (!item.school || !item.program) return;
    onAdd(item);
    setDraft({ school: "", program: "", start: null, end: null });
  };

  return (
    <>
      <input
        className={styles.input}
        placeholder="School"
        value={draft.school}
        onChange={(e) => setDraft((s) => ({ ...s, school: e.target.value }))}
      />
      <input
        className={styles.input}
        placeholder="Program / Degree"
        value={draft.program}
        onChange={(e) => setDraft((s) => ({ ...s, program: e.target.value }))}
      />

      <div className={styles.row2}>
        <DatePicker
          selected={draft.start}
          onChange={(date) => setDraft((s) => ({ ...s, start: date }))}
          placeholderText="Start date"
          dateFormat="yyyy-MM-dd"
          portalId="datepicker-portal"
        />
        <DatePicker
          selected={draft.end}
          onChange={(date) => setDraft((s) => ({ ...s, end: date }))}
          placeholderText="End date"
          dateFormat="yyyy-MM-dd"
          portalId="datepicker-portal"
        />
      </div>

      <button type="button" className={styles.btnPrimary} onClick={add}>
        Add Education
      </button>
    </>
  );
};

export default EducationAdd;
