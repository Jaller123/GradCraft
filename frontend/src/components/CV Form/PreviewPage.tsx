import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/PreviewTemplate.module.css";
import type { CvData } from "../types";

const useCvData = (): CvData => {
  const nav = useLocation();
  const fromState = (nav.state as any)?.cv as CvData | undefined;
  return useMemo(() => {
    if (fromState) return fromState;
    const raw = localStorage.getItem("cv_draft_v1");
    return raw ? JSON.parse(raw) : {
      fullName: "", title: "", summary: "",
      contacts: { email: "", phone: "", location: "", links: [] },
      skills: [], experience: [], education: [], projects: [], languages: []
    };
  }, [fromState]);
};

const PreviewPage: React.FC = () => {
  const cv = useCvData();
  const navigate = useNavigate();

 const handleDownloadPdf = async () => {
  const el = document.querySelector(`.${styles.resume}`) as HTMLElement;
if (!el) return;

const html2pdf = (await import("html2pdf.js")).default;

const opts = {
  margin: 0,
  filename: (cv.fullName?.trim() || "CV") + ".pdf",
  image: { type: "jpeg", quality: 0.98 },
  html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
  jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
  pagebreak: { mode: ["css", "legacy"] }, // <- valid runtime option
} as any; // <-- tell TS to chill about extra fields

html2pdf().set(opts).from(el).save();
  };

  return (
    <div className={styles.pageWrap}>
      <div className={`${styles.resume} print-resume`}>

        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.name}>{cv.fullName || "Your Name"}</h1>
          {cv.title && <div className={styles.role}>{cv.title}</div>}
        </header>

        <div className={styles.body}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            {/* CONTACT */}
            <section className={styles.block}>
              <h3 className={styles.blockTitle}>Contact</h3>
              <ul className={styles.contactList}>
                {cv.contacts?.phone && <li>📞 {cv.contacts.phone}</li>}
                {cv.contacts?.email && <li>✉️ {cv.contacts.email}</li>}
                {cv.contacts?.location && <li>📍 {cv.contacts.location}</li>}
                {cv.contacts?.links?.map((l, i) => <li key={i}>🌐 {l}</li>)}
              </ul>
            </section>

            {/* EDUCATION */}
            {cv.education?.length > 0 && (
              <section className={styles.block}>
                <h3 className={styles.blockTitle}>Education</h3>
                {cv.education.map((e, i) => (
                  <div key={i} className={styles.eduItem}>
                    <div className={styles.eduSchool}>{e.school}</div>
                    <div className={styles.eduDates}>{(e.start || "—") + " – " + (e.end || "Present")}</div>
                    <div className={styles.eduProgram}>{e.program}</div>
                  </div>
                ))}
              </section>
            )}

            {/* AWARDS (optional placeholder; map from projects or your own field) */}
            {cv.projects?.length > 0 && (
              <section className={styles.block}>
                <h3 className={styles.blockTitle}>Awards & Certifications</h3>
                <ul className={styles.bullets}>
                  {cv.projects.slice(0,3).map((p,i) => <li key={i}>{p.name}</li>)}
                </ul>
              </section>
            )}

            {/* SKILLS */}
            {cv.skills?.length > 0 && (
              <section className={styles.block}>
                <h3 className={styles.blockTitle}>Skills</h3>
                <ul className={styles.bullets}>
                  {cv.skills.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </section>
            )}
          </aside>

          {/* Main */}
          <main className={styles.main}>
            {/* PROFILE / SUMMARY */}
            {cv.summary && (
              <section className={styles.block}>
                <h3 className={styles.blockTitle}>Profile</h3>
                <p className={styles.summary}>{cv.summary}</p>
              </section>
            )}

            {/* EXPERIENCE */}
            {cv.experience?.length > 0 && (
              <section className={styles.block}>
                <h3 className={styles.blockTitle}>Work Experience</h3>
                {cv.experience.map((e, i) => (
                  <div key={i} className={styles.expItem}>
                    <div className={styles.expHead}>
                      <div className={styles.expRole}>{e.role}</div>
                      <div className={styles.expCompany}>{e.company}</div>
                      <div className={styles.expDates}>{(e.start || "—") + " – " + (e.end || "Present")}</div>
                    </div>
                    {e.bullets?.length > 0 && (
                      <ul className={styles.bullets}>
                        {e.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </section>
            )}
          </main>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button onClick={() => navigate(-1)} className={styles.btnGhost}>← Back & Edit</button>
        <button onClick={handleDownloadPdf} className={styles.btnPrimary}>Download Resume</button>
      </div>
    </div>
  );
};

export default PreviewPage;
