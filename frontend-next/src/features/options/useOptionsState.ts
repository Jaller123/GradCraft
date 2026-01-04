"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { listCvs } from "../cv/cvStore";
import type { Profile, Tab } from "./types";
import { useProfileActions } from "./useProfileActions";
import { useSecurityActions } from "./useSecurityActions";

const EMPTY_PROFILE: Profile = {
  full_name: "",
  role: "student",
  email: "",
  location: "",
  graduation_title: "",
  graduation_year: null,
  studied_role: "",
  occupation_role: "",
  industry_category: "software",
  primary_resume_id: null,
};

export const useOptionsState = () => {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [resumes, setResumes] = useState<{ id: string; title: string }[]>([]);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) {
          router.replace("/login?reason=login_required");
          return;
        }
        const { data: profileData, error: profileErr } = await supabase
          .from("profiles")
          .select(
            "full_name,role,email,location,graduation_title,graduation_year,studied_role,occupation_role,industry_category,primary_resume_id"
          )
          .eq("user_id", sessionData.session.user.id)
          .single();
        if (profileErr) throw profileErr;
        setProfile((prev) => ({ ...prev, ...profileData }));
        setPendingEmail(profileData?.email ?? sessionData.session.user.email ?? "");
        const list = await listCvs();
        setResumes(list.map((cv) => ({ id: cv.id, title: cv.title })));
      } catch (err: any) {
        setError(err?.message || "Failed to load options.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const authMissing = () => {
    router.replace("/login?reason=login_required");
  };

  const { updateProfile } = useProfileActions({
    profile,
    setError,
    setStatus,
    setSaving,
    onAuthMissing: authMissing,
  });

  const { handleEmailUpdate, handlePasswordChange, handleDeleteAccount } = useSecurityActions({
    pendingEmail,
    currentPassword,
    newPassword,
    confirmPassword,
    deletePassword,
    setError,
    setStatus,
    setSaving,
    setDeletingAccount,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setDeletePassword,
    onAuthMissing: authMissing,
  });

  return {
    tab,
    setTab,
    profile,
    setProfile,
    loading,
    saving,
    error,
    status,
    currentPassword,
    newPassword,
    confirmPassword,
    pendingEmail,
    resumes,
    deletePassword,
    deletingAccount,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    setPendingEmail,
    setDeletePassword,
    updateProfile,
    handleEmailUpdate,
    handlePasswordChange,
    handleDeleteAccount,
  };
};
