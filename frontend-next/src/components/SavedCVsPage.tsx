"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { listCvs, setCurrent, renameCv, deleteCv, CvRecord } from "./CvStore";
import styles from "../components/styles/SaveCVsPage.module.css";

const SavedCvsPage: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<CvRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [savingPrimary, setSavingPrimary] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) {
          router.replace("/login?reason=login_required");
          return;
        }
        const data = await listCvs();
        setItems(data);
        const { data: profileData } = await supabase
          .from("profiles")
          .select("primary_resume_id")
          .eq("user_id", sessionData.session.user.id)
          .single();
        setPrimaryId(profileData?.primary_resume_id ?? null);
      } catch (e: any) {
        setError(e?.message || "Failed to load CVs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSetPrimary = async (resumeId: string) => {
    setError("");
    setSavingPrimary(resumeId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        router.replace("/login?reason=login_required");
        return;
      }
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({ primary_resume_id: resumeId })
        .eq("user_id", sessionData.session.user.id);
      if (updateErr) throw updateErr;
      setPrimaryId(resumeId);
    } catch (e: any) {
      setError(e?.message || "Failed to set primary resume.");
    } finally {
      setSavingPrimary(null);
    }
  };

  const handleDownload = async (resumeId: string) => {
    setError("");
    setDownloadingId(resumeId);
    try {
      router.push(`/preview?resumeId=${resumeId}&print=1`);
    } catch (e: any) {
      setError(e?.message || "Failed to download CV.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
<div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Saved CVs</h2>
        {/* Optional: New CV lives here instead of navbar */}
        {/* <button className={styles.newBtn} onClick={...}>+ New CV</button> */}
      </div>

      {loading && <p className={styles.empty}>Loading...</p>}
      {!loading && error && <p className={styles.empty}>{error}</p>}
      {!loading && !error && items.length === 0 ? (
        <p className={styles.empty}>No saved CVs yet.</p>
      ) : (
        <div className={styles.grid}>
          {items.map(rec => (
            <div key={rec.id} className={styles.card}>
              <div
                className={styles.thumbWrap}
                onClick={() => {
                  setCurrent(rec.id);
                  router.push(`/cv?resumeId=${rec.id}`);
                }}
              >
                {rec.thumbDataUrl
                  ? <img className={styles.thumb} src={rec.thumbDataUrl} alt={`${rec.title} preview`} />
                  : <div className={styles.thumbPlaceholder}>No preview</div>}
              </div>

              <div className={styles.meta}>
                <div className={styles.cardTitle} title={rec.title}>{rec.title}</div>
                <div className={styles.time}>
                  Edited {new Date(rec.updatedAt ?? Date.now()).toLocaleDateString()}
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.btnOpen}
                  onClick={() => {
                    setCurrent(rec.id);
                    router.push(`/cv?resumeId=${rec.id}`);
                  }}
                >
                  Open
                </button>
                <button
                  className={styles.btnDownload}
                  onClick={() => handleDownload(rec.id)}
                  disabled={downloadingId === rec.id}
                >
                  {downloadingId === rec.id ? "Preparing..." : "Download"}
                </button>
                <button
                  className={styles.btnPrimary}
                  onClick={() => handleSetPrimary(rec.id)}
                  disabled={savingPrimary === rec.id}
                >
                  {primaryId === rec.id ? "Primary resume" : "Select as primary resume"}
                </button>
                <button className={styles.btnRename} onClick={async () => {
                  const next = prompt("Rename CV", rec.title);
                  if (next != null) {
                    await renameCv(rec.id, next);
                    setItems(await listCvs());
                  }
                }}>Rename</button>
                <button
                  className={styles.btnDelete}
                  disabled={deletingId === rec.id}
                  onClick={async () => {
                    if (!confirm("Delete this CV?")) return;
                    setDeletingId(rec.id);
                    try {
                      await deleteCv(rec.id);
                      // Optimistically remove locally so UI updates without a full reload
                      setItems((prev) => prev.filter((r) => r.id !== rec.id));
                    } catch (e: any) {
                      setError(e?.message || "Failed to delete CV");
                      setItems(await listCvs());
                    } finally {
                      setDeletingId(null);
                    }
                  }}
                >
                  {deletingId === rec.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCvsPage;
