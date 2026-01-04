"use client";

import React from "react";
import Link from "next/link";
import styles from "../PostRole.module.css";
import type { FormState } from "../types";

type Props = {
  form: FormState;
  saving: boolean;
  notice: string;
  error: string;
  onFieldChange: (field: keyof FormState, value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
};

const PostRoleForm: React.FC<Props> = ({ form, saving, notice, error, onFieldChange, onSubmit }) => {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <div className={styles.grid}>
        <label className={styles.label}>
          Role title
          <input
            className={styles.input}
            type="text"
            required
            value={form.title}
            onChange={(e) => onFieldChange("title", e.target.value)}
          />
        </label>
        <label className={styles.label}>
          Company
          <input
            className={styles.input}
            type="text"
            required
            value={form.company}
            onChange={(e) => onFieldChange("company", e.target.value)}
          />
        </label>
      </div>
      <label className={styles.label}>
        Location
        <input
          className={styles.input}
          type="text"
          placeholder="City or Remote"
          value={form.location}
          onChange={(e) => onFieldChange("location", e.target.value)}
        />
      </label>
      <label className={styles.label}>
        Employment type
        <select
          className={styles.input}
          value={form.employmentType}
          onChange={(e) => onFieldChange("employmentType", e.target.value)}
        >
          <option value="full_time">Full time</option>
          <option value="internship">Internship</option>
          <option value="part_time">Part time</option>
          <option value="contract">Contract</option>
          <option value="graduate_program">Graduate program</option>
        </select>
      </label>
      <label className={styles.label}>
        Industry category
        <select
          className={styles.input}
          value={form.industryCategory}
          onChange={(e) => onFieldChange("industryCategory", e.target.value)}
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
        Role overview
        <textarea
          className={styles.textarea}
          value={form.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
        />
      </label>
      <label className={styles.label}>
        Requirements
        <textarea
          className={styles.textarea}
          value={form.requirements}
          onChange={(e) => onFieldChange("requirements", e.target.value)}
        />
      </label>
      <label className={styles.label}>
        Expires on
        <input
          className={styles.input}
          type="date"
          value={form.expiresAt}
          onChange={(e) => onFieldChange("expiresAt", e.target.value)}
        />
      </label>
      <label className={styles.label}>
        Apply URL
        <input
          className={styles.input}
          type="url"
          placeholder="https://"
          value={form.applyUrl}
          onChange={(e) => onFieldChange("applyUrl", e.target.value)}
        />
      </label>
      <label className={styles.label}>
        Tags
        <input
          className={styles.input}
          type="text"
          placeholder="React, SQL, Analytics"
          value={form.tags}
          onChange={(e) => onFieldChange("tags", e.target.value)}
        />
      </label>
      <div className={styles.actions}>
        <button className={styles.primary} type="submit" disabled={saving}>
          {saving ? "Posting..." : "Publish role"}
        </button>
        <Link className={styles.ghost} href="/talenthub">
          Back to Talent Hub
        </Link>
      </div>
      <p className={styles.hint}>Fields map directly to the `job_posts` table.</p>
      {notice && <div className={styles.notice}>{notice}</div>}
      {error && <div className={styles.error}>{error}</div>}
    </form>
  );
};

export default PostRoleForm;
