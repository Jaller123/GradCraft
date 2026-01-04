"use client";

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import styles from "./LoginPage.module.css";
import type { AccountType, Mode, RoleStep } from "./types";
import AuthForm from "./components/AuthForm";
import RoleModal from "./components/RoleModal";
import AuthFooter from "./components/AuthFooter";

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

  const handleForgotPassword = async () => {
    setError("");
    setStatus("");
    if (!email.trim()) {
      setError("Enter your email to reset your password.");
      return;
    }
    setLoading(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (resetErr) throw resetErr;
      setStatus("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      setError(err?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
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
        <AuthForm
          mode={mode}
          email={email}
          password={password}
          fullName={fullName}
          loading={loading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onFullNameChange={setFullName}
          onSubmit={handleAuth}
          onForgotPassword={handleForgotPassword}
        />

        <RoleModal
          open={showRoleModal}
          roleStep={roleStep}
          accountType={accountType}
          loading={loading}
          industryCategory={industryCategory}
          studiedRole={studiedRole}
          occupationRole={occupationRole}
          graduationYear={graduationYear}
          onClose={() => setShowRoleModal(false)}
          onSelectRole={handleRoleSelect}
          onBack={() => setRoleStep("select")}
          onConfirm={handleRoleConfirm}
          onIndustryChange={setIndustryCategory}
          onStudiedRoleChange={setStudiedRole}
          onOccupationRoleChange={setOccupationRole}
          onGraduationYearChange={setGraduationYear}
        />

        <AuthFooter
          mode={mode}
          userEmail={userEmail}
          loading={loading}
          status={status}
          error={error}
          onToggleMode={() => setMode(mode === "signin" ? "signup" : "signin")}
          onSignOut={handleSignOut}
        />
      </div>
    </main>
  );
};

export default LoginPage;

