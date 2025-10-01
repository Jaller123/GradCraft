import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CvForm from "./components/CV Form/CvForm";
import Chatbot from "./components/CV Form/ChatBot";
import PreviewPage from "./components/CV Form/PreviewPage";
import StartHero from "./components/StartHero";
import SavedCvsPage from "./components/SavedCVsPage";
import styles from "./App.module.css";
import { useNavigate } from "react-router-dom";
import { getCurrent, createCv, saveCurrentCv } from "./components/CvStore";
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

function CvPage() {

const STORAGE_KEY = "cv_draft_v1";

const [cv, setCv] = useState<CvData>(() => {
    const rec = getCurrent();
    return rec?.data ?? EMPTY_CV;
  });


const navigate = useNavigate();


React.useEffect(() => { saveCurrentCv(cv); }, [cv]);

  const saveAndContinue = () => {
    saveCurrentCv(cv);
    navigate("/preview", { state: { cv } });
  };

  return (
    <main className={styles.main}>
      <div className={styles.grid}>
        <Chatbot onCvExtract={(json) => setCv((prev) => mergeCv(prev, json))} />
        <div>
          <h2 className={styles.heading}>Your CV</h2>
          <CvForm value={cv} onChange={setCv} onContinue={saveAndContinue} />
        </div>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<StartHero />} />
        <Route path="/cv" element={<CvPage />} />
        {/* <Route path="/recruiters" element={<Recruiters />} /> */}
        <Route path="/preview" element={<PreviewPage />} />
          <Route path="/saved" element={<SavedCvsPage />} />
      </Routes>
    </Router>
  );
}
