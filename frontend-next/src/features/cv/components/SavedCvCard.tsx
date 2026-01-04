"use client";

import React from "react";
import styles from "../SaveCVsPage.module.css";
import type { CvRecord } from "../cvStore";

type Props = {
  record: CvRecord;
  primaryId: string | null;
  savingPrimary: string | null;
  deletingId: string | null;
  downloadingId: string | null;
  onOpen: (id: string) => void;
  onDownload: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
};

const SavedCvCard: React.FC<Props> = ({
  record,
  primaryId,
  savingPrimary,
  deletingId,
  downloadingId,
  onOpen,
  onDownload,
  onSetPrimary,
  onRename,
  onDelete,
}) => {
  return (
    <div className={styles.card}>
      <div
        className={styles.thumbWrap}
        onClick={() => onOpen(record.id)}
      >
        {record.thumbDataUrl ? (
          <img className={styles.thumb} src={record.thumbDataUrl} alt={`${record.title} preview`} />
        ) : (
          <div className={styles.thumbPlaceholder}>No preview</div>
        )}
      </div>

      <div className={styles.meta}>
        <div className={styles.cardTitle} title={record.title}>
          {record.title}
        </div>
        <div className={styles.time}>Edited {new Date(record.updatedAt ?? Date.now()).toLocaleDateString()}</div>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnOpen} onClick={() => onOpen(record.id)}>
          Open
        </button>
        <button
          className={styles.btnDownload}
          onClick={() => onDownload(record.id)}
          disabled={downloadingId === record.id}
        >
          {downloadingId === record.id ? "Preparing..." : "Download"}
        </button>
        <button
          className={styles.btnPrimary}
          onClick={() => onSetPrimary(record.id)}
          disabled={savingPrimary === record.id}
        >
          {primaryId === record.id ? "Primary resume" : "Select as primary resume"}
        </button>
        <button className={styles.btnRename} onClick={() => onRename(record.id)}>
          Rename
        </button>
        <button className={styles.btnDelete} disabled={deletingId === record.id} onClick={() => onDelete(record.id)}>
          {deletingId === record.id ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
};

export default SavedCvCard;
