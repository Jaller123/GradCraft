"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Chatbot from "../../features/cv/components/ChatBot";
import CvForm from "../../features/cv/components/CvForm";
import styles from "../../features/cv/CvPage.module.css";
import { supabase } from "../../lib/supabaseClient";
import {
  getCurrent,
  createCv,
  saveCurrentCv,
  setCurrent,
  loadCv,
  getCurrentId,
} from "../../features/cv/cvStore";
import { CvData } from "../../features/cv/types";

const EMPTY_CV: CvData = {
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

// keep existing edits; fill only empty fields
function mergeCv(prev: CvData, incoming: Partial<CvData>): CvData {
  const take = <T,>(a: T, b?: T) => (a && a !== ("" as any) ? a : b ?? a);
  return {
    fullName: take(prev.fullName, incoming.fullName),
    title: take(prev.title, incoming.title),
    summary: take(prev.summary, incoming.summary),
    contacts: { ...(prev.contacts || {}), ...(incoming.contacts || {}) },
    skills: incoming.skills?.length ? incoming.skills : prev.skills,
    experience: incoming.experience?.length
      ? (incoming.experience as any)
      : prev.experience,
    education: incoming.education?.length
      ? (incoming.education as any)
      : prev.education,
    projects: incoming.projects?.length
      ? (incoming.projects as any)
      : prev.projects,
    languages: incoming.languages?.length
      ? (incoming.languages as any)
      : prev.languages,
  };
}

function titleFrom(cv: CvData) {
  return (cv.fullName && `${cv.fullName} ƒ?" ${cv.title || "CV"}`) || "Untitled CV";
}

export default function CvPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId") ?? undefined;
  const [cv, setCv] = useState<CvData>(EMPTY_CV);
  const [currentId, setCurrentId] = useState<string | undefined>(
    resumeId || getCurrentId()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load existing resume only when editing (resumeId provided)
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data: sessionData } = await supabase.auth.getSession();
        if (!sessionData.session?.user) {
          router.replace("/login?reason=login_required");
          return;
        }
        const targetId = resumeId || getCurrentId();
        if (targetId) {
          const data = await loadCv(targetId);
          if (data) {
            setCv(data);
            setCurrent(targetId);
            setCurrentId(targetId);
          } else {
            setCv(EMPTY_CV);
          }
        } else {
          setCv(EMPTY_CV);
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load CV");
      } finally {
        setLoading(false);
      }
    })();
  }, [resumeId]);

  const saveAndContinue = () => {
    (async () => {
      try {
        let id = currentId;
        if (!id) {
          const rec = await createCv(titleFrom(cv), cv);
          id = rec.id;
          setCurrentId(id);
          setCurrent(id);
        } else {
          await saveCurrentCv(cv);
        }
        router.push("/preview");
      } catch (e) {
        setError((e as any)?.message || "Save failed");
      }
    })();
  };

  return (
    <main className={styles.main}>
      <div className={styles.grid}>
        <Chatbot onCvExtract={(json) => setCv((prev) => mergeCv(prev, json))} />
        <div>
          <h2 className={styles.heading}>Your CV</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p>{error}</p>
          ) : (
            <CvForm value={cv} onChange={setCv} onContinue={saveAndContinue} />
          )}
        </div>
      </div>
    </main>
  );
}
