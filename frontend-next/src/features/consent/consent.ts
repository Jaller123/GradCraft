export type ConsentState = {
  analytics: boolean;
  ads: boolean;
  updatedAt: string;
};

const STORAGE_KEY = "gradcraft_consent_v1";

export const consentFlags = () => ({
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
  ads: process.env.NEXT_PUBLIC_ENABLE_ADS === "true",
});

export const readConsent = (): ConsentState | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
};

export const writeConsent = (consent: ConsentState) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    window.dispatchEvent(new Event("gc:consent"));
  } catch {}
};
