"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";
import styles from "./AdDetail.module.css";

type AdRecord = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  requirements: string | null;
  employment_type: string | null;
  apply_url: string | null;
  tags: string[] | null;
  created_at: string;
};

type Props = {
  params: { id: string };
};

export default function AdDetailPage({ params }: Props) {
  const [ad, setAd] = useState<AdRecord | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const { data, error: fetchErr } = await supabase
          .from("ads")
          .select("id,title,company,location,description,requirements,employment_type,apply_url,tags,created_at")
          .eq("id", params.id)
          .single();
        if (fetchErr) {
          setError(fetchErr.message);
        } else {
          setAd(data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, [params.id]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.card}>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : ad ? (
            <>
              <h1 className={styles.title}>{ad.title}</h1>
              <p className={styles.meta}>
                {ad.company}
                {ad.location ? ` - ${ad.location}` : ""}
                {ad.employment_type ? ` - ${ad.employment_type}` : ""}
              </p>
              {ad.tags && ad.tags.length > 0 && (
                <div className={styles.tagRow}>
                  {ad.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p>Role not found.</p>
          )}
        </div>

        {ad && (
          <>
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Role overview</h2>
              <p className={styles.sectionText}>{ad.description || "No description provided yet."}</p>
            </section>
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Requirements</h2>
              <p className={styles.sectionText}>{ad.requirements || "No requirements provided yet."}</p>
            </section>
            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>Apply</h2>
              {ad.apply_url ? (
                <a className={styles.link} href={ad.apply_url} target="_blank" rel="noreferrer">
                  {ad.apply_url}
                </a>
              ) : (
                <p className={styles.sectionText}>Add an apply link to receive applications.</p>
              )}
            </section>
          </>
        )}

        <div className={styles.actions}>
          <Link className={styles.ghost} href="/talenthub">
            Back to Talent Hub
          </Link>
          <Link className={styles.ghost} href="/talenthub/post">
            Post another role
          </Link>
        </div>
      </div>
    </main>
  );
}
