"use client";

import { supabase } from "../../lib/supabaseClient";
import type { AccountType, Mode } from "./types";

type Params = {
  email: string;
  password: string;
  fullName: string;
  mode: Mode;
  accountType: AccountType | null;
  studiedRole: string;
  occupationRole: string;
  industryCategory: string;
  graduationYear: string;
  setError: (value: string) => void;
  setStatus: (value: string) => void;
  setToast: (value: string) => void;
  setLoading: (value: boolean) => void;
  setAccountType: (value: AccountType | null) => void;
  setShowRoleModal: (value: boolean) => void;
  setRoleStep: (value: "select" | "details") => void;
};

export const useAuthActions = ({
  email,
  password,
  fullName,
  mode,
  accountType,
  studiedRole,
  occupationRole,
  industryCategory,
  graduationYear,
  setError,
  setStatus,
  setToast,
  setLoading,
  setAccountType,
  setShowRoleModal,
  setRoleStep,
}: Params) => {
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

  return {
    handleAuth,
    handleRoleSelect,
    handleRoleConfirm,
    handleSignOut,
    handleForgotPassword,
  };
};
