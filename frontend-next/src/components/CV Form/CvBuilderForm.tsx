"use client";

// CvBuilderPage.tsx (excerpt)
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const saveAndContinue = () => {
    // (optional) keep your single-draft copy
   

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
    router.push("/preview");
  };

  return (
    <div>
        <CvForm value={cv} onChange={setCv} onContinue={saveAndContinue} />
    </div>
  );
}
