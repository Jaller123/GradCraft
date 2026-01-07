"use client";

import React from "react";
import styles from "./PrivacyPage.module.css";

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <h1 className={styles.title}>Privacy Policy</h1>
          <p className={styles.meta}>Last updated: {new Date().toLocaleDateString()}</p>
          <p className={styles.text}>
            GradCraft respects your privacy. This policy explains what data we collect, how we use it, and the
            choices you have. If you have questions, contact us at jallerken@hotmail.se
          </p>

          <h2 className={styles.sectionTitle}>Information we collect</h2>
          <ul className={styles.list}>
            <li>Account details: email, name, and role.</li>
            <li>Profile details: education, graduation year, and study field you provide.</li>
            <li>Resume data: CV content you create or upload.</li>
            <li>Chat inputs: text you send to the CV assistant.</li>
            <li>Local storage: saved chat history and auth/session data stored in your browser.</li>
          </ul>

          <h2 className={styles.sectionTitle}>How we use your information</h2>
          <ul className={styles.list}>
            <li>To create and manage your account and saved resumes.</li>
            <li>To match students and recruiters and show relevant profiles.</li>
            <li>To provide support, security, and improve the platform.</li>
            <li>To generate CV suggestions using our AI provider when you request it.</li>
          </ul>

          <h2 className={styles.sectionTitle}>Cookies and local storage</h2>
          <p className={styles.text}>
            GradCraft uses browser storage to keep you signed in and remember chat history. We do not use
            advertising cookies today. If we add ads or analytics in the future, we will update this policy
            and request consent where required.
          </p>

          <h2 className={styles.sectionTitle}>Third-party services</h2>
          <p className={styles.text}>
            We use trusted providers to run the service: Supabase for authentication and data storage, and
            Groq for AI-assisted CV extraction. These providers process data only to deliver their services
            to us.
          </p>

          <h2 className={styles.sectionTitle}>Sharing</h2>
          <p className={styles.text}>
            We only share your information when you choose to make a resume public or connect with recruiters.
            We do not sell your data.
          </p>

          <h2 className={styles.sectionTitle}>Data retention</h2>
          <p className={styles.text}>
            You can delete your account and resumes at any time. We retain data only as long as needed for the
            service to function or as required by law.
          </p>

          <h2 className={styles.sectionTitle}>Your rights</h2>
          <ul className={styles.list}>
            <li>Access and update your data in your profile and options pages.</li>
            <li>Request deletion of your account.</li>
            <li>Withdraw consent for optional data processing where required.</li>
            <li>EU/UK users can request access, correction, deletion, portability, or restriction.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
