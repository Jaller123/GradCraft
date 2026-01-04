"use client";

import { supabase } from "../../lib/supabaseClient";
import { deleteAccount } from "../../shared/api";

type Params = {
  pendingEmail: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  deletePassword: string;
  setError: (value: string) => void;
  setStatus: (value: string) => void;
  setSaving: (value: boolean) => void;
  setDeletingAccount: (value: boolean) => void;
  setCurrentPassword: (value: string) => void;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setDeletePassword: (value: string) => void;
  onAuthMissing: () => void;
};

export const useSecurityActions = ({
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
  onAuthMissing,
}: Params) => {
  const handleEmailUpdate = async () => {
    setError("");
    setStatus("");
    if (!pendingEmail.trim()) {
      setError("Enter a new email address.");
      return;
    }
    setSaving(true);
    try {
      const { error: updateErr } = await supabase.auth.updateUser({ email: pendingEmail.trim() });
      if (updateErr) throw updateErr;
      setStatus("Confirmation sent. Check your email to verify the new address.");
    } catch (err: any) {
      setError(err?.message || "Failed to update email.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setError("");
    setStatus("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Fill in current and new passwords.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData.session?.user?.email;
      if (!email) {
        onAuthMissing();
        return;
      }
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (signInErr) throw signInErr;
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw updateErr;
      setStatus("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err?.message || "Failed to update password.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setError("");
    setStatus("");
    if (!deletePassword) {
      setError("Enter your password to confirm deletion.");
      return;
    }
    setDeletingAccount(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const email = sessionData.session?.user?.email;
      if (!email) {
        onAuthMissing();
        return;
      }
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: deletePassword,
      });
      if (signInErr) throw signInErr;
      await deleteAccount();
      await supabase.auth.signOut();
      window.location.assign("/login?reason=account_deleted");
    } catch (err: any) {
      setError(err?.message || "Failed to delete account.");
    } finally {
      setDeletingAccount(false);
      setDeletePassword("");
    }
  };

  return { handleEmailUpdate, handlePasswordChange, handleDeleteAccount };
};
