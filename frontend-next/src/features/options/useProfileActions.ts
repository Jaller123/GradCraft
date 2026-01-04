"use client";

import { supabase } from "../../lib/supabaseClient";
import type { Profile } from "./types";

type Params = {
  profile: Profile;
  setError: (value: string) => void;
  setStatus: (value: string) => void;
  setSaving: (value: boolean) => void;
  onAuthMissing: () => void;
};

export const useProfileActions = ({ profile, setError, setStatus, setSaving, onAuthMissing }: Params) => {
  const updateProfile = async () => {
    setError("");
    setStatus("");
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        onAuthMissing();
        return;
      }
      const payload = {
        full_name: profile.full_name?.trim() || null,
        role: profile.role || "student",
        email: profile.email?.trim() || null,
        location: profile.location?.trim() || null,
        graduation_title: profile.graduation_title?.trim() || null,
        graduation_year: profile.graduation_year || null,
        studied_role: profile.studied_role?.trim() || null,
        occupation_role: profile.occupation_role?.trim() || null,
        industry_category: profile.industry_category || null,
        primary_resume_id: profile.primary_resume_id || null,
        updated_at: new Date().toISOString(),
      };
      const { error: updateErr } = await supabase
        .from("profiles")
        .update(payload)
        .eq("user_id", sessionData.session.user.id);
      if (updateErr) throw updateErr;
      setStatus("Profile updated.");
    } catch (err: any) {
      setError(err?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return { updateProfile };
};
