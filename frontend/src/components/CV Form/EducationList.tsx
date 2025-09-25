import React, { useState } from "react";
import styles from "../styles/CvForm.module.css";
import EducationItem from "./EducationItem";
import EducationAdd from "./EducationAdd";
import { toYMD } from "./cvUtils";
import { CvData } from "../types";

type Props = {
  value: CvData;
  set: <K extends keyof CvData>(k: K, v: CvData[K]) => void;
};

const EducationList: React.FC<Props> = ({ value, set }) => {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{
    school: string;
    program: string;
    start: Date | null;
    end: Date | null;
  } | null>(null);

  const beginEdit = (index: number, draft: NonNullable<typeof editDraft>) => {
    setEditIndex(index);
    setEditDraft(draft);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setEditDraft(null);
  };

  const saveEdit = (index: number, draft: NonNullable<typeof editDraft>) => {
    const updated = {
      school: draft.school.trim(),
      program: draft.program.trim(),
      start: toYMD(draft.start),
      end: toYMD(draft.end),
    };
    if (!updated.school || !updated.program) return;
    const next = value.education.slice();
    next[index] = updated;
    set("education", next);
    setEditIndex(null);
    setEditDraft(null);
  };

  const remove = (index: number) => {
    const next = value.education.slice();
    next.splice(index, 1);
    set("education", next);
    if (editIndex === index) cancelEdit();
  };

  const add = (item: CvData["education"][number]) => {
    set("education", [...value.education, item]);
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>Education</label>

      {value.education.map((edu, i) => (
        <EducationItem
          key={i}
          edu={edu}
          index={i}
          isEditing={editIndex === i}
          editDraft={editDraft}
          onBeginEdit={beginEdit}
          onCancel={cancelEdit}
          onSave={saveEdit}
          onRemove={remove}
        />
      ))}

      <EducationAdd onAdd={add} />
    </div>
  );
};

export default EducationList;
