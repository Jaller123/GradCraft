"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import html2canvas from "html2canvas";
import styles from "../styles/PreviewTemplate.module.css";
import type { CvData } from "../types";
import { saveCurrentCv, getCurrent, loadCv } from "../CvStore";

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
  const [cv, setCv] = React.useState<CvData | null>(null);
  const originalTitleRef = React.useRef<string | null>(null);

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

  // Set a friendly document title for print exports
  React.useEffect(() => {
    if (!cv) return;
    if (originalTitleRef.current === null) originalTitleRef.current = document.title;
    const name = cv.fullName?.trim() || cv.title?.trim() || "Resume";
    document.title = `CV - ${name}`;
  }, [cv]);

  // Restore original title on unmount
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

  const handleDownloadPdf = () => window.print();

  const formatDates = (start?: string, end?: string) => {
    const startText = start || "";
    const endText = end || "";
    if (!startText && !endText) return "";
    if (startText && endText) return `${startText} – ${endText}`;
    return startText || endText;
  };

  if (!cv) {
    return (
      <div className={styles.pageWrap}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.pageWrap}>
      <div className={`${styles.resume} print-resume`}>
        <header className={styles.header}>
          <h1 className={styles.name}>{cv.fullName || "John Smith"}</h1>
          <div className={styles.role}>{cv.title || "Developer"}</div>
        </header>

        <div className={styles.columns}>
          <aside className={styles.sidebar}>
            <section className={styles.block}>
              <h3 className={styles.blockTitle}>Contact</h3>
              {cv.contacts?.phone && (
                <div className={styles.row}>
                  <span className={styles.icon}>☎</span>
                  <span>{cv.contacts.phone}</span>
                </div>
              )}
              {cv.contacts?.email && (
                <div className={styles.row}>
                  <span className={styles.icon}>✉</span>
                  <span>{cv.contacts.email}</span>
                </div>
              )}
              {cv.contacts?.location && (
                <div className={styles.row}>
                  <span className={styles.icon}>📍</span>
                  <span>{cv.contacts.location}</span>
                </div>
              )}
              {(cv.contacts?.links || []).map((l, i) => (
                <div className={styles.row} key={i}>
                  <span className={styles.icon}>🔗</span>
                  <span>{l}</span>
                </div>
              ))}
            </section>

            {cv.education?.length > 0 && (
              <section className={styles.block}>
                <h3 className={styles.blockTitle}>Education</h3>
                {cv.education.map((e, i) => (
                  <div key={i} className={styles.eduItem}>
                    <div className={styles.eduSchool}>{e.school}</div>
                    <div className={styles.eduDates}>{formatDates(e.start, e.end)}</div>
                    <div className={styles.eduProgram}>{e.program}</div>
                  </div>
                ))}
              </section>
            )}

            {cv.skills?.length > 0 && (
              <section className={styles.block}>
                <h3 className={styles.blockTitle}>Skills</h3>
                <div>{cv.skills.join(", ")}</div>
              </section>
            )}
          </aside>

          <div className={styles.main}>
            <section className={styles.block}>
              <h3 className={styles.blockTitle}>Profile</h3>
              <p className={styles.summary}>{cv.summary}</p>
            </section>

            {cv.experience?.length > 0 && (
              <section className={styles.block}>
                <h3 className={styles.blockTitle}>Work Experience</h3>
                {cv.experience.map((e, i) => (
                  <div key={i} className={styles.expItem}>
                    <div className={styles.expHead}>
                      <div className={styles.expRole}>{e.role}</div>
                      <div className={styles.expCompany}>{e.company}</div>
                    </div>
                    <div className={styles.expDates}>{formatDates(e.start, e.end)}</div>
                    <p className={styles.expText}>{e.bullets?.join(" ")}</p>
                  </div>
                ))}
              </section>
            )}
          </div>
        </div>
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
