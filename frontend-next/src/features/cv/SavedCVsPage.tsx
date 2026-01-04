"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { listCvs, setCurrent, renameCv, deleteCv, CvRecord } from "./cvStore";
import styles from "./SaveCVsPage.module.css";
import SavedCvCard from "./components/SavedCvCard";

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
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const base = process.env.NEXT_PUBLIC_API_BASE_URL as string;
      const res = await fetch(`${base}/api/resumes/${resumeId}/pdf`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const detail = await res.text();
        throw new Error(detail || "Failed to download CV.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(e?.message || "Failed to download CV.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleOpen = (resumeId: string) => {
    setCurrent(resumeId);
    router.push(`/cv?resumeId=${resumeId}`);
  };

  const handleRename = async (resumeId: string) => {
    const target = items.find((item) => item.id === resumeId);
    const next = prompt("Rename CV", target?.title ?? "");
    if (next != null) {
      await renameCv(resumeId, next);
      setItems(await listCvs());
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm("Delete this CV?")) return;
    setDeletingId(resumeId);
    try {
      await deleteCv(resumeId);
      setItems((prev) => prev.filter((r) => r.id !== resumeId));
    } catch (e: any) {
      setError(e?.message || "Failed to delete CV");
      setItems(await listCvs());
    } finally {
      setDeletingId(null);
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
          {items.map((rec) => (
            <SavedCvCard
              key={rec.id}
              record={rec}
              primaryId={primaryId}
              savingPrimary={savingPrimary}
              deletingId={deletingId}
              downloadingId={downloadingId}
              onOpen={handleOpen}
              onDownload={handleDownload}
              onSetPrimary={handleSetPrimary}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedCvsPage;
