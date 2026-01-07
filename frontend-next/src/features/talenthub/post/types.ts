export type FormState = {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  industryCategory: string;
  description: string;
  requirements: string;
  applyMethod: "url" | "email";
  applyUrl: string;
  applyEmail: string;
  tags: string;
  expiresAt: string;
};

export const EMPTY_FORM: FormState = {
  title: "",
  company: "",
  location: "",
  employmentType: "full_time",
  industryCategory: "software",
  description: "",
  requirements: "",
  applyMethod: "url",
  applyUrl: "",
  applyEmail: "",
  tags: "",
  expiresAt: "",
};
