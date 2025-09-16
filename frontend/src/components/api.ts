import { api } from "../components/client";

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