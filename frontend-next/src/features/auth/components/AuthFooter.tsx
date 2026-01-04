"use client";

import React from "react";
import styles from "../LoginPage.module.css";
import type { Mode } from "../types";

type Props = {
  mode: Mode;
  userEmail: string | null;
  loading: boolean;
  status: string;
  error: string;
  onToggleMode: () => void;
  onSignOut: () => void;
};

const AuthFooter: React.FC<Props> = ({ mode, userEmail, loading, status, error, onToggleMode, onSignOut }) => {
  return (
    <>
      <div className={styles.switchRow}>
        <span>{mode === "signin" ? "Need an account?" : "Already have an account?"}</span>
        <button className={styles.linkBtn} type="button" onClick={onToggleMode}>
          {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </div>

      {userEmail && (
        <div className={styles.sessionRow}>
          Signed in as <strong>{userEmail}</strong>
          <button className={styles.linkBtn} onClick={onSignOut} disabled={loading}>
            Sign out
          </button>
        </div>
      )}

      {status && <div className={styles.status}>{status}</div>}
      {error && <div className={styles.error}>{error}</div>}
    </>
  );
};

export default AuthFooter;
