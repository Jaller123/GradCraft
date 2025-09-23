// types.ts
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
  experience: {
    role: string;
    company: string;
    start?: string;
    end?: string;
    bullets: string[];
    tech: string[];
  }[];
  education: { school: string; program: string; start?: string; end?: string }[];
  projects: { name: string; url?: string; bullets: string[] }[];
  languages: { name: string; level: string }[];
};
