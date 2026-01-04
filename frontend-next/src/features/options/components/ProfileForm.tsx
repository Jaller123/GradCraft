"use client";

import React from "react";
import styles from "../OptionsPage.module.css";
import type { Profile } from "../types";

type Props = {
  profile: Profile;
  resumes: { id: string; title: string }[];
  saving: boolean;
  status: string;
  error: string;
  onChange: (profile: Profile) => void;
  onSave: () => void;
};

const ProfileForm: React.FC<Props> = ({ profile, resumes, saving, status, error, onChange, onSave }) => {
  return (
    <section className={styles.card}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <div className={styles.grid}>
          <label className={styles.label}>
            Full name
            <input
              className={styles.input}
              type="text"
              value={profile.full_name ?? ""}
              onChange={(e) => onChange({ ...profile, full_name: e.target.value })}
            />
          </label>
          <label className={styles.label}>
            Role
            <select
              className={styles.select}
              value={profile.role ?? "student"}
              onChange={(e) => onChange({ ...profile, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="recruiter">Recruiter</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className={styles.label}>
            Location
            <input
              className={styles.input}
              type="text"
              value={profile.location ?? ""}
              onChange={(e) => onChange({ ...profile, location: e.target.value })}
            />
          </label>
          <label className={styles.label}>
            Industry
            <select
              className={styles.select}
              value={profile.industry_category ?? "software"}
              onChange={(e) => onChange({ ...profile, industry_category: e.target.value })}
            >
              <option value="software">Software</option>
              <option value="data">Data</option>
              <option value="design">Design</option>
              <option value="marketing">Marketing</option>
              <option value="operations">Operations</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label className={styles.label}>
            Graduation title
            <input
              className={styles.input}
              type="text"
              value={profile.graduation_title ?? ""}
              onChange={(e) => onChange({ ...profile, graduation_title: e.target.value })}
            />
          </label>
          <label className={styles.label}>
            Graduation year
            <input
              className={styles.input}
              type="number"
              min="2000"
              max="2100"
              value={profile.graduation_year ?? ""}
              onChange={(e) =>
                onChange({
                  ...profile,
                  graduation_year: e.target.value ? Number(e.target.value) : null,
                })
              }
            />
          </label>
        </div>
        {profile.role === "student" && (
          <label className={styles.label}>
            Field of study
            <input
              className={styles.input}
              type="text"
              value={profile.studied_role ?? ""}
              onChange={(e) => onChange({ ...profile, studied_role: e.target.value })}
            />
          </label>
        )}
        {profile.role === "recruiter" && (
          <label className={styles.label}>
            Occupation
            <input
              className={styles.input}
              type="text"
              value={profile.occupation_role ?? ""}
              onChange={(e) => onChange({ ...profile, occupation_role: e.target.value })}
            />
          </label>
        )}
        <label className={styles.label}>
          Primary resume
          <select
            className={styles.select}
            value={profile.primary_resume_id ?? ""}
            onChange={(e) => onChange({ ...profile, primary_resume_id: e.target.value || null })}
          >
            <option value="">No primary resume</option>
            {resumes.map((cv) => (
              <option key={cv.id} value={cv.id}>
                {cv.title}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.actions}>
          <button className={styles.primary} type="button" onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
        {status && <div className={styles.status}>{status}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </section>
  );
};

export default ProfileForm;
