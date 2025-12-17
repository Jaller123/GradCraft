import type { CvData } from "./types";
import { listResumes, getResume, upsertResume, deleteResume } from "./api";

export type CvRecord = { id: string; title: string; data: CvData; updatedAt?: number; thumbDataUrl?: string | null };

const EMPTY_CV: CvData = {
  fullName: "",
  title: "",
  summary: "",
  contacts: { email: "", phone: "", location: "", links: [] },
  skills: [],
  experience: [],
  education: [],
  projects: [],
  languages: [],
};

let cache: CvRecord[] = [];
let currentId: string | undefined;

function toRecord(rec: any): CvRecord {
  return {
    id: rec.id,
    title: rec.title,
    data: (rec.data as CvData) ?? EMPTY_CV,
    updatedAt: rec.updated_at ? new Date(rec.updated_at).getTime() : Date.now(),
    thumbDataUrl: rec.thumb_data_url ?? undefined,
  };
}

export async function listCvs(): Promise<CvRecord[]> {
  const rows = await listResumes();
  cache = (rows || []).map(toRecord).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  if (!currentId && cache.length) currentId = cache[0].id;
  return cache;
}

export function getCurrentId() {
  return currentId;
}

export async function getCurrent(): Promise<CvRecord | undefined> {
  if (currentId) {
    const rec = cache.find((r) => r.id === currentId);
    if (rec) return rec;
  }
  const list = await listCvs();
  return list.find((r) => r.id === currentId) || list[0];
}

export function setCurrent(id: string) {
  currentId = id;
}

export async function createCv(title: string, data: CvData): Promise<CvRecord> {
  const rec = await upsertResume({ title: title.trim() || "Untitled CV", data });
  const cv = toRecord(rec);
  currentId = cv.id;
  cache = [cv, ...cache.filter((r) => r.id !== cv.id)];
  return cv;
}

export async function saveCurrentCv(data: CvData, thumbDataUrl?: string) {
  if (!currentId) {
    await createCv("Untitled CV", data);
    return;
  }
  let existing = cache.find((r) => r.id === currentId);
  if (!existing) {
    try {
      existing = toRecord(await getResume(currentId));
    } catch {
      existing = undefined;
    }
  }
  const rec = await upsertResume({
    id: currentId,
    title: existing?.title || "Untitled CV",
    data,
    thumb_data_url: thumbDataUrl ?? existing?.thumbDataUrl,
  });
  const cv = toRecord(rec);
  cache = [cv, ...cache.filter((r) => r.id !== cv.id)];
}

export async function renameCv(id: string, title: string) {
  let existing = cache.find((r) => r.id === id);
  if (!existing) {
    try {
      existing = toRecord(await getResume(id));
    } catch {
      existing = undefined;
    }
  }
  const rec = await upsertResume({
    id,
    title: title.trim() || existing?.title || "Untitled CV",
    data: existing?.data ?? EMPTY_CV,
    thumb_data_url: existing?.thumbDataUrl,
  });
  const cv = toRecord(rec);
  cache = [cv, ...cache.filter((r) => r.id !== cv.id)];
}

export async function deleteCv(id: string) {
  await deleteResume(id);
  cache = cache.filter((r) => r.id !== id);
  if (currentId === id) {
    currentId = cache[0]?.id;
  }
}

export async function loadCv(id: string): Promise<CvData | null> {
  try {
    const rec = await getResume(id);
    const cv = toRecord(rec);
    cache = [cv, ...cache.filter((r) => r.id !== cv.id)];
    currentId = cv.id;
    return cv.data;
  } catch {
    return null;
  }
}

export function clearCurrent() {
  currentId = undefined;
}
