"use client";

import React from "react";
import styles from "../LoginPage.module.css";
import type { AccountType, RoleStep } from "../types";

type Props = {
  open: boolean;
  roleStep: RoleStep;
  accountType: AccountType | null;
  loading: boolean;
  industryCategory: string;
  studiedRole: string;
  occupationRole: string;
  graduationYear: string;
  onClose: () => void;
  onSelectRole: (role: AccountType) => void;
  onBack: () => void;
  onConfirm: () => void;
  onIndustryChange: (value: string) => void;
  onStudiedRoleChange: (value: string) => void;
  onOccupationRoleChange: (value: string) => void;
  onGraduationYearChange: (value: string) => void;
};

const RoleModal: React.FC<Props> = ({
  open,
  roleStep,
  accountType,
  loading,
  industryCategory,
  studiedRole,
  occupationRole,
  graduationYear,
  onClose,
  onSelectRole,
  onBack,
  onConfirm,
  onIndustryChange,
  onStudiedRoleChange,
  onOccupationRoleChange,
  onGraduationYearChange,
}) => {
  if (!open) return null;

  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="role-title">
      <div className={styles.modal}>
        {roleStep === "select" ? (
          <>
            <h2 className={styles.modalTitle} id="role-title">
              Choose your account type
            </h2>
            <p className={styles.modalBody}>
              This helps us show the right tools and matches for your goals.
            </p>
            <div className={styles.roleGrid}>
              <button className={styles.roleBtn} type="button" onClick={() => onSelectRole("student")} disabled={loading}>
                Student
              </button>
              <button
                className={styles.roleBtn}
                type="button"
                onClick={() => onSelectRole("recruiter")}
                disabled={loading}
              >
                Recruiter
              </button>
              <button className={styles.roleBtn} type="button" onClick={() => onSelectRole("other")} disabled={loading}>
                Other
              </button>
            </div>
            <button className={styles.linkBtn} type="button" onClick={onClose}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <h2 className={styles.modalTitle} id="role-title">
              Add your focus
            </h2>
            <p className={styles.modalBody}>
              This helps match students and recruiters in the right field.
            </p>
            <label className={styles.label}>
              Industry
              <select className={styles.input} value={industryCategory} onChange={(e) => onIndustryChange(e.target.value)}>
                <option value="software">Software</option>
                <option value="data">Data</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="operations">Operations</option>
                <option value="other">Other</option>
              </select>
            </label>
            {accountType === "student" ? (
              <>
                <label className={styles.label}>
                  Field of study
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Computer Science, UX Design, Analytics"
                    value={studiedRole}
                    onChange={(e) => onStudiedRoleChange(e.target.value)}
                  />
                </label>
                <label className={styles.label}>
                  Graduation year
                  <input
                    className={styles.input}
                    type="number"
                    min="2000"
                    max="2100"
                    placeholder="2024"
                    value={graduationYear}
                    onChange={(e) => onGraduationYearChange(e.target.value)}
                  />
                </label>
              </>
            ) : (
              <label className={styles.label}>
                Occupation
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Recruiter, Talent Partner, Hiring Manager"
                  value={occupationRole}
                  onChange={(e) => onOccupationRoleChange(e.target.value)}
                />
              </label>
            )}
            <div className={styles.modalActions}>
              <button className={styles.linkBtn} type="button" onClick={onBack}>
                Back
              </button>
              <button className={styles.roleBtn} type="button" onClick={onConfirm} disabled={loading}>
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleModal;
