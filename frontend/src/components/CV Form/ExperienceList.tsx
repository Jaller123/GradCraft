import React, { useState } from "react";
import styles from "../styles/CvForm.module.css";
import ExperienceItem from "./ExperienceItem";
import ExperienceAdd from "././ExperienceAdd";
import { toYMD, bulletsFromTextarea } from "./cvUtils";
import { CvData } from "../types";

type Props = {
  value: CvData;
  set: <K extends keyof CvData>(k: K, v: CvData[K]) => void;
};

const ExperienceList: React.FC<Props> = ({ value, set }) => {
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{
    role: string;
    company: string;
    start: Date | null;
    end: Date | null;
    bullets: string;
    tech: string;
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
      role: draft.role.trim(),
      company: draft.company.trim(),
      start: toYMD(draft.start),
      end: toYMD(draft.end),
      bullets: bulletsFromTextarea(draft.bullets),
      tech: draft.tech.split(",").map((s) => s.trim()).filter(Boolean),
    };
    if (!updated.role || !updated.company) return;
    const next = value.experience.slice();
    next[index] = updated;
    set("experience", next);
    setEditIndex(null);
    setEditDraft(null);
  };

  const remove = (index: number) => {
    const next = value.experience.slice();
    next.splice(index, 1);
    set("experience", next);
    if (editIndex === index) cancelEdit();
  };

  const add = (item: CvData["experience"][number]) => {
    set("experience", [...value.experience, item]);
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>Experience</label>

      {value.experience.map((exp, i) => (
        <ExperienceItem
          key={i}
          exp={exp}
          index={i}
          isEditing={editIndex === i}
          editDraft={editDraft}
          onBeginEdit={beginEdit}
          onCancel={cancelEdit}
          onSave={saveEdit}
          onRemove={remove}
        />
      ))}

      {/* Add new experience */}
      <ExperienceAdd onAdd={add} />
    </div>
  );
};

export default ExperienceList;
