"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import styles from "./PostRole.module.css";
import { EMPTY_FORM, type FormState } from "./types";
import PostRoleForm from "./components/PostRoleForm";

const PostRolePage: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error: userErr }) => {
      if (userErr) {
        setError(userErr.message);
      } else {
        setUserId(data.user?.id ?? null);
      }
      setLoadingUser(false);
    });
  }, []);

  const handleFieldChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!userId) {
      setError("Please sign in before posting a role.");
      return;
    }
    if (!form.title.trim() || !form.company.trim()) {
      setError("Title and company are required.");
      return;
    }
    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      const payload = {
        owner_id: userId,
        title: form.title.trim(),
        company: form.company.trim(),
        location: form.location.trim() || null,
        employment_type: form.employmentType,
        industry_category: form.industryCategory,
        description: form.description.trim() || null,
        requirements: form.requirements.trim() || null,
        apply_url: form.applyUrl.trim() || null,
        tags: tags.length ? tags : null,
        status: "published",
        expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      };
      const { data, error: insertErr } = await supabase.from("job_posts").insert(payload).select("id").single();
      if (insertErr) throw insertErr;
      setNotice("Role posted. Redirecting to the live listing...");
      router.push(`/talenthub/${data.id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to post role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.title}>Post a role</h1>
          <p className={styles.subtitle}>
            Share the essentials so new grads can find you fast. You can edit and add details later.
          </p>
        </header>

        <section className={styles.card}>
          {loadingUser ? (
            <p className={styles.hint}>Loading your account...</p>
          ) : (
            <PostRoleForm
              form={form}
              saving={saving}
              notice={notice}
              error={error}
              onFieldChange={handleFieldChange}
              onSubmit={handleSubmit}
            />
          )}
          {!loadingUser && !userId && (
            <div className={styles.notice}>
              You are not signed in. <Link href="/login">Sign in</Link> to post a role.
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default PostRolePage;
