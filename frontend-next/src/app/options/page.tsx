"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import styles from "./OptionsPage.module.css";

type Profile = {
  full_name: string | null;
  role: string | null;
  email: string | null;
  location: string | null;
  graduation_title: string | null;
  graduation_year: number | null;
  studied_role: string | null;
  occupation_role: string | null;
  industry_category: string | null;
};

type Tab = "profile" | "security";

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
};

export default function OptionsPage() {
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
            "full_name,role,email,location,graduation_title,graduation_year,studied_role,occupation_role,industry_category"
          )
          .eq("user_id", sessionData.session.user.id)
          .single();
        if (profileErr) throw profileErr;
        setProfile((prev) => ({ ...prev, ...profileData }));
        setPendingEmail(profileData?.email ?? sessionData.session.user.email ?? "");
      } catch (err: any) {
        setError(err?.message || "Failed to load options.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const updateProfile = async () => {
    setError("");
    setStatus("");
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        router.replace("/login?reason=login_required");
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
      if (!email) throw new Error("Missing current email.");
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

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <p className={styles.hint}>Loading options...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.title}>Options</h1>
          <p className={styles.subtitle}>Manage your profile, email, and security settings.</p>
        </header>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "profile" ? styles.tabActive : ""}`}
            type="button"
            onClick={() => setTab("profile")}
          >
            Profile
          </button>
          <button
            className={`${styles.tab} ${tab === "security" ? styles.tabActive : ""}`}
            type="button"
            onClick={() => setTab("security")}
          >
            Security
          </button>
        </div>

        {tab === "profile" && (
          <section className={styles.card}>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <div className={styles.grid}>
                <label className={styles.label}>
                  Full name
                  <input
                    className={styles.input}
                    type="text"
                    value={profile.full_name ?? ""}
                    onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))}
                  />
                </label>
                <label className={styles.label}>
                  Role
                  <select
                    className={styles.select}
                    value={profile.role ?? "student"}
                    onChange={(e) => setProfile((prev) => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="student">Student</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className={styles.label}>
                  Location
                  <input
                    className={styles.input}
                    type="text"
                    value={profile.location ?? ""}
                    onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                  />
                </label>
                <label className={styles.label}>
                  Industry
                  <select
                    className={styles.select}
                    value={profile.industry_category ?? "software"}
                    onChange={(e) => setProfile((prev) => ({ ...prev, industry_category: e.target.value }))}
                  >
                    <option value="software">Software</option>
                    <option value="data">Data</option>
                    <option value="design">Design</option>
                    <option value="marketing">Marketing</option>
                    <option value="operations">Operations</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label className={styles.label}>
                  Graduation title
                  <input
                    className={styles.input}
                    type="text"
                    value={profile.graduation_title ?? ""}
                    onChange={(e) => setProfile((prev) => ({ ...prev, graduation_title: e.target.value }))}
                  />
                </label>
                <label className={styles.label}>
                  Graduation year
                  <input
                    className={styles.input}
                    type="number"
                    min="2000"
                    max="2100"
                    value={profile.graduation_year ?? ""}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        graduation_year: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                  />
                </label>
              </div>
              {profile.role === "student" && (
                <label className={styles.label}>
                  Field of study
                  <input
                    className={styles.input}
                    type="text"
                    value={profile.studied_role ?? ""}
                    onChange={(e) => setProfile((prev) => ({ ...prev, studied_role: e.target.value }))}
                  />
                </label>
              )}
              {profile.role === "recruiter" && (
                <label className={styles.label}>
                  Occupation
                  <input
                    className={styles.input}
                    type="text"
                    value={profile.occupation_role ?? ""}
                    onChange={(e) => setProfile((prev) => ({ ...prev, occupation_role: e.target.value }))}
                  />
                </label>
              )}
              <div className={styles.actions}>
                <button className={styles.primary} type="button" onClick={updateProfile} disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
              {status && <div className={styles.status}>{status}</div>}
              {error && <div className={styles.error}>{error}</div>}
            </form>
          </section>
        )}

        {tab === "security" && (
          <section className={styles.card}>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <label className={styles.label}>
                Email
                <input
                  className={styles.input}
                  type="email"
                  value={pendingEmail}
                  onChange={(e) => setPendingEmail(e.target.value)}
                />
              </label>
              <button className={styles.primary} type="button" onClick={handleEmailUpdate} disabled={saving}>
                Send confirmation email
              </button>
              <p className={styles.hint}>
                Changing email sends a confirmation link. The new email is active after confirmation.
              </p>
              <div className={styles.grid}>
                <label className={styles.label}>
                  Current password
                  <input
                    className={styles.input}
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </label>
                <label className={styles.label}>
                  New password
                  <input
                    className={styles.input}
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </label>
                <label className={styles.label}>
                  Confirm new password
                  <input
                    className={styles.input}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </label>
              </div>
              <div className={styles.actions}>
                <button className={styles.primary} type="button" onClick={handlePasswordChange} disabled={saving}>
                  Update password
                </button>
              </div>
              {status && <div className={styles.status}>{status}</div>}
              {error && <div className={styles.error}>{error}</div>}
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
