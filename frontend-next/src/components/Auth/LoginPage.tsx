"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import styles from "../styles/LoginPage.module.css";

type Mode = "signin" | "signup";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<Mode>("signin");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
        const { error: signUpErr } = await supabase.auth.signUp({ email, password });
        if (signUpErr) throw signUpErr;
        setStatus("Check your email to confirm and sign in.");
      }
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

