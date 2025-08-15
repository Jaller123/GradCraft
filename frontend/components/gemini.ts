import { api } from "./client";

export interface GenerateResponse {
    output?: string;
}

export async function generate(prompt: string): Promise<string> {
    const data = await api.request<GenerateResponse>("/api/generate", {
        method: "POST",
        body: { prompt },
    });
    return data?.output ?? "";
}