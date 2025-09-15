import React, { useState } from "react";
import Navbar from "../components/Navbar";
import CvForm, { CvData } from "../components/CvForm";
import Chatbot from "../components/ChatBot";

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

function App() {
  const [cv, setCv] = useState<CvData>(EMPTY_CV);

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "1rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Chatbot onCvExtract={(json) => setCv((prev) => mergeCv(prev, json))} />
          <div>
            <h2 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Your CV</h2>
            <CvForm value={cv} onChange={setCv} />
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
