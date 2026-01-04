"use client";

import React from "react";
import styles from "../LoginPage.module.css";
import type { Mode } from "../types";

type Props = {
  mode: Mode;
  email: string;
  password: string;
  fullName: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
};

const AuthForm: React.FC<Props> = ({
  mode,
  email,
  password,
  fullName,
  loading,
  onEmailChange,
  onPasswordChange,
  onFullNameChange,
  onSubmit,
  onForgotPassword,
}) => {
  return (
    <form className={styles.form} onSubmit={onSubmit} autoComplete="off">
      {mode === "signup" && (
        <label className={styles.label}>
          Full name
          <input
            className={styles.input}
            type="text"
            required
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
          />
        </label>
      )}
      <label className={styles.label}>
        Email
        <input
          className={styles.input}
          type="email"
          autoComplete="off"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />
      </label>
      <label className={styles.label}>
        Password
        <input
          className={styles.input}
          type="password"
          required
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
        />
      </label>
      <button className={styles.submit} type="submit" disabled={loading}>
        {loading ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
      </button>
      {mode === "signin" && (
        <button className={styles.linkBtn} type="button" onClick={onForgotPassword} disabled={loading}>
          Forgot password?
        </button>
      )}
    </form>
  );
};

export default AuthForm;
