"use client";

import React from "react";
import styles from "./RecruitersPage.module.css";

export default function RecruitersPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <p className={styles.kicker}>Hiring portal</p>
            <h1 className={styles.heroTitle}>Build entry level pipelines faster.</h1>
            <p className={styles.heroCopy}>
              Post new grad roles, spot high potential students, and move from first contact to interview in days.
            </p>
            <div className={styles.ctaRow}>
              <button className={styles.ctaPrimary} type="button">
                Post a role
              </button>
              <button className={styles.ctaGhost} type="button">
                Find candidates
              </button>
            </div>
          </div>
          <div className={styles.heroPanel}>
            <div className={styles.stat}>
              <p className={styles.statLabel}>New grad talent pool</p>
              <p className={styles.statValue}>1,200+ active profiles</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Response time</p>
              <p className={styles.statValue}>48h average reply</p>
            </div>
            <div className={styles.stat}>
              <p className={styles.statLabel}>Shortlist rate</p>
              <p className={styles.statValue}>32% move to interview</p>
            </div>
          </div>
        </section>

        <section className={styles.flow}>
          <div className={styles.flowCard}>
            <h3 className={styles.flowTitle}>1. Post a role</h3>
            <p className={styles.flowCopy}>
              Share the basics: title, stack, timeline, and what makes it new grad friendly.
            </p>
          </div>
          <div className={styles.flowCard}>
            <h3 className={styles.flowTitle}>2. Review matches</h3>
            <p className={styles.flowCopy}>
              We surface students with aligned skills, projects, and graduation dates.
            </p>
          </div>
          <div className={styles.flowCard}>
            <h3 className={styles.flowTitle}>3. Invite fast</h3>
            <p className={styles.flowCopy}>
              Send a short note and schedule quick screens right from the dashboard.
            </p>
          </div>
        </section>

        <section className={styles.market}>
          <div className={styles.marketHeader}>
            <h2 className={styles.marketTitle}>Entry level roles</h2>
            <div className={styles.chipRow}>
              <span className={styles.chip}>Hybrid</span>
              <span className={styles.chip}>Remote</span>
              <span className={styles.chip}>Paid internships</span>
              <span className={styles.chip}>Graduate programs</span>
            </div>
          </div>
          <div className={styles.marketGrid}>
            <aside className={styles.sidebar}>
              <div className={styles.filterCard}>
                <p className={styles.filterLabel}>Location</p>
                <p className={styles.filterValue}>Stockholm, Gothenburg, Remote</p>
              </div>
              <div className={styles.filterCard}>
                <p className={styles.filterLabel}>Skills</p>
                <p className={styles.filterValue}>React, Python, Data, QA</p>
              </div>
              <div className={styles.filterCard}>
                <p className={styles.filterLabel}>Graduation</p>
                <p className={styles.filterValue}>2024 - 2026 cohorts</p>
              </div>
            </aside>
            <div className={styles.list}>
              <article className={styles.jobCard}>
                <h3 className={styles.jobTitle}>Junior Product Analyst</h3>
                <p className={styles.jobMeta}>Nordic Insights • Stockholm • Full time</p>
                <div className={styles.jobTags}>
                  <span className={styles.jobTag}>SQL</span>
                  <span className={styles.jobTag}>Dashboards</span>
                  <span className={styles.jobTag}>Entry level</span>
                </div>
                <div className={styles.jobActions}>
                  <button className={styles.jobButton} type="button">
                    View applicants
                  </button>
                  <button className={styles.jobButton} type="button">
                    Edit post
                  </button>
                </div>
              </article>
              <article className={styles.jobCard}>
                <h3 className={styles.jobTitle}>Graduate Software Engineer</h3>
                <p className={styles.jobMeta}>SignalCraft • Remote • New grad</p>
                <div className={styles.jobTags}>
                  <span className={styles.jobTag}>TypeScript</span>
                  <span className={styles.jobTag}>APIs</span>
                  <span className={styles.jobTag}>Mentorship</span>
                </div>
                <div className={styles.jobActions}>
                  <button className={styles.jobButton} type="button">
                    Match candidates
                  </button>
                  <button className={styles.jobButton} type="button">
                    Duplicate
                  </button>
                </div>
              </article>
              <article className={styles.jobCard}>
                <h3 className={styles.jobTitle}>Marketing Associate</h3>
                <p className={styles.jobMeta}>Kite Labs • Gothenburg • Hybrid</p>
                <div className={styles.jobTags}>
                  <span className={styles.jobTag}>Growth</span>
                  <span className={styles.jobTag}>Content</span>
                  <span className={styles.jobTag}>Community</span>
                </div>
                <div className={styles.jobActions}>
                  <button className={styles.jobButton} type="button">
                    View post
                  </button>
                  <button className={styles.jobButton} type="button">
                    Archive
                  </button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className={styles.split}>
          <div className={styles.splitCard}>
            <h3 className={styles.splitTitle}>Find talent faster</h3>
            <p className={styles.splitCopy}>
              Scan student profiles by skills, projects, and graduation date. Reach out with one click.
            </p>
            <ul className={styles.bulletList}>
              <li>Filters for new grad availability</li>
              <li>Shortlists and saved searches</li>
              <li>Invite to apply messages</li>
            </ul>
            <button className={styles.ctaGhost} type="button">
              Start talent search
            </button>
          </div>
          <div className={styles.splitCard}>
            <h3 className={styles.splitTitle}>Post a job once</h3>
            <p className={styles.splitCopy}>
              Reuse templates for common entry roles and highlight mentorship or training.
            </p>
            <ul className={styles.bulletList}>
              <li>Internship and graduate program templates</li>
              <li>Auto matched student list</li>
              <li>Employer branding block</li>
            </ul>
            <button className={styles.ctaPrimary} type="button">
              Create a job ad
            </button>
          </div>
        </section>

        <p className={styles.footerNote}>
          This is the starting layout for the recruiter hub. You can plug in real job posts and candidate data
          once the backend endpoints are ready.
        </p>
      </div>
    </main>
  );
}
