import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import styles from "../styles/PreviewTemplate.module.css";
import type { CvData } from "../types";
import { saveCurrentCv } from "../CvStore";

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

const useCvData = (): CvData => {
  const nav = useLocation();
  const fromState = (nav.state as any)?.cv as CvData | undefined;
  return useMemo(() => {
    if (fromState) return fromState;
    const raw = localStorage.getItem("cv_draft_v1");
    return raw
      ? JSON.parse(raw)
      : {
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
  }, [fromState]);
};

const PreviewPage: React.FC = () => {
  const cv = useCvData();
  const navigate = useNavigate();

  React.useEffect(() => {
    (async () => {
      const thumb = await captureThumbnailFromPreview();
      if (thumb) {
        try {
          saveCurrentCv(cv, thumb);
        } catch {}
        try {
          localStorage.setItem("cv_draft_thumb_v1", thumb);
        } catch {}
      }
    })();
  }, [cv]);

  const handleDownloadPdf = () => {
    window.print();
  };

  const formatDates = (start?: string, end?: string) => {
    const startText = start || "";
    const endText = end || "";
    if (!startText && !endText) return "";
    if (startText && endText) return `${startText} – ${endText}`;
    return startText || endText;
  };

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
                  <span className={styles.icon}>🌐</span>
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
        <button onClick={() => navigate(-1)} className={styles.btnGhost}>
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
