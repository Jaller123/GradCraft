"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";
import ResumePreview from "../../../../features/cv/components/ResumePreview";
import type { CvData } from "../../../../features/cv/types";
import styles from "./CandidateDetail.module.css";

type Profile = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  location: string | null;
  graduation_title: string | null;
  graduation_year: number | null;
  studied_role: string | null;
  industry_category: string | null;
  primary_resume_id: string | null;
};

type ResumePreview = {
  id: string;
  title: string;
  data: CvData;
};

type Props = {
  params: { id: string };
};

export default function CandidateDetailPage({ params }: Props) {
  const [authRequired, setAuthRequired] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [resume, setResume] = useState<ResumePreview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) {
          setAuthRequired(true);
          setProfile(null);
          setResume(null);
          return;
        }
        setAuthRequired(false);
        const { data, error: profileErr } = await supabase
          .from("profiles")
          .select(
            "user_id,full_name,email,role,location,graduation_title,graduation_year,studied_role,industry_category,primary_resume_id"
          )
          .eq("user_id", params.id)
          .single();
        if (profileErr) throw profileErr;
        setProfile(data);

        if (data?.primary_resume_id) {
          const { data: resumeData, error: resumeErr } = await supabase
            .from("resumes")
            .select("id,title,data")
            .eq("id", data.primary_resume_id)
            .single();
          if (!resumeErr) {
            setResume(resumeData);
          }
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load candidate profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.card}>
          {loading && <p className={styles.empty}>Loading profile...</p>}
          {!loading && authRequired && (
            <p className={styles.empty}>
              Please <Link href="/login">sign in</Link> to view this candidate profile.
            </p>
          )}
          {!loading && error && <p className={styles.empty}>{error}</p>}
          {!loading && !error && profile && (
            <>
              <h1 className={styles.title}>{profile.full_name || "Student profile"}</h1>
              <p className={styles.meta}>
                {profile.graduation_title || "Graduate"}{" "}
                {profile.graduation_year ? `• Class of ${profile.graduation_year}` : ""}
              </p>
              <div className={styles.grid}>
                <div className={styles.field}>
                  Email
                  <span className={styles.value}>{profile.email || "Not shared"}</span>
                </div>
                <div className={styles.field}>
                  Location
                  <span className={styles.value}>{profile.location || "Not set"}</span>
                </div>
                <div className={styles.field}>
                  Field of study
                  <span className={styles.value}>{profile.studied_role || "Not set"}</span>
                </div>
                <div className={styles.field}>
                  Industry
                  <span className={styles.value}>{profile.industry_category || "Not set"}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={styles.card}>
          <h2 className={styles.title}>Resume preview</h2>
          {!profile && !authRequired && <p className={styles.empty}>No profile loaded.</p>}
          {profile && !profile.primary_resume_id && (
            <p className={styles.empty}>No primary resume selected yet.</p>
          )}
          {resume?.data ? (
            <div className={styles.preview}>
              <ResumePreview cv={resume.data} />
            </div>
          ) : resume ? (
            <p className={styles.empty}>Resume data missing.</p>
          ) : null}
        </div>

        <Link className={styles.link} href="/talenthub/candidates">
          Back to candidates
        </Link>
      </div>
    </main>
  );
}
