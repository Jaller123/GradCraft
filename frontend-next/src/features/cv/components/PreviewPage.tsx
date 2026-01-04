"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import html2canvas from "html2canvas";
import styles from "./PreviewTemplate.module.css";
import type { CvData } from "../types";
import { saveCurrentCv, getCurrent, loadCv } from "../cvStore";
import ResumePreview from "./ResumePreview";

async function captureThumbnailFromPreview(): Promise<string | undefined> {
  const el = document.querySelector(`.${styles.resume}`) as HTMLElement | null;
  if (!el) return;
  const canvas = await html2canvas(el, {
    scale: 0.6,
    useCORS: true,
    scrollY: 0,
  } as any);
  return canvas.toDataURL("image/png", 0.9);
}

const EMPTY: CvData = {
  fullName: "",
  title: "",
  summary: "",
  contacts: { email: "", phone: "", location: "", links: [] },
  skills: [],
  experience: [],
  education: [],
  projects: [],
  languages: [],
};

const PreviewPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId") ?? undefined;
  const shouldPrint = searchParams.get("print") === "1";
  const [cv, setCv] = React.useState<CvData | null>(null);
  const originalTitleRef = React.useRef<string | null>(null);
  const printedRef = React.useRef(false);

  React.useEffect(() => {
    (async () => {
      if (resumeId) {
        const data = await loadCv(resumeId);
        setCv(data || EMPTY);
        return;
      }
      const rec = await getCurrent();
      setCv(rec?.data || EMPTY);
    })();
  }, [resumeId]);

  React.useEffect(() => {
    if (!cv) return;
    if (originalTitleRef.current === null) originalTitleRef.current = document.title;
    const name = cv.fullName?.trim() || cv.title?.trim() || "Resume";
    document.title = `CV - ${name}`;
  }, [cv]);

  React.useEffect(() => {
    return () => {
      if (originalTitleRef.current !== null) {
        document.title = originalTitleRef.current;
      }
    };
  }, []);

  React.useEffect(() => {
    if (!cv) return;
    (async () => {
      const thumb = await captureThumbnailFromPreview();
      if (thumb) {
        try {
          saveCurrentCv(cv, thumb);
        } catch {
          /* ignore */
        }
      }
    })();
  }, [cv]);

  React.useEffect(() => {
    if (!cv || !shouldPrint || printedRef.current) return;
    printedRef.current = true;
    const kick = async () => {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
      await new Promise((resolve) => setTimeout(resolve, 150));
      window.print();
    };
    kick();
  }, [cv, shouldPrint]);

  const handleDownloadPdf = () => window.print();

  if (!cv) {
    return (
      <div className={styles.pageWrap}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrap}>
      <div className="print-resume">
        <ResumePreview cv={cv} />
      </div>

      <div className={styles.actions}>
        <button onClick={() => router.back()} className={styles.btnGhost}>
          Back & Edit
        </button>
        <button onClick={handleDownloadPdf} className={styles.btnPrimary}>
          Download PDF
        </button>
      </div>
    </div>
  );
};

export default PreviewPage;

