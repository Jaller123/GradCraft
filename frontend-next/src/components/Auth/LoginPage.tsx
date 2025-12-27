"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import styles from "../styles/LoginPage.module.css";

type Mode = "signin" | "signup";
type AccountType = "student" | "recruiter" | "other";
type RoleStep = "select" | "details";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [mode, setMode] = useState<Mode>("signin");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [toast, setToast] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleStep, setRoleStep] = useState<RoleStep>("select");
  const [studiedRole, setStudiedRole] = useState("");
  const [occupationRole, setOccupationRole] = useState("");
  const [industryCategory, setIndustryCategory] = useState("software");
  const [graduationYear, setGraduationYear] = useState("");
  const confirmRedirectRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? null);
      if (data.session && confirmRedirectRef.current) {
        setToast("Email verified. You're signed in.");
        window.history.replaceState(null, "", window.location.pathname);
        confirmRedirectRef.current = false;
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUserEmail(session?.user.email ?? null);
      setStatus(event === "SIGNED_OUT" ? "Signed out" : "");
      if (event === "SIGNED_IN" && confirmRedirectRef.current) {
        setToast("Email verified. You're signed in.");
        window.history.replaceState(null, "", window.location.pathname);
        confirmRedirectRef.current = false;
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("reason");
    if (reason === "login_required") {
      setToast("You have to be logged in.");
    }
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const type = params.get("type") ?? hashParams.get("type");
    const tokenHash = params.get("token_hash") ?? hashParams.get("token_hash");
    const accessToken = params.get("access_token") ?? hashParams.get("access_token");
    const code = params.get("code") ?? hashParams.get("code");
    confirmRedirectRef.current = type === "signup" || !!tokenHash || !!accessToken || !!code;
  }, []);

  useEffect(() => {
    if (mode === "signin") {
      setAccountType(null);
      setShowRoleModal(false);
      setFullName("");
      setStudiedRole("");
      setOccupationRole("");
      setIndustryCategory("software");
      setGraduationYear("");
      setRoleStep("select");
    }
  }, [mode]);

  const signUpWithRole = async (
    selectedRole: AccountType,
    name: string,
    major: string,
    occupation: string,
    industry: string,
    gradYear: string
  ) => {
    const trimmedName = name.trim();
    const { error: signUpErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          account_type: selectedRole,
          full_name: trimmedName,
          studied_role: major.trim(),
          occupation_role: occupation.trim(),
          industry_category: industry,
          graduation_year: gradYear ? Number(gradYear) : null,
        },
      },
    });
    if (signUpErr) throw signUpErr;
    setStatus("Check your email to confirm and sign in.");
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setToast("");
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
          setRoleStep("select");
          setLoading(false);
          return;
        }
        if (accountType === "student" && !studiedRole.trim()) {
          setShowRoleModal(true);
          setRoleStep("details");
          setLoading(false);
          return;
        }
        if (accountType === "student" && !graduationYear) {
          setShowRoleModal(true);
          setRoleStep("details");
          setLoading(false);
          return;
        }
        if (accountType === "recruiter" && !occupationRole.trim()) {
          setShowRoleModal(true);
          setRoleStep("details");
          setLoading(false);
          return;
        }
        await signUpWithRole(accountType, fullName, studiedRole, occupationRole, industryCategory, graduationYear);
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSelect = (selectedRole: AccountType) => {
    setAccountType(selectedRole);
    setRoleStep("details");
  };

  const handleRoleConfirm = async () => {
    if (!accountType) return;
    if (accountType === "student" && !studiedRole.trim()) {
      setError("Please add your field of study.");
      return;
    }
    if (accountType === "student" && !graduationYear) {
      setError("Please add your graduation year.");
      return;
    }
    if (accountType === "recruiter" && !occupationRole.trim()) {
      setError("Please add your occupation.");
      return;
    }
    setShowRoleModal(false);
    setError("");
    setStatus("");
    setLoading(true);
    try {
      await signUpWithRole(accountType, fullName, studiedRole, occupationRole, industryCategory, graduationYear);
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

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <main className={styles.wrap}>
      {toast && <div className={styles.toast}>{toast}</div>}
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
              {roleStep === "select" ? (
                <>
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
                    <select
                      className={styles.input}
                      value={industryCategory}
                      onChange={(e) => setIndustryCategory(e.target.value)}
                    >
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
                          onChange={(e) => setStudiedRole(e.target.value)}
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
                          onChange={(e) => setGraduationYear(e.target.value)}
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
                        onChange={(e) => setOccupationRole(e.target.value)}
                      />
                    </label>
                  )}
                  <div className={styles.modalActions}>
                    <button className={styles.linkBtn} type="button" onClick={() => setRoleStep("select")}>
                      Back
                    </button>
                    <button className={styles.roleBtn} type="button" onClick={handleRoleConfirm} disabled={loading}>
                      Continue
                    </button>
                  </div>
                </>
              )}
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

