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
            choices you have. If you have questions, contact us at hello@gradcraft.app.
          </p>

          <h2 className={styles.sectionTitle}>Information we collect</h2>
          <ul className={styles.list}>
            <li>Account details: email, name, and role.</li>
            <li>Profile details: education, graduation year, and study field you provide.</li>
            <li>Resume data: CV content you create or upload.</li>
            <li>Usage data: basic analytics about how the app is used.</li>
          </ul>

          <h2 className={styles.sectionTitle}>How we use your information</h2>
          <ul className={styles.list}>
            <li>To create and manage your account and saved resumes.</li>
            <li>To match students and recruiters and show relevant profiles.</li>
            <li>To provide support, security, and improve the platform.</li>
          </ul>

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
            <li>Withdraw consent for optional data processing.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
