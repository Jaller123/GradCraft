"use client";

import React from "react";
import styles from "./TermsPage.module.css";

export default function TermsPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <h1 className={styles.title}>Terms of Service</h1>
          <p className={styles.meta}>Last updated: {new Date().toLocaleDateString()}</p>
          <p className={styles.text}>
            These Terms govern your use of GradCraft. By creating an account or using the service, you agree to these
            Terms. If you do not agree, do not use the service.
          </p>

          <h2 className={styles.sectionTitle}>Service overview</h2>
          <p className={styles.text}>
            GradCraft provides tools to create and manage resumes and to connect students with recruiters. The platform
            is still unfinished and may change or have limitations.
          </p>

          <h2 className={styles.sectionTitle}>Eligibility and accounts</h2>
          <ul className={styles.list}>
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for your account credentials and all activity under your account.</li>
            <li>We may suspend or terminate accounts that violate these Terms.</li>
          </ul>

          <h2 className={styles.sectionTitle}>User content</h2>
          <ul className={styles.list}>
            <li>You own the content you submit, including resumes and job posts.</li>
            <li>You grant GradCraft permission to process your content to provide the service.</li>
            <li>You are responsible for ensuring your content is lawful and accurate.</li>
          </ul>

          <h2 className={styles.sectionTitle}>Acceptable use</h2>
          <ul className={styles.list}>
            <li>Do not upload illegal, harmful, or misleading content.</li>
            <li>Do not attempt to access accounts or data that are not yours.</li>
            <li>Do not use the service to spam, scrape, or disrupt the platform.</li>
          </ul>

          <h2 className={styles.sectionTitle}>AI assistance</h2>
          <p className={styles.text}>
            AI-generated suggestions are provided “as is” and may contain errors. You are responsible for reviewing and
            verifying outputs before use.
          </p>

          <h2 className={styles.sectionTitle}>Disclaimer and limitation of liability</h2>
          <p className={styles.text}>
            The service is provided without warranties of any kind. To the maximum extent permitted by law, GradCraft is
            not liable for indirect or consequential damages or loss of data.
          </p>

          <h2 className={styles.sectionTitle}>Changes</h2>
          <p className={styles.text}>
            We may update these Terms from time to time. Continued use of the service means you accept the updated
            Terms.
          </p>

          <h2 className={styles.sectionTitle}>Contact</h2>
          <p className={styles.text}>
            Questions about these Terms? Contact us at jallerken@hotmail.se.
          </p>
        </section>
      </div>
    </main>
  );
}
