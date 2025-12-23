"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import styles from "./ProfilePage.module.css";

type Profile = {
  full_name: string | null;
  email: string | null;
  role: string | null;
  location: string | null;
  graduation_title: string | null;
  graduation_year: number | null;
  studied_role: string | null;
  industry_category: string | null;
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
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
        const { data, error: fetchErr } = await supabase
          .from("profiles")
          .select(
            "full_name,email,role,location,graduation_title,graduation_year,studied_role,industry_category"
          )
          .eq("user_id", sessionData.session.user.id)
          .single();
        if (fetchErr) throw fetchErr;
        setProfile(data);
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
              <div className={styles.field}>
                Studied role
                <span className={styles.value}>{profile.studied_role || "Not set"}</span>
              </div>
              <div className={styles.field}>
                Industry
                <span className={styles.value}>{profile.industry_category || "Not set"}</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
