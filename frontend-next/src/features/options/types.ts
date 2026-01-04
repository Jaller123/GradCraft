export type Profile = {
  full_name: string | null;
  role: string | null;
  email: string | null;
  location: string | null;
  graduation_title: string | null;
  graduation_year: number | null;
  studied_role: string | null;
  occupation_role: string | null;
  industry_category: string | null;
  primary_resume_id: string | null;
};

export type Tab = "profile" | "security";
