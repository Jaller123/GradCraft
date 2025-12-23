"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import styles from "./PostRole.module.css";

type FormState = {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  industryCategory: string;
  description: string;
  requirements: string;
  applyUrl: string;
  tags: string;
  expiresAt: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  company: "",
  location: "",
  employmentType: "full_time",
  industryCategory: "software",
  description: "",
  requirements: "",
  applyUrl: "",
  tags: "",
  expiresAt: "",
};

export default function PostRolePage() {
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

  const updateField = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const updateSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, employmentType: e.target.value }));
  };

  const updateIndustry = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, industryCategory: e.target.value }));
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
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.grid}>
                <label className={styles.label}>
                  Role title
                  <input
                    className={styles.input}
                    type="text"
                    required
                    value={form.title}
                    onChange={updateField("title")}
                  />
                </label>
                <label className={styles.label}>
                  Company
                  <input
                    className={styles.input}
                    type="text"
                    required
                    value={form.company}
                    onChange={updateField("company")}
                  />
                </label>
              </div>
              <label className={styles.label}>
                Location
                <input
                  className={styles.input}
                  type="text"
                  placeholder="City or Remote"
                  value={form.location}
                  onChange={updateField("location")}
                />
              </label>
              <label className={styles.label}>
                Employment type
                <select className={styles.input} value={form.employmentType} onChange={updateSelect}>
                  <option value="full_time">Full time</option>
                  <option value="internship">Internship</option>
                  <option value="part_time">Part time</option>
                  <option value="contract">Contract</option>
                  <option value="graduate_program">Graduate program</option>
                </select>
              </label>
              <label className={styles.label}>
                Industry category
                <select className={styles.input} value={form.industryCategory} onChange={updateIndustry}>
                  <option value="software">Software</option>
                  <option value="data">Data</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="operations">Operations</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className={styles.label}>
                Role overview
                <textarea
                  className={styles.textarea}
                  value={form.description}
                  onChange={updateField("description")}
                />
              </label>
              <label className={styles.label}>
                Requirements
                <textarea
                  className={styles.textarea}
                  value={form.requirements}
                  onChange={updateField("requirements")}
                />
              </label>
              <label className={styles.label}>
                Expires on
                <input
                  className={styles.input}
                  type="date"
                  value={form.expiresAt}
                  onChange={updateField("expiresAt")}
                />
              </label>
              <label className={styles.label}>
                Apply URL
                <input
                  className={styles.input}
                  type="url"
                  placeholder="https://"
                  value={form.applyUrl}
                  onChange={updateField("applyUrl")}
                />
              </label>
              <label className={styles.label}>
                Tags
                <input
                  className={styles.input}
                  type="text"
                  placeholder="React, SQL, Analytics"
                  value={form.tags}
                  onChange={updateField("tags")}
                />
              </label>
              <div className={styles.actions}>
                <button className={styles.primary} type="submit" disabled={saving}>
                  {saving ? "Posting..." : "Publish role"}
                </button>
                <Link className={styles.ghost} href="/talenthub">
                  Back to Talent Hub
                </Link>
              </div>
              <p className={styles.hint}>Fields map directly to the `job_posts` table.</p>
              {notice && <div className={styles.notice}>{notice}</div>}
              {error && <div className={styles.error}>{error}</div>}
            </form>
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
}
