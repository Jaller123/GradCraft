// CvBuilderPage.tsx (excerpt)
import { useNavigate } from "react-router-dom";
import CvForm from "./CvForm";
import { useState } from "react";
import { CvData } from "../types";

const INITIAL: CvData = {
  fullName: "", title: "", summary: "",
  contacts: { email: "", phone: "", location: "", links: [] },
  skills: [], experience: [], education: [], projects: [], languages: []
};

export default function CvBuilderPage() {
  const [cv, setCv] = useState<CvData>(INITIAL);
  const navigate = useNavigate();

  const saveAndContinue = () => {
    localStorage.setItem("cv_draft_v1", JSON.stringify(cv));
    navigate("/preview", { state: { cv } });
  };

  return (
    <div>
        <CvForm value={cv} onChange={setCv} onContinue={saveAndContinue} />
    </div>
  );
}
