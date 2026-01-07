"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import ResumePreview from "../../features/cv/components/ResumePreview";
import type { CvData } from "../../features/cv/types";
import styles from "./ProfilePage.module.css";

type Profile = {
  full_name: string | null;
  email: string | null;
  role: string | null;
  location: string | null;
  graduation_title: string | null;
  graduation_year: number | null;
  studied_role: string | null;
  occupation_role: string | null;
  industry_category: string | null;
  primary_resume_id?: string | null;
};

type ResumePreview = {
  id: string;
  title: string;
  data: CvData;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resume, setResume] = useState<ResumePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) {
          router.replace("/login?reason=login_required");
          return;
        }
        let { data, error: fetchErr }: { data: Profile | null; error: any } = await supabase
          .from("profiles")
          .select(
            "full_name,email,role,location,graduation_title,graduation_year,studied_role,occupation_role,industry_category,primary_resume_id"
          )
          .eq("user_id", sessionData.session.user.id)
          .single();

        if (fetchErr && String(fetchErr.message || "").includes("primary_resume_id")) {
          const fallback = await supabase
            .from("profiles")
            .select("full_name,email,role,location,graduation_title,graduation_year,studied_role,occupation_role,industry_category")
            .eq("user_id", sessionData.session.user.id)
            .single();
          fetchErr = fallback.error ?? null;
          data = fallback.data ? { ...fallback.data, primary_resume_id: null } : null;
        }

        if (fetchErr) throw fetchErr;
        setProfile(data);
        if (data?.primary_resume_id) {
          const { data: resumeData, error: resumeErr } = await supabase
            .from("resumes")
            .select("id,title,data")
            .eq("id", data.primary_resume_id)
            .single();
          if (!resumeErr && resumeData?.data) setResume(resumeData);
        } else {
          setResume(null);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <h1 className={styles.title}>Profile</h1>
          <p className={styles.subtitle}>Your account details used for matching and job ads.</p>
        </section>

        <section className={styles.card}>
          {loading && <p className={styles.notice}>Loading profile...</p>}
          {!loading && error && <p className={styles.notice}>{error}</p>}
          {!loading && !error && profile && (
            <div className={styles.grid}>
              <div className={styles.field}>
                Full name
                <span className={styles.value}>{profile.full_name || "Not set"}</span>
              </div>
              <div className={styles.field}>
                Email
                <span className={styles.value}>{profile.email || "Not set"}</span>
              </div>
              <div className={styles.field}>
                Role
                <span className={styles.value}>{profile.role || "Not set"}</span>
              </div>
              <div className={styles.field}>
                Location
                <span className={styles.value}>{profile.location || "Not set"}</span>
              </div>
              <div className={styles.field}>
                Graduation title
                <span className={styles.value}>{profile.graduation_title || "Not set"}</span>
              </div>
              <div className={styles.field}>
                Graduation year
                <span className={styles.value}>
                  {profile.graduation_year ? profile.graduation_year : "Not set"}
                </span>
              </div>
              {profile.role === "student" && (
                <div className={styles.field}>
                  Studied role
                  <span className={styles.value}>{profile.studied_role || "Not set"}</span>
                </div>
              )}
              {profile.role === "recruiter" && (
                <div className={styles.field}>
                  Occupation
                  <span className={styles.value}>{profile.occupation_role || "Not set"}</span>
                </div>
              )}
              <div className={styles.field}>
                Industry
                <span className={styles.value}>{profile.industry_category || "Not set"}</span>
              </div>
            </div>
          )}
        </section>

        <section className={styles.card}>
          <h2 className={styles.title}>Resume preview</h2>
          {loading && <p className={styles.notice}>Loading resume...</p>}
          {!loading && profile && !profile.primary_resume_id && (
            <p className={styles.notice}>No primary resume selected yet.</p>
          )}
          {resume?.data ? (
            <div className={styles.preview}>
              <div className={styles.previewInner}>
                <ResumePreview cv={resume.data} />
              </div>
            </div>
          ) : resume ? (
            <p className={styles.notice}>Resume data missing.</p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
