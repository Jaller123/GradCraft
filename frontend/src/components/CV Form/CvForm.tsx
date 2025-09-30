import React from "react";
import styles from "../styles/CvForm.module.css";
import { CvData } from "../types";

import BasicInfoSection from "./BasicInfoSection";
import ExperienceList from "./ExperienceList";
import EducationList from "./EducationList"
import SkillsInput from "./SkillsInput";
import ContactInput from "./ContactInput";

type Props = {
  value: CvData;
  onChange: React.Dispatch<React.SetStateAction<CvData>>; 
  onContinue?: () => void;                                
};

const CvForm: React.FC<Props> = ({ value, onChange, onContinue }) => {
  const set = <K extends keyof CvData>(k: K, v: CvData[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className={styles.cardSurface}>
      <form className={styles.form}>
        <BasicInfoSection value={value} set={set} />
        <ExperienceList value={value} set={set} />
        <EducationList value={value} set={set} />
        <SkillsInput value={value} set={set} />
        <ContactInput value={value} set={set} />
          {onContinue && (
            <div className={styles.continueBar}>
              <button type="button" className={styles.btnPrimary} onClick={onContinue}>
                Save &amp; Continue →
              </button>
            </div>
          )}
      </form>
    </div>
  );
};

export default CvForm;
