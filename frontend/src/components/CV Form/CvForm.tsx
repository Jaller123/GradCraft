import React from "react";
import styles from "../styles/CvForm.module.css";
import { CvData } from "../types";

import BasicInfoSection from "./BasicInfoSection";
import ExperienceList from "./ExperienceList";
import SkillsInput from "./SkillsInput";

type Props = {
  value: CvData;
  onChange: (next: CvData) => void;
};

const CvForm: React.FC<Props> = ({ value, onChange }) => {
  const set = <K extends keyof CvData>(k: K, v: CvData[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className={styles.cardSurface}>
      <form className={styles.form}>
        <BasicInfoSection value={value} set={set} />
        <ExperienceList value={value} set={set} />
        <SkillsInput value={value} set={set} />

        {/* TODO: add Education, Projects, Languages sections the same way */}
      </form>
    </div>
  );
};

export default CvForm;
