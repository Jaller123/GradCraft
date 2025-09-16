import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CvForm, { CvData } from "./components/CvForm";
import Chatbot from "./components/ChatBot";
import styles from "./App.module.css";
import StartHero from "./components/StartHero";

const EMPTY_CV: CvData = {
  fullName: "",
  title: "",
  summary: "",
  contacts: { email: "", phone: "", location: "", links: [] },
  skills: [],
  experience: [],
  education: [],
  projects: [],
  languages: []
};

// (Optional) merge helper: keep existing edits; fill only empty fields
function mergeCv(prev: CvData, incoming: Partial<CvData>): CvData {
  const take = <T,>(a: T, b?: T) => (a && a !== ("" as any) ? a : (b ?? a));
  return {
    fullName: take(prev.fullName, incoming.fullName),
    title: take(prev.title, incoming.title),
    summary: take(prev.summary, incoming.summary),
    contacts: { ...(prev.contacts || {}), ...(incoming.contacts || {}) },
    skills: incoming.skills?.length ? incoming.skills : prev.skills,
    experience: incoming.experience?.length ? incoming.experience as any : prev.experience,
    education: incoming.education?.length ? incoming.education as any : prev.education,
    projects: incoming.projects?.length ? incoming.projects as any : prev.projects,
    languages: incoming.languages?.length ? incoming.languages as any : prev.languages,
  };
}

function CvPage() {
  const [cv, setCv] = useState<CvData>(EMPTY_CV);

  return (
  <>
      <main className={styles.main}>
        <div className={styles.grid}>
          <Chatbot onCvExtract={(json) => setCv((prev) => mergeCv(prev, json))} />
          <div>
            <h2 className={styles.heading}>Your CV</h2>
            <CvForm value={cv} onChange={setCv} />
          </div>
        </div>
      </main>
    </>
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
      </Routes>
    </Router>
  );
}
