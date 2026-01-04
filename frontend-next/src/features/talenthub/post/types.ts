export type FormState = {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  industryCategory: string;
  description: string;
  requirements: string;
  applyUrl: string;
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
  applyUrl: "",
  tags: "",
  expiresAt: "",
};
