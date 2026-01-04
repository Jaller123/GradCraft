// shared helpers for dates + bullet parsing
export const toYMD = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : undefined);

export const parseYearOrYearMonth = (s?: string): Date | null => {
  if (!s) return null;
  const ym = /^(\d{4})-(\d{2})$/.exec(s);
  if (ym) {
    const y = Number(ym[1]);
    const m = Number(ym[2]) - 1;
    if (y >= 1900 && y <= 2100 && m >= 0 && m <= 11) return new Date(Date.UTC(y, m, 1));
  }
  const y = /^(\d{4})$/.exec(s);
  if (y) {
    const yy = Number(y[1]);
    if (yy >= 1900 && yy <= 2100) return new Date(Date.UTC(yy, 0, 1));
  }
  return null;
};

export const bulletsFromTextarea = (txt: string) =>
  txt
    .split(/\r?\n/)
    .map((s) => s.replace(/^\s*[-•]\s*/, "").trim())
    .filter(Boolean);

export const bulletsToTextarea = (arr: string[]) =>
  (arr || []).map((b) => (b.startsWith("- ") ? b : `- ${b}`)).join("\n");
