import { api } from "./client.js";

export async function generate(prompt, model = "gpt-5") {
    const data = await api.request("/api/generate", {
        method: "POST",
        body: { prompt, model },
    })

    return data.output ?? ""
}