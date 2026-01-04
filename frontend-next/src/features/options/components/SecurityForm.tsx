"use client";

import React from "react";
import styles from "../OptionsPage.module.css";

type Props = {
  pendingEmail: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  deletePassword: string;
  saving: boolean;
  deletingAccount: boolean;
  status: string;
  error: string;
  onPendingEmailChange: (value: string) => void;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onDeletePasswordChange: (value: string) => void;
  onEmailUpdate: () => void;
  onPasswordChange: () => void;
  onDeleteAccount: () => void;
};

const SecurityForm: React.FC<Props> = ({
  pendingEmail,
  currentPassword,
  newPassword,
  confirmPassword,
  deletePassword,
  saving,
  deletingAccount,
  status,
  error,
  onPendingEmailChange,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onDeletePasswordChange,
  onEmailUpdate,
  onPasswordChange,
  onDeleteAccount,
}) => {
  return (
    <section className={styles.card}>
      <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            value={pendingEmail}
            onChange={(e) => onPendingEmailChange(e.target.value)}
          />
        </label>
        <button className={styles.primary} type="button" onClick={onEmailUpdate} disabled={saving}>
          Send confirmation email
        </button>
        <p className={styles.hint}>
          Changing email sends a confirmation link. The new email is active after confirmation.
        </p>
        <div className={styles.grid}>
          <label className={styles.label}>
            Current password
            <input
              className={styles.input}
              type="password"
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
            />
          </label>
          <label className={styles.label}>
            New password
            <input
              className={styles.input}
              type="password"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
            />
          </label>
          <label className={styles.label}>
            Confirm new password
            <input
              className={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
            />
          </label>
        </div>
        <div className={styles.actions}>
          <button className={styles.primary} type="button" onClick={onPasswordChange} disabled={saving}>
            Update password
          </button>
        </div>
        <div className={styles.divider} />
        <div className={styles.dangerBlock}>
          <h3 className={styles.dangerTitle}>Delete account</h3>
          <p className={styles.hint}>
            This permanently removes your account, resumes, and posted roles. This action cannot be undone.
          </p>
          <label className={styles.label}>
            Confirm password
            <input
              className={styles.input}
              type="password"
              value={deletePassword}
              onChange={(e) => onDeletePasswordChange(e.target.value)}
            />
          </label>
          <div className={styles.actions}>
            <button className={styles.danger} type="button" onClick={onDeleteAccount} disabled={deletingAccount}>
              {deletingAccount ? "Deleting..." : "Delete account"}
            </button>
          </div>
        </div>
        {status && <div className={styles.status}>{status}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </form>
    </section>
  );
};

export default SecurityForm;
