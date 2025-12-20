"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import styles from "../styles/LoginPage.module.css";

type Mode = "signin" | "signup";
type AccountType = "student" | "recruiter" | "other";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<Mode>("signin");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [verifyNotice, setVerifyNotice] = useState<string>("");
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
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const type = params.get("type");
    const accessToken = params.get("access_token");
    if (type === "signup" && accessToken) {
      setVerifyNotice("Email verified. You're signed in.");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (mode === "signin") {
      setAccountType(null);
      setShowRoleModal(false);
      setFullName("");
    }
  }, [mode]);

  const signUpWithRole = async (selectedRole: AccountType, name: string) => {
    const trimmedName = name.trim();
    const { error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { account_type: selectedRole, full_name: trimmedName } },
    });
    if (signUpErr) throw signUpErr;
    setStatus("Check your email to confirm and sign in.");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setVerifyNotice("");
    setLoading(true);
    try {
      if (mode === "signin") {
        const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signInErr) throw signInErr;
        const emailConfirmedAt =
          data.user?.email_confirmed_at ?? (data.user as { confirmed_at?: string } | null)?.confirmed_at;
        if (!emailConfirmedAt) {
          await supabase.auth.signOut();
          setError("Please confirm your email before signing in.");
          setLoading(false);
          return;
        }
        setStatus("Signed in");
      } else {
        if (!fullName.trim()) {
          setError("Please enter your full name.");
          setLoading(false);
          return;
        }
        if (!accountType) {
          setShowRoleModal(true);
          setLoading(false);
          return;
        }
        await signUpWithRole(accountType, fullName);
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
      await signUpWithRole(selectedRole, fullName);
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
          {mode === "signup" && (
            <label className={styles.label}>
              Full name
              <input
                className={styles.input}
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>
          )}
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

        {verifyNotice && <div className={styles.notice}>{verifyNotice}</div>}
        {status && <div className={styles.status}>{status}</div>}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </main>
  );
};

export default LoginPage;

