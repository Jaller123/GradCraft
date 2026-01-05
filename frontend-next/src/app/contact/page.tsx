"use client";

import React from "react";
import styles from "./ContactPage.module.css";

export default function ContactPage() {
  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.card}>
          <h1 className={styles.title}>Contact</h1>
          <p className={styles.text}>
            For support, feedback, or data requests, email us at{" "}
            <a className={styles.link} href="mailto:jallerken@hotmail.se">
              jallerken@hotmail.se
            </a>
            .
          </p>

          <h2 className={styles.title}>Support</h2>
          <ul className={styles.list}>
            <li>Response time: 1–3 business days.</li>
            <li>Include your account email and a short description of the issue.</li>
          </ul>

          <h2 className={styles.title}>Data requests</h2>
          <p className={styles.text}>
            If you want access or deletion of your data, contact us with the subject “Data Request.”
          </p>
        </section>
      </div>
    </main>
  );
}
