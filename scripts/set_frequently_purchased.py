#!/usr/bin/env python3
"""
Set Frequently Purchased Together (related tests) for every Live CMS catalog item.

- Updates only frequentlyPurchasedTests via the CMS edit form.
- Preserves includedTests, FAQs, parameters, prep, prices, categories, etc.
- Picks 2–4 clinically relevant related tests per item (never self).
"""

from __future__ import annotations

import html as html_lib
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from typing import Dict, List, Optional, Set, Tuple

CMS = "http://localhost:8080"
MAX_RELATED = 3

# Explicit high-quality related codes (preferred when present).
RELATED_BY_CODE: Dict[str, List[str]] = {
    # Vitamins / minerals / bone
    "DRS002": ["DRS041", "DRS190", "DRS048"],  # Vit D → Calcium, B12, CBC
    "DRS190": ["DRS002", "DRS087", "DRS126"],  # B12 → Vit D, Folate, Iron
    "DRS087": ["DRS190", "DRS048", "DRS126"],  # Folate
    "DRS041": ["DRS002", "DRS142", "DRS127"],  # Calcium → Vit D, Phos, KFT
    "DRS142": ["DRS041", "DRS002", "DRS127"],  # Phosphorus
    # Inflammation
    "DRS081": ["DRS062", "DRS048", "DRS160"],  # ESR → CRP, CBC, RA
    "DRS062": ["DRS081", "DRS048", "DRS145"],  # CRP
    "DRS160": ["DRS024", "DRS081", "DRS062"],  # RA → Anti-CCP, ESR, CRP
    "DRS024": ["DRS160", "DRS081", "DRS062"],  # Anti-CCP
    "DRS145": ["DRS062", "DRS048", "DRS081"],  # Procalcitonin
    "DRS115": ["DRS062", "DRS048", "DRS081"],  # IgE
    # Blood
    "DRS048": ["DRS100", "DRS126", "DRS081"],  # CBC
    "DRS100": ["DRS048", "DRS126", "DRS190"],  # Hemoglobin
    "DRS143": ["DRS048", "DRS077", "DRS062"],  # Platelets → CBC, Dengue NS1, CRP
    "DRS036": ["DRS048", "DRS100", "DRS126"],  # Peripheral smear
    "DRS035": ["DRS048", "DRS100"],  # Blood group
    # Diabetes / metabolic
    "DRS091": ["DRS094", "DRS092", "DRS131"],  # Fasting glucose
    "DRS092": ["DRS091", "DRS094", "DRS131"],  # PP
    "DRS093": ["DRS091", "DRS094", "DRS131"],  # Random
    "DRS191": ["DRS091", "DRS094", "DRS056"],  # Urine glucose
    "DRS094": ["DRS091", "DRS131", "DRS127"],  # HbA1c
    "DRS061": ["DRS120", "DRS094", "DRS091"],  # C-peptide
    "DRS120": ["DRS061", "DRS094", "DRS091"],  # Insulin
    # Kidney / electrolytes
    "DRS127": ["DRS066", "DRS056", "DRS080"],  # KFT
    "DRS066": ["DRS127", "DRS187", "DRS056"],  # Creatinine
    "DRS187": ["DRS066", "DRS127", "DRS188"],  # Urea
    "DRS188": ["DRS127", "DRS066", "DRS041"],  # Uric acid
    "DRS080": ["DRS127", "DRS066", "DRS041"],  # Electrolytes
    "DRS056": ["DRS127", "DRS137", "DRS151"],  # CUE
    "DRS137": ["DRS127", "DRS094", "DRS056"],  # Microalbumin
    "DRS151": ["DRS056", "DRS127", "DRS066"],  # PCR urine
    # Liver / pancreas
    "DRS133": ["DRS011", "DRS130", "DRS048"],  # LFT
    "DRS011": ["DRS130", "DRS133"],  # Amylase
    "DRS130": ["DRS011", "DRS133"],  # Lipase
    "DRS065": ["DRS133", "DRS048", "DRS062"],  # CPK
    "DRS114": ["DRS131", "DRS094", "DRS048"],  # Homocysteine
    # Heart / lipids
    "DRS131": ["DRS094", "DRS091", "DRS114"],  # Lipid
    # Thyroid / hormones
    "DRS173": ["DRS174", "DRS094", "DRS048"],  # Thyroid total
    "DRS174": ["DRS173", "DRS094", "DRS002"],  # TSH
    "DRS146": ["DRS082", "DRS147", "DRS173"],  # Progesterone
    "DRS147": ["DRS082", "DRS146", "DRS173"],  # Prolactin
    "DRS082": ["DRS146", "DRS147", "DRS173"],  # Estradiol
    # Iron
    "DRS125": ["DRS126", "DRS048", "DRS190"],
    "DRS126": ["DRS125", "DRS048", "DRS190"],
    # Fever / infection
    "DRS077": ["DRS048", "DRS143", "DRS062"],  # Dengue NS1
    "DRS076": ["DRS077", "DRS075", "DRS048"],  # Dengue IgM
    "DRS075": ["DRS077", "DRS076", "DRS048"],  # Dengue IgG
    "DRS078": ["DRS077", "DRS048", "DRS143"],  # Dengue profile
    "DRS136": ["DRS135", "DRS048", "DRS062"],  # Malaria smear
    "DRS135": ["DRS136", "DRS048", "DRS062"],  # Malaria antigen
    "DRS192": ["DRS193", "DRS048", "DRS062"],  # Widal slide
    "DRS193": ["DRS192", "DRS048", "DRS062"],  # Widal tube
    # Profiles
    "DRSP001": ["DRS094", "DRS091", "DRS131"],  # Diabetic — may use different codes
    "DRSW001": ["DRSW002", "DRS173", "DRS048"],  # Women's fixed
    "DRSW002": ["DRSW001", "DRS082", "DRS173"],  # Women's custom
}

# Affinity tags by code — used as fallback scoring
AFFINITY: Dict[str, Set[str]] = {
    "DRS002": {"vitamin", "bone"},
    "DRS190": {"vitamin", "anemia"},
    "DRS087": {"vitamin", "anemia"},
    "DRS041": {"bone", "kidney"},
    "DRS142": {"bone", "kidney"},
    "DRS081": {"inflammation", "fever"},
    "DRS062": {"inflammation", "fever"},
    "DRS160": {"autoimmune", "inflammation"},
    "DRS024": {"autoimmune", "inflammation"},
    "DRS145": {"inflammation", "fever"},
    "DRS115": {"allergy", "inflammation"},
    "DRS048": {"blood", "fever", "anemia"},
    "DRS100": {"blood", "anemia"},
    "DRS143": {"blood", "fever"},
    "DRS036": {"blood", "anemia"},
    "DRS035": {"blood"},
    "DRS091": {"diabetes", "metabolic"},
    "DRS092": {"diabetes", "metabolic"},
    "DRS093": {"diabetes", "metabolic"},
    "DRS191": {"diabetes", "urine"},
    "DRS094": {"diabetes", "metabolic"},
    "DRS061": {"diabetes", "metabolic"},
    "DRS120": {"diabetes", "metabolic"},
    "DRS127": {"kidney"},
    "DRS066": {"kidney"},
    "DRS187": {"kidney"},
    "DRS188": {"kidney", "gout"},
    "DRS080": {"kidney", "electrolyte"},
    "DRS056": {"urine", "kidney"},
    "DRS137": {"kidney", "diabetes", "urine"},
    "DRS151": {"kidney", "urine"},
    "DRS133": {"liver"},
    "DRS011": {"liver", "pancreas"},
    "DRS130": {"liver", "pancreas"},
    "DRS065": {"muscle", "inflammation"},
    "DRS114": {"heart", "metabolic"},
    "DRS131": {"heart", "metabolic", "lipid"},
    "DRS173": {"thyroid"},
    "DRS174": {"thyroid"},
    "DRS146": {"hormone", "women"},
    "DRS147": {"hormone", "women"},
    "DRS082": {"hormone", "women"},
    "DRS125": {"anemia", "iron"},
    "DRS126": {"anemia", "iron"},
    "DRS077": {"fever", "dengue"},
    "DRS076": {"fever", "dengue"},
    "DRS075": {"fever", "dengue"},
    "DRS078": {"fever", "dengue"},
    "DRS136": {"fever", "malaria"},
    "DRS135": {"fever", "malaria"},
    "DRS192": {"fever", "typhoid"},
    "DRS193": {"fever", "typhoid"},
}


def http_json(url: str):
    req = urllib.request.Request(url, headers={"Accept": "application/json", "Cache-Control": "no-cache"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode())


def fetch_html(url: str) -> str:
    req = urllib.request.Request(url, headers={"Accept": "text/html"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read().decode("utf-8", "ignore")


def extract_form_payload(html: str) -> dict:
    payload = defaultdict(list)
    for m in re.finditer(r"<input\b([^>]*)>", html, re.I):
        tag = m.group(1)
        nm = re.search(r'\bname=["\']([^"\']+)["\']', tag, re.I)
        if not nm:
            continue
        name = nm.group(1)
        typ = (re.search(r'\btype=["\']([^"\']+)["\']', tag, re.I) or [None, "text"])[1].lower()
        if typ in ("submit", "button", "file", "image"):
            continue
        if typ == "checkbox":
            if "checked" in tag.lower():
                val = re.search(r'\bvalue=["\']([^"\']*)["\']', tag, re.I)
                payload[name].append(val.group(1) if val else "true")
            continue
        if typ == "radio":
            if "checked" in tag.lower():
                val = re.search(r'\bvalue=["\']([^"\']*)["\']', tag, re.I)
                payload[name].append(val.group(1) if val else "")
            continue
        val = re.search(r'\bvalue=["\']([^"\']*)["\']', tag, re.I)
        payload[name].append(html_lib.unescape(val.group(1) if val else ""))

    for m in re.finditer(r"<textarea\b([^>]*)>(.*?)</textarea>", html, re.I | re.S):
        tag, body = m.group(1), m.group(2)
        nm = re.search(r'\bname=["\']([^"\']+)["\']', tag, re.I)
        if not nm:
            continue
        payload[nm.group(1)].append(html_lib.unescape(body))

    for m in re.finditer(r"<select\b([^>]*)>(.*?)</select>", html, re.I | re.S):
        tag, body = m.group(1), m.group(2)
        nm = re.search(r'\bname=["\']([^"\']+)["\']', tag, re.I)
        if not nm:
            continue
        name = nm.group(1)
        sels = re.findall(r'<option[^>]*selected[^>]*value=["\']([^"\']*)["\']', body, re.I)
        sels += re.findall(r'<option[^>]*value=["\']([^"\']*)["\'][^>]*selected', body, re.I)
        seen = set()
        ordered = []
        for s in sels:
            if s not in seen:
                seen.add(s)
                ordered.append(s)
        if not ordered:
            fo = re.search(r'<option[^>]*value=["\']([^"\']*)["\']', body, re.I)
            if fo:
                ordered = [fo.group(1)]
        for s in ordered:
            payload[name].append(html_lib.unescape(s))
    return payload


def save_payload(payload: dict, referer: str) -> None:
    pairs = []
    for k, vals in payload.items():
        for v in vals:
            pairs.append((k, v))
    body = urllib.parse.urlencode(pairs).encode()
    req = urllib.request.Request(
        f"{CMS}/tests/save",
        data=body,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": CMS,
            "Referer": referer,
        },
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        if resp.status >= 400:
            raise RuntimeError(f"save failed {resp.status}")


def load_catalog() -> List[dict]:
    cat = http_json(f"{CMS}/api/v1/public/catalog")
    items = []
    for t in cat.get("tests") or []:
        detail = http_json(f"{CMS}/api/v1/public/catalog/tests/{t['slug']}")["test"]
        attrs = detail.get("attributesJson") or {}
        code = (attrs.get("internalCode") or "").strip().upper()
        items.append(
            {
                "id": str(detail["id"]),
                "slug": detail["slug"],
                "name": detail["name"],
                "code": code,
                "testType": detail.get("testType") or "Test",
                "customizable": bool(detail.get("customizable")),
                "categories": [c.lower() for c in (attrs.get("testCategories") or [])],
                "filters": [f.lower() for f in (detail.get("filters") or [])],
                "related": [r.get("slug") for r in (detail.get("related") or [])],
                "affinity": set(AFFINITY.get(code, set())),
            }
        )
        time.sleep(0.05)
    return items


def infer_affinity_from_name(name: str, categories: List[str], filters: List[str]) -> Set[str]:
    blob = " ".join([name.lower(), *categories, *filters])
    tags: Set[str] = set()
    rules = [
        (("dengue", "ns1"), {"fever", "dengue"}),
        (("malaria",), {"fever", "malaria"}),
        (("widal", "typhoid"), {"fever", "typhoid"}),
        (("glucose", "hba1c", "diabet", "insulin", "c-peptide"), {"diabetes", "metabolic"}),
        (("lipid", "cholesterol", "homocyst"), {"heart", "lipid", "metabolic"}),
        (("thyroid", "tsh"), {"thyroid"}),
        (("kidney", "kft", "creatinine", "urea", "uric", "albumin"), {"kidney"}),
        (("liver", "lft", "amylase", "lipase"), {"liver"}),
        (("cbc", "hemoglobin", "platelet", "smear"), {"blood"}),
        (("iron", "ferritin"), {"anemia", "iron"}),
        (("vitamin", "folate", "b12", "calcium", "phosphorus"), {"vitamin", "bone"}),
        (("crp", "esr", "rheumatoid", "anti-ccp", "procalcitonin"), {"inflammation"}),
        (("estradiol", "progesterone", "prolactin", "women"), {"hormone", "women"}),
        (("urine", "cue"), {"urine"}),
        (("fever", "infection"), {"fever"}),
        (("men", "women", "wellness", "check", "vital", "ortho"), {"wellness"}),
    ]
    for keys, add in rules:
        if any(k in blob for k in keys):
            tags |= add
    return tags


def pick_related(item: dict, by_code: Dict[str, dict], all_items: List[dict]) -> List[str]:
    """Return list of related test IDs."""
    self_id = item["id"]
    chosen_ids: List[str] = []

    # 1) Explicit map by code
    for code in RELATED_BY_CODE.get(item["code"], []):
        other = by_code.get(code)
        if other and other["id"] != self_id and other["id"] not in chosen_ids:
            chosen_ids.append(other["id"])
        if len(chosen_ids) >= MAX_RELATED:
            return chosen_ids

    # Special profile pairings by slug
    slug_pairs = {
        "men-s-health-test": ["custom-men-s-health-test", "cbc", "lipid-profile-serum"],
        "custom-men-s-health-test": ["men-s-health-test", "cbc", "lipid-profile-serum"],
        "women-s-health-test": ["custom-women-s-health-test", "thyroid-profile-total", "cbc"],
        "custom-women-s-health-test": ["women-s-health-test", "estradiol-e2-serum", "thyroid-profile-total"],
        "drs-check-72": ["drs-check-42", "drs-wellness", "cbc"],
        "drs-check-42": ["drs-check-72", "drs-vital", "cbc"],
        "drs-wellness": ["drs-vital", "drs-check-42", "lipid-profile-serum"],
        "drs-vital": ["drs-wellness", "drs-fever", "cbc"],
        "drs-fever": ["dengue-ns1-rapid", "cbc", "c-reactive-protein-crp-serum"],
        "drs-diabetic": ["glycosylated-hemoglobin-ghb-hba1c-wb-edta", "glucose-blood-fasting", "lipid-profile-serum"],
        "drs-ortho": ["25-hydroxy-vitamin-d-serum", "calcium-serum", "cbc"],
    }
    by_slug = {x["slug"]: x for x in all_items}
    for slug in slug_pairs.get(item["slug"], []):
        other = by_slug.get(slug)
        if other and other["id"] != self_id and other["id"] not in chosen_ids:
            chosen_ids.append(other["id"])
        if len(chosen_ids) >= MAX_RELATED:
            return chosen_ids

    # 2) Affinity scoring fallback
    my_tags = set(item["affinity"]) | infer_affinity_from_name(
        item["name"], item["categories"], item["filters"]
    )
    if not my_tags:
        my_tags = {"wellness"}

    scored: List[Tuple[int, str, str]] = []
    for other in all_items:
        if other["id"] == self_id or other["id"] in chosen_ids:
            continue
        # Prefer leaf tests as related suggestions for profiles and vice versa lightly
        other_tags = set(other["affinity"]) | infer_affinity_from_name(
            other["name"], other["categories"], other["filters"]
        )
        overlap = len(my_tags & other_tags)
        if overlap <= 0:
            continue
        score = overlap * 10
        # Prefer same type neighbors slightly less for profiles (mix leaf + profile)
        if item["testType"] == "Profile" and other["testType"] == "Test":
            score += 3
        if item["testType"] == "Test" and other["testType"] == "Test":
            score += 2
        # Prefer popular-ish core panels
        if other["code"] in {"DRS048", "DRS131", "DRS094", "DRS173", "DRS127", "DRS133", "DRS062"}:
            score += 2
        scored.append((score, other["name"], other["id"]))

    scored.sort(key=lambda x: (-x[0], x[1]))
    for _, _, oid in scored:
        if oid not in chosen_ids:
            chosen_ids.append(oid)
        if len(chosen_ids) >= MAX_RELATED:
            break

    return chosen_ids


def main() -> int:
    print("Loading Live catalog…")
    items = load_catalog()
    by_code = {i["code"]: i for i in items if i["code"]}
    print(f"Loaded {len(items)} Live tests")

    updated = 0
    skipped = 0
    errors: List[str] = []

    for item in items:
        related_ids = pick_related(item, by_code, items)
        if not related_ids:
            print(f"· skip {item['slug']} (no related candidates)")
            skipped += 1
            continue

        current_ids = []
        # resolve current related slugs to ids
        by_slug = {x["slug"]: x["id"] for x in items}
        for slug in item["related"]:
            if slug in by_slug:
                current_ids.append(by_slug[slug])

        if current_ids == related_ids:
            print(f"· ok   {item['slug']} already set")
            skipped += 1
            continue

        try:
            referer = f"{CMS}/tests/edit/{item['id']}"
            payload = extract_form_payload(fetch_html(referer))
            if not payload.get("id"):
                raise RuntimeError("missing id on edit form")

            # Preserve includedTests already checked in form extraction.
            # Only replace frequently purchased together.
            payload["frequentlyPurchasedTests"] = related_ids

            save_payload(payload, referer)
            time.sleep(0.35)

            after = http_json(f"{CMS}/api/v1/public/catalog/tests/{item['slug']}")["test"]
            after_slugs = [r.get("slug") for r in (after.get("related") or [])]
            # sanity: included children count for profiles should not drop to 0 if previously had many
            print(f"✓ {item['slug']}: {item['related']} → {after_slugs}")
            updated += 1
        except Exception as exc:  # noqa: BLE001
            msg = f"{item['slug']}: {exc}"
            errors.append(msg)
            print(f"✗ {msg}", file=sys.stderr)

    print("\n=== SUMMARY ===")
    print(f"updated={updated} skipped={skipped} errors={len(errors)}")
    if errors:
        for e in errors:
            print(" ", e)
        return 1
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except urllib.error.URLError as exc:
        print(f"CMS unreachable: {exc}", file=sys.stderr)
        raise SystemExit(1)
