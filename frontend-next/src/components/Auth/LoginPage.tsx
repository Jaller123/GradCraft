"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import styles from "../styles/LoginPage.module.css";

type Mode = "signin" | "signup";
type AccountType = "student" | "recruiter" | "other";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("signin");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user.email ?? null);
      setStatus(event === "SIGNED_OUT" ? "Signed out" : "");
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (mode === "signin") {
      setAccountType(null);
      setShowRoleModal(false);
    }
  }, [mode]);

  const signUpWithRole = async (selectedRole: AccountType) => {
    const { error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { account_type: selectedRole } },
    });
    if (signUpErr) throw signUpErr;
    setStatus("Check your email to confirm and sign in.");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
        setStatus("Signed in");
      } else {
        if (!accountType) {
          setShowRoleModal(true);
          setLoading(false);
          return;
        }
        await signUpWithRole(accountType);
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = async (selectedRole: AccountType) => {
    setAccountType(selectedRole);
    setShowRoleModal(false);
    setError("");
    setStatus("");
    setLoading(true);
    try {
      await signUpWithRole(selectedRole);
    } catch (err: any) {
      setError(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setError("");
    const { error: signOutErr } = await supabase.auth.signOut();
    if (signOutErr) setError(signOutErr.message);
    else setStatus("Signed out");
    setLoading(false);
  };

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign {mode === "signin" ? "in" : "up"} to GradCraft</h1>
        <p className={styles.subtitle}>
          Use your email and password. We’ll keep your CVs tied to your account.
        </p>
        <form className={styles.form} onSubmit={handleAuth}>
          <label className={styles.label}>
            Email
            <input
              className={styles.input}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className={styles.label}>
            Password
            <input
              className={styles.input}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? "Working..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        {showRoleModal && (
          <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="role-title">
            <div className={styles.modal}>
              <h2 className={styles.modalTitle} id="role-title">
                Choose your account type
              </h2>
              <p className={styles.modalBody}>
                This helps us show the right tools and matches for your goals.
              </p>
              <div className={styles.roleGrid}>
                <button
                  className={styles.roleBtn}
                  type="button"
                  onClick={() => handleRoleSelect("student")}
                  disabled={loading}
                >
                  Student
                </button>
                <button
                  className={styles.roleBtn}
                  type="button"
                  onClick={() => handleRoleSelect("recruiter")}
                  disabled={loading}
                >
                  Recruiter
                </button>
                <button
                  className={styles.roleBtn}
                  type="button"
                  onClick={() => handleRoleSelect("other")}
                  disabled={loading}
                >
                  Other
                </button>
              </div>
              <button className={styles.linkBtn} type="button" onClick={() => setShowRoleModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className={styles.switchRow}>
          <span>{mode === "signin" ? "Need an account?" : "Already have an account?"}</span>
          <button
            className={styles.linkBtn}
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </div>

        {userEmail && (
          <div className={styles.sessionRow}>
            Signed in as <strong>{userEmail}</strong>
            <button className={styles.linkBtn} onClick={handleSignOut} disabled={loading}>
              Sign out
            </button>
          </div>
        )}

        {status && <div className={styles.status}>{status}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </main>
  );
};

export default LoginPage;

