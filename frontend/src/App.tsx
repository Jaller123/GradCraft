import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import CvForm from "./components/CV Form/CvForm";
import Chatbot from "./components/CV Form/ChatBot";
import PreviewPage from "./components/CV Form/PreviewPage";
import StartHero from "./components/StartHero";
import ScrollStory from "./components/ScrollStory";
import LoginPage from "./components/Auth/LoginPage";
import SavedCvsPage from "./components/SavedCVsPage";
import styles from "./App.module.css";
import { useNavigate } from "react-router-dom";
import { getCurrent, createCv, saveCurrentCv, setCurrent, loadCv } from "./components/CvStore";
import { CvData } from "./components/types";


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

  function normalizeCv(data: Partial<CvData>): CvData {
  return {
    fullName: data.fullName || "",
    title: data.title || "",
    summary: data.summary || "",
    contacts: {
      email: data.contacts?.email || "",
      phone: data.contacts?.phone || "",
      location: data.contacts?.location || "",
      links: data.contacts?.links || []
    },
    skills: data.skills || [],
    experience: data.experience || [],
    education: data.education || [],
    projects: data.projects || [],
    languages: data.languages || [],
  };
}

function titleFrom(cv: CvData) {
  return (cv.fullName && `${cv.fullName} – ${cv.title || "CV"}`) || "Untitled CV";
}

function CvPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const resumeId = (location.state as any)?.resumeId as string | undefined;
  const [cv, setCv] = useState<CvData>(EMPTY_CV);
  const [currentId, setCurrentId] = useState<string | undefined>(resumeId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load existing resume only when editing (resumeId provided)
  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (resumeId) {
          const data = await loadCv(resumeId);
          if (data) {
            setCv(data);
            setCurrent(resumeId);
            setCurrentId(resumeId);
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
        navigate("/preview", { state: { cv } });
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

function HomePage() {
  return (
    <>
      <StartHero />
      <ScrollStory />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cv" element={<CvPage />} />
        {/* <Route path="/recruiters" element={<Recruiters />} /> */}
        <Route path="/preview" element={<PreviewPage />} />
          <Route path="/saved" element={<SavedCvsPage />} />
          <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}
