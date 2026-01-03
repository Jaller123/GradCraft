import { api } from "../components/client";
import { CvData } from "./types";

export interface GenerateResponse {
    output?: string;
}

export async function generate(prompt: string) {
  return api.request<{ output: string }>("/api/generate", {
    method: "POST",
    body: { prompt },
  });
}

export async function extractCv(free_text: string) {
  return api.request<any>("/api/extract-cv", {
    method: "POST",
    body: { free_text },
  });
}

export async function improveCv(current_cv: any, job_text?: string) {
  return api.request<any>("/api/improve-cv", {
    method: "POST",
    body: { current_cv, job_text: job_text ?? "" },
  });
}

// Resumes (Supabase-backed)
export type ResumeRecord = {
  id: string;
  user_id: string;
  title: string;
  data: CvData;
  thumb_data_url?: string | null;
  updated_at?: string;
};

export async function listResumes() {
  return api.request<ResumeRecord[]>("/api/resumes", { method: "GET" });
}

export async function getResume(id: string) {
  return api.request<ResumeRecord>(`/api/resumes/${id}`, { method: "GET" });
}

export async function upsertResume(payload: Partial<ResumeRecord>) {
  return api.request<ResumeRecord>("/api/resumes", { method: "POST", body: payload });
}

export async function deleteResume(id: string) {
  return api.request<{ deleted: number }>(`/api/resumes/${id}`, { method: "DELETE" });
}

export async function deleteAccount() {
  return api.request<{ deleted: boolean }>("/api/account", { method: "DELETE" });
}
