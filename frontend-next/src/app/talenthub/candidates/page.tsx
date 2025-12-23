"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import styles from "./CandidatesPage.module.css";

type Candidate = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  location: string | null;
  graduation_title: string | null;
  industry_category: string | null;
  studied_role: string | null;
  graduation_year: number | null;
};

export default function CandidatesPage() {
  const [industry, setIndustry] = useState("all");
  const [studiedRole, setStudiedRole] = useState("");
  const [newGradOnly, setNewGradOnly] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);
      setError("");
      try {
        const minGradYear = newGradOnly ? new Date().getFullYear() - 1 : null;
        let query = supabase
          .from("profiles")
          .select(
            "user_id,full_name,email,location,graduation_title,industry_category,studied_role,graduation_year"
          )
          .eq("role", "student");

        if (industry !== "all") {
          query = query.eq("industry_category", industry);
        }
        if (studiedRole.trim()) {
          query = query.ilike("studied_role", `%${studiedRole.trim()}%`);
        }
        if (minGradYear !== null) {
          query = query.gte("graduation_year", minGradYear);
        }

        const { data, error: fetchErr } = await query.order("graduation_year", { ascending: false });
        if (fetchErr) throw fetchErr;
        setCandidates(data ?? []);
      } catch (err: any) {
        setError(err?.message || "Failed to load candidates.");
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, [industry, studiedRole, newGradOnly]);

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <h1 className={styles.title}>Find candidates</h1>
          <p className={styles.subtitle}>
            Filter for newly graduated students by industry and studied role.
          </p>
        </header>

        <section className={styles.filters}>
          <div className={styles.filterRow}>
            <label className={styles.label}>
              Industry
              <select className={styles.select} value={industry} onChange={(e) => setIndustry(e.target.value)}>
                <option value="all">All industries</option>
                <option value="software">Software</option>
                <option value="data">Data</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="operations">Operations</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className={styles.label}>
              Studied role
              <input
                className={styles.input}
                type="text"
                placeholder="Computer Science, UX, Data Science"
                value={studiedRole}
                onChange={(e) => setStudiedRole(e.target.value)}
              />
            </label>
            <label className={styles.label}>
              Graduation year
              <input
                className={styles.input}
                type="text"
                value={newGradOnly ? "Last 12 months" : "Any year"}
                readOnly
              />
            </label>
          </div>
          <label className={styles.toggleRow}>
            <input type="checkbox" checked={newGradOnly} onChange={(e) => setNewGradOnly(e.target.checked)} />
            Newly graduated only
          </label>
        </section>

        <section className={styles.list}>
          {loading && <p className={styles.empty}>Loading candidates...</p>}
          {!loading && error && <p className={styles.empty}>{error}</p>}
          {!loading && !error && candidates.length === 0 && (
            <p className={styles.empty}>No candidates match those filters yet.</p>
          )}
          {candidates.map((candidate) => (
            <article key={candidate.user_id} className={styles.card}>
              <h3 className={styles.name}>{candidate.full_name || "Unnamed student"}</h3>
              <p className={styles.meta}>
                {candidate.graduation_title || "Graduate"}{" "}
                {candidate.graduation_year ? `• Class of ${candidate.graduation_year}` : ""}
              </p>
              <p className={styles.meta}>
                {candidate.location || "Location unknown"}
                {candidate.email ? ` • ${candidate.email}` : ""}
              </p>
              <div className={styles.tagRow}>
                {candidate.industry_category && <span className={styles.tag}>{candidate.industry_category}</span>}
                {candidate.studied_role && <span className={styles.tag}>{candidate.studied_role}</span>}
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
