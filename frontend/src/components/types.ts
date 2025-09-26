// types.ts
export type CvExperience = {
  role: string;
  company: string;
  start?: string;
  end?: string;
  bullets: string[];
  tech: string[];
};

export type CvEducation = {
  school: string;
  program: string;
  start?: string;
  end?: string;
};

export type CvData = {
  fullName: string;
  title: string;
  summary: string;
  contacts: {
    email?: string;
    phone?: string;
    location?: string;
    links?: string[];
  };
  skills: string[];
  experience: CvExperience[];
  education: CvEducation[];
  projects: { name: string; url?: string; bullets: string[] }[];
  languages: { name: string; level: string }[];
  contact: string[]
};
