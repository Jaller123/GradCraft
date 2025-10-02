// CvBuilderPage.tsx (excerpt)
import { useNavigate } from "react-router-dom";
import CvForm from "./CvForm";
import { useState } from "react";
import { CvData } from "../types";

import { getCurrent, createCv, saveCurrentCv } from "../CvStore";

const INITIAL: CvData = {
  fullName: "", title: "", summary: "",
  contacts: { email: "", phone: "", location: "", links: [] },
  skills: [], experience: [], education: [], projects: [], languages: []
};

export default function CvBuilderPage() {
  const [cv, setCv] = useState<CvData>(INITIAL);
  const navigate = useNavigate();

  const saveAndContinue = () => {
    // (optional) keep your single-draft copy
    localStorage.setItem("cv_draft_v1", JSON.stringify(cv));

    const current = getCurrent();
    if (!current) {
      // first time: create a record so Saved CVs page has something to list
      const title =
        (cv.fullName && `${cv.fullName} – ${cv.title || "CV"}`) || "Untitled CV";
      createCv(title, cv);
    } else {
      // subsequent times: update the same record
      saveCurrentCv(cv);
    }
    navigate("/preview", { state: { cv } });
  };

  return (
    <div>
        <CvForm value={cv} onChange={setCv} onContinue={saveAndContinue} />
    </div>
  );
}
