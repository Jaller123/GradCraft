// Minimal local multi-CV store using localStorage.
// Works offline, no backend required.

import type { CvData } from "./types";

const STORE_KEY = "cv_store_v1";

export type CvRecord = { id: string; title: string; data: CvData; updatedAt: number };
export type CvStore  = { currentId?: string; items: Record<string, CvRecord> };

const emptyStore: CvStore = { items: {} };

function load(): CvStore {
  try { return JSON.parse(localStorage.getItem(STORE_KEY) || "") || emptyStore; }
  catch { return emptyStore; }
}
function save(s: CvStore) {
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
}

function uid() {
  return (crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
}

export function listCvs() {
  const s = load();
  return Object.values(s.items).sort((a,b)=> b.updatedAt - a.updatedAt);
}
export function getCurrentId() { return load().currentId; }
export function getCurrent(): CvRecord | undefined {
  const s = load(); return s.currentId ? s.items[s.currentId] : undefined;
}
export function setCurrent(id: string) {
  const s = load(); if (s.items[id]) { s.currentId = id; save(s); }
}

export function createCv(title: string, data: CvData): CvRecord {
  const s = load();
  const id = uid();
  const rec: CvRecord = { id, title: title.trim() || "Untitled CV", data, updatedAt: Date.now() };
  s.items[id] = rec; s.currentId = id; save(s); return rec;
}
export function saveCurrentCv(data: CvData) {
  const s = load(); const id = s.currentId; if (!id) return;
  const prev = s.items[id]; s.items[id] = { ...prev, data, updatedAt: Date.now() }; save(s);
}
export function renameCv(id: string, title: string) {
  const s = load(); const rec = s.items[id]; if (!rec) return;
  s.items[id] = { ...rec, title: title.trim() || rec.title, updatedAt: Date.now() }; save(s);
}
export function deleteCv(id: string) {
  const s = load(); delete s.items[id];
  if (s.currentId === id) s.currentId = Object.keys(s.items)[0];
  save(s);
}
export function loadCv(id: string): CvData | null {
  const s = load(); const rec = s.items[id]; if (!rec) return null;
  s.currentId = id; save(s); return rec.data;
}
