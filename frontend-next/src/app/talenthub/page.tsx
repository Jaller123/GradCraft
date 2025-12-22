"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import styles from "./RecruitersPage.module.css";

type AdPreview = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  employment_type: string | null;
  tags: string[] | null;
  expires_at: string | null;
};

export default function RecruitersPage() {
  const router = useRouter();
  const [ads, setAds] = useState<AdPreview[]>([]);
  const [adsError, setAdsError] = useState("");

  useEffect(() => {
    supabase
      .from("job_posts")
      .select("id,title,company,location,employment_type,tags,expires_at")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (error) {
          setAdsError(error.message);
        } else {
          const now = Date.now();
          const filtered = (data ?? []).filter((ad) => !ad.expires_at || Date.parse(ad.expires_at) > now);
          setAds(filtered);
        }
      });
  }, []);

  const handlePostRole = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      router.push("/talenthub/post");
    } else {
      router.push("/login?reason=login_required");
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={styles.kicker}>Hiring portal</p>
            <h1 className={styles.heroTitle}>Build entry level pipelines faster.</h1>
            <p className={styles.heroCopy}>
              Post new grad roles, spot high potential students, and move from first contact to interview in days.
            </p>
            <div className={styles.ctaRow}>
              <button className={styles.ctaPrimary} type="button" onClick={handlePostRole}>
                Post a role
              </button>
              <button className={styles.ctaGhost} type="button">
                Find candidates
              </button>
            </div>
          </div>
        </section>

        <section className={styles.market}>
          <div className={styles.marketHeader}>
            <h2 className={styles.marketTitle}>Latest postings</h2>
            <div className={styles.chipRow}>
              <span className={styles.chip}>New grad friendly</span>
              <span className={styles.chip}>Fresh listings</span>
            </div>
          </div>
          <div className={styles.list}>
            {adsError && <p className={styles.footerNote}>Unable to load roles yet.</p>}
            {!adsError && ads.length === 0 && <p className={styles.footerNote}>No roles posted yet.</p>}
            {ads.map((ad) => {
              const expiresAt = ad.expires_at ? new Date(ad.expires_at) : null;
              const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - Date.now()) / 86400000) : null;
              const isExpiringSoon = daysLeft !== null && daysLeft <= 5;
              return (
              <article key={ad.id} className={styles.jobCard}>
                <h3 className={styles.jobTitle}>{ad.title}</h3>
                <p className={styles.jobMeta}>
                  {ad.company}
                  {ad.location ? ` - ${ad.location}` : ""}
                  {ad.employment_type ? ` - ${ad.employment_type}` : ""}
                </p>
                {expiresAt && (
                  <p className={isExpiringSoon ? styles.expirySoon : styles.expiry}>
                    {isExpiringSoon ? `Expires in ${daysLeft} days` : `Expires ${expiresAt.toLocaleDateString()}`}
                  </p>
                )}
                {ad.tags && ad.tags.length > 0 && (
                  <div className={styles.jobTags}>
                    {ad.tags.map((tag) => (
                      <span key={tag} className={styles.jobTag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className={styles.jobActions}>
                  <Link className={styles.jobButton} href={`/talenthub/${ad.id}`}>
                    View listing
                  </Link>
                </div>
              </article>
            );
            })}
          </div>
        </section>

        <section className={styles.flow}>
          <div className={styles.flowCard}>
            <h3 className={styles.flowTitle}>1. Post a role</h3>
            <p className={styles.flowCopy}>
              Share the basics: title, stack, timeline, and what makes it new grad friendly.
            </p>
          </div>
          <div className={styles.flowCard}>
            <h3 className={styles.flowTitle}>2. Review matches</h3>
            <p className={styles.flowCopy}>
              We surface students with aligned skills, projects, and graduation dates.
            </p>
          </div>
          <div className={styles.flowCard}>
            <h3 className={styles.flowTitle}>3. Invite fast</h3>
            <p className={styles.flowCopy}>
              Send a short note and schedule quick screens right from the dashboard.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
