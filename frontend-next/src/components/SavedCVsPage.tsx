"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listCvs, setCurrent, renameCv, deleteCv, CvRecord } from "./CvStore";
import styles from "../components/styles/SaveCVsPage.module.css";

const SavedCvsPage: React.FC = () => {
  const router = useRouter();
  const [items, setItems] = useState<CvRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await listCvs();
        setItems(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load CVs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
