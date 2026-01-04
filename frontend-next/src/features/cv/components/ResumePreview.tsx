"use client";

import React from "react";
import styles from "./PreviewTemplate.module.css";
import type { CvData } from "../types";

type Props = {
  cv: CvData;
};

const formatDates = (start?: string, end?: string) => {
  const startText = start || "";
  const endText = end || "";
  if (!startText && !endText) return "";
  if (startText && endText) return `${startText} - ${endText}`;
  return startText || endText;
};

const ResumePreview: React.FC<Props> = ({ cv }) => {
  return (
    <div className={styles.resume}>
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
            {(cv.contacts?.links || []).map((link, i) => (
              <div className={styles.row} key={i}>
                <span className={styles.icon}>🔗</span>
                <a href={link} target="_blank" rel="noreferrer">
                  {link}
                </a>
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
  );
};

export default ResumePreview;

