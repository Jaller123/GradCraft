import re
from typing import Optional, Dict, Any, List, Tuple

_DATE_RE = re.compile(r"\b(19|20)\d{2}(?:-(0[1-9]|1[0-2]))?\b")


def _pick_year_or_year_month(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    s = str(value)
    rng = re.search(
        r"\b((?:19|20)\d{2})\s*(?:-|ƒ?|ƒ?|to|until|through)\s*((?:19|20)\d{2})\b",
        s,
        re.IGNORECASE,
    )
    if rng:
        return rng.group(1)

    m = _DATE_RE.search(s)
    return m.group(0) if m else None


def _extract_range(text: str) -> Tuple[Optional[str], Optional[str]]:
    """Pull 'YYYY' or 'YYYY-MM' start/end from free text like '2024-2025'."""
    if not text:
        return (None, None)
    t = str(text)
    rng = re.search(
        r"\b((?:19|20)\d{2})(?:-(0[1-9]|1[0-2]))?\s*(?:-|ƒ?|ƒ?|to|until|through)\s*((?:19|20)\d{2})(?:-(0[1-9]|1[0-2]))?\b",
        t,
        re.IGNORECASE,
    )
    if rng:
        start = f"{rng.group(1)}{('-' + rng.group(2)) if rng.group(2) else ''}"
        end = f"{rng.group(3)}{('-' + rng.group(4)) if rng.group(4) else ''}"
        return (start, end)
    single = _DATE_RE.search(t)
    if single:
        return (single.group(0), None)
    return (None, None)


def _clean_bullets(bullets: List[str]) -> List[str]:
    out = []
    for b in bullets[:5]:
        b = re.sub(r"^\s*[-ƒ?½]\s*", "", str(b)).strip()
        if not b:
            continue
        if len(b) > 160:
            b = b[:160].rsplit(" ", 1)[0]
        out.append(b)
    return out


def _normalize_experience(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen = set()
    norm: List[Dict[str, Any]] = []

    for it in items or []:
        role = (it.get("role") or "").strip()
        company = (it.get("company") or "").strip()
        start_raw = it.get("start")
        end_raw = it.get("end")

        s_from_text, e_from_text = (None, None)
        if isinstance(start_raw, str) and any(sep in start_raw for sep in ["-", "ƒ?", "ƒ?", "to", "until", "through"]):
            s_from_text, e_from_text = _extract_range(start_raw)
        elif isinstance(end_raw, str) and any(sep in end_raw for sep in ["-", "ƒ?", "ƒ?", "to", "until", "through"]):
            s_from_text, e_from_text = _extract_range(end_raw)

        start = _pick_year_or_year_month(s_from_text or start_raw)
        end = _pick_year_or_year_month(e_from_text or end_raw)

        bullets = _clean_bullets(it.get("bullets") or [])
        tech = [t.strip() for t in (it.get("tech") or []) if str(t).strip()][:12]

        key = (role.lower(), company.lower(), start or "", end or "")
        if not role or not company:
            continue
        if key in seen:
            continue
        seen.add(key)

        norm.append(
            {
                "role": role,
                "company": company,
                **({"start": start} if start else {}),
                **({"end": end} if end else {}),
                "bullets": bullets,
                "tech": tech,
            }
        )

    return norm


def normalize_cv(cv: Dict[str, Any]) -> Dict[str, Any]:
    """Coerce model output to safe, consistent shapes."""
    if not isinstance(cv, dict):
        return cv
    cv = dict(cv)

    cv["experience"] = _normalize_experience(cv.get("experience") or [])

    contacts = cv.get("contacts") or {}
    cv["contacts"] = {
        "email": str(contacts.get("email") or ""),
        "phone": str(contacts.get("phone") or ""),
        "location": str(contacts.get("location") or ""),
        "links": [str(x).strip() for x in (contacts.get("links") or []) if str(x).strip()][:10],
    }

    cv["skills"] = [str(s).strip() for s in (cv.get("skills") or []) if str(s).strip()][:30]

    for k in ("education", "projects", "languages"):
        if k not in cv or not isinstance(cv[k], list):
            cv[k] = []

    for k in ("fullName", "title", "summary"):
        cv[k] = str(cv.get(k) or "")

    return cv
