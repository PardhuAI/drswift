#!/usr/bin/env python3
"""Seed DrSwift CMS Live catalog from Category test list CSVs."""

from __future__ import annotations

import csv
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

CMS = "http://localhost:8080"
BASE = Path("/Users/pardhukarnati/Documents/swift_diagnostics/New_Dr_Swift_Website")
TEST_CSV = BASE / "Category test list-Test List.csv"
PROFILE_CSV = BASE / "Category test list-Profiles.csv"
CATEGORY_CSV = BASE / "Category test list-Category List.csv"

IMAGES = {
    "blood": "https://images.pexels.com/photos/4226119/pexels-photo-4226119.jpeg?auto=compress&cs=tinysrgb&w=800",
    "urine": "https://images.pexels.com/photos/7723512/pexels-photo-7723512.jpeg?auto=compress&cs=tinysrgb&w=800",
    "heart": "https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=800",
    "thyroid": "https://images.pexels.com/photos/8460157/pexels-photo-8460157.jpeg?auto=compress&cs=tinysrgb&w=800",
    "diabetes": "https://images.pexels.com/photos/6941883/pexels-photo-6941883.jpeg?auto=compress&cs=tinysrgb&w=800",
    "fever": "https://images.pexels.com/photos/3993212/pexels-photo-3993212.jpeg?auto=compress&cs=tinysrgb&w=800",
    "bone": "https://images.pexels.com/photos/7089020/pexels-photo-7089020.jpeg?auto=compress&cs=tinysrgb&w=800",
    "women": "https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=800",
    "vitamin": "https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?auto=compress&cs=tinysrgb&w=800",
    "kidney": "https://images.pexels.com/photos/8460039/pexels-photo-8460039.jpeg?auto=compress&cs=tinysrgb&w=800",
    "liver": "https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=800",
    "general": "https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=800",
    "profile": "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800",
}

# Approximate INR list prices (original / discounted) by test code.
PRICE_BY_CODE = {
    "DRS002": (1650, 1400),
    "DRS041": (180, 125),
    "DRS081": (120, 85),
    "DRS091": (80, 55),
    "DRS094": (550, 460),
    "DRS048": (350, 245),
    "DRS127": (550, 460),
    "DRS131": (850, 700),
    "DRS133": (600, 490),
    "DRS173": (550, 470),
    "DRS056": (150, 105),
    "DRS126": (850, 650),
    "DRS190": (1100, 960),
    "DRS011": (450, 350),
    "DRS130": (500, 390),
    "DRS187": (180, 120),
    "DRS188": (220, 160),
    "DRS146": (700, 560),
    "DRS082": (750, 600),
    "DRS147": (700, 560),
    "DRS151": (450, 360),
    "DRS160": (550, 420),
    "DRS142": (220, 160),
    "DRS066": (200, 140),
    "DRS035": (250, 180),
    "DRS024": (1400, 1150),
    "DRS036": (350, 280),
    "DRS061": (1200, 980),
    "DRS062": (450, 350),
    "DRS065": (550, 420),
    "DRS078": (1600, 1299),
    "DRS077": (900, 750),
    "DRS076": (1100, 900),
    "DRS075": (1100, 900),
    "DRS080": (500, 390),
    "DRS087": (900, 750),
    "DRS092": (90, 65),
    "DRS093": (90, 65),
    "DRS100": (120, 85),
    "DRS114": (1400, 1150),
    "DRS115": (900, 720),
    "DRS120": (950, 780),
    "DRS145": (2200, 1850),
    "DRS143": (180, 130),
    "DRS137": (650, 520),
    "DRS136": (450, 350),
    "DRS135": (550, 420),
    "DRS174": (350, 280),
    "DRS125": (750, 580),
    "DRS191": (80, 55),
    "DRS192": (350, 280),
    "DRS193": (450, 360),
    "DRSP001": (999, 799),
    "DRSP002": (4999, 3999),
    "DRSP003": (2499, 1999),
    "DRSP004": (2999, 2399),
    "DRSP005": (3499, 2799),
    "DRSP006": (1999, 1599),
    "DRSP007": (2499, 1999),
}

NAME_ALIASES = {
    "cbc": ["cbc", "cbp", "complete blood count", "complete blood count cbc"],
    "complete urine analysis": [
        "complete urine analysis",
        "complete urine analysis cue",
        "complete urine analysis cue urine",
        "cue",
    ],
    "glucose blood fasting": ["glucose blood fasting", "glucose fasting", "glucose - fasting"],
    "glycosylated hemoglobin ghb hba1c wb edta": [
        "glycosylated hemoglobin ghb hba1c wb edta",
        "glycosylated hemoglobin ghb hba1c",
        "hba1c",
    ],
    "lipid profile serum": ["lipid profile serum", "lipid profile"],
    "liver function test lft serum": ["liver function test lft serum", "liver function test lft", "lft"],
    "kidney function test kft serum": [
        "kidney function test kft serum",
        "kidney function test kft",
        "kidney function test kft i",
        "kft",
    ],
    "thyroid profile total": ["thyroid profile total", "thyroid profile i", "thyroid profile"],
    "25 hydroxy vitamin d serum": ["25 hydroxy vitamin d serum", "25 hydroxy vitamin d"],
    "vitamin b12 serum": ["vitamin b12 serum", "vitamin b12"],
    "iron defficiency profile ii": [
        "iron defficiency profile ii",
        "iron deficiency profile ii",
        "iron deficiency profile-ii",
    ],
    "dengue ns1 rapid": [
        "dengue ns1 rapid",
        "dengue ns1 antigen antibody rapid",
        "dengue ns1 antigen / antibody rapid",
    ],
    "widal test slide test serum": [
        "widal test slide test serum",
        "widal slide test for salmonella typhi",
        "widal slide test",
    ],
    "malarial falciparum and vivax antigen parasite v f": [
        "malarial falciparum and vivax antigen parasite v f",
        "malarial falciparum and vivax antigen pv pf",
        "malarial falciparum and vivax antigen",
    ],
    "thyroid stimulating hormone tsh serum": [
        "thyroid stimulating hormone tsh serum",
        "tsh",
    ],
    "glucose urine": ["glucose urine", "glucose urine fasting"],
}


def norm(text: str) -> str:
    text = (text or "").lower()
    text = text.replace("&", " and ")
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def slugify(name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", (name or "").lower()).strip("-")
    return s or "test"


def pick_image(name: str, categories: list[str]) -> str:
    blob = " ".join([name] + categories).lower()
    if any(k in blob for k in ("urine", "widal", "malaria", "dengue")):
        return IMAGES["urine"] if "urine" in blob else IMAGES["fever"]
    if any(k in blob for k in ("lipid", "heart", "homocysteine", "cpk")):
        return IMAGES["heart"]
    if "thyroid" in blob or "tsh" in blob:
        return IMAGES["thyroid"]
    if any(k in blob for k in ("glucose", "hba1c", "insulin", "c-peptide", "diabet")):
        return IMAGES["diabetes"]
    if any(k in blob for k in ("vitamin", "folate", "b12")):
        return IMAGES["vitamin"]
    if any(k in blob for k in ("kidney", "creatinine", "urea", "uric", "albumin")):
        return IMAGES["kidney"]
    if "liver" in blob or "amylase" in blob or "lipase" in blob:
        return IMAGES["liver"]
    if any(k in blob for k in ("estradiol", "progesterone", "prolactin", "women", "fertility")):
        return IMAGES["women"]
    if any(k in blob for k in ("calcium", "phosphorus", "vitamin d", "bone", "ra ", "rheumatoid", "anti-ccp")):
        return IMAGES["bone"]
    if "profile" in blob or "check" in blob or "wellness" in blob:
        return IMAGES["profile"]
    return IMAGES["blood"] if "blood" in blob or "cbc" in blob or "platelet" in blob or "hemoglobin" in blob else IMAGES["general"]


def sample_type_for(name: str) -> str:
    n = name.lower()
    if "urine" in n:
        return "Urine"
    if any(k in n for k in ("cbc", "cbp", "hemoglobin", "platelet", "blood picture", "malarial", "esr")):
        return "Blood"
    if "blood" in n and "urine" not in n:
        return "Blood"
    return "Blood"


def fasting_for(name: str, code: str) -> tuple[bool, bool]:
    n = name.lower()
    if any(k in n for k in ("fasting", "lipid", "insulin", "glucose-blood-fasting", "hba1c")):
        return True, True
    if code in {"DRS091", "DRS094", "DRS131", "DRS120", "DRS061"}:
        return True, True
    return False, False


def prices_for(code: str, fallback_seed: str) -> tuple[int, int]:
    if code in PRICE_BY_CODE:
        return PRICE_BY_CODE[code]
    seed = sum(ord(c) for c in fallback_seed) % 700
    original = 400 + seed
    discounted = int(original * 0.8)
    return original, discounted


def short_description(name: str, symptoms: str) -> str:
    symptom_bit = symptoms.strip()
    if not symptom_bit or symptom_bit.lower().startswith("not symptom"):
        return f"{name} is a diagnostic laboratory test offered with at-home sample collection through Dr.Swift."
    first = symptom_bit.split(",")[0].strip()
    return f"{name} helps evaluate concerns such as {first.lower()} and related clinical findings."


def long_description(name: str, symptoms: str) -> str:
    base = short_description(name, symptoms)
    if symptoms and not symptoms.lower().startswith("not symptom"):
        return (
            f"{base} Common reasons to order this test include: {symptoms.strip()}. "
            "Results are reviewed with a clinician for next steps."
        )
    return (
        f"{base} Useful for routine screening, clinical follow-up, and preventive care. "
        "Discuss abnormal values with your doctor."
    )


def preparation_for(name: str, fasting: bool, no_alcohol: bool) -> str:
    parts = []
    if fasting:
        parts.append("Fast for 9-12 hours (water only) before sample collection unless advised otherwise.")
    else:
        parts.append("No fasting required unless this test is paired with another fasting panel.")
    if no_alcohol:
        parts.append("Avoid alcohol for 24 hours before collection.")
    parts.append("Share current medicines and supplements during booking.")
    return " ".join(parts)


def faqs_for(name: str, fasting: bool) -> str:
    lines = [
        f"What does {name} measure? | It is a laboratory test used for screening or monitoring. Your clinician interprets the values in context.",
        "How will I get results? | Reports are shared digitally, typically within 24-48 hours after the sample reaches the lab.",
    ]
    if fasting:
        lines.insert(0, "Do I need to fast? | Yes. Fast for 9-12 hours with water only unless your care team advises a non-fasting collection.")
    else:
        lines.insert(0, "Do I need to fast? | Usually no, unless this test is booked with a fasting panel.")
    return "\n".join(lines)


def parse_symptoms(raw: str) -> list[str]:
    if not raw or raw.lower().startswith("not symptom"):
        return []
    parts = re.split(r"[,;/]| and ", raw)
    out = []
    for p in parts:
        s = p.strip(" .-")
        if s and s.lower() not in {"etc", "and"}:
            out.append(s[:120])
    return out[:8] or [raw.strip()[:120]]


def load_category_map() -> dict[str, set[str]]:
    mapping: dict[str, set[str]] = {}
    current = "General"
    with CATEGORY_CSV.open(encoding="utf-8-sig", newline="") as f:
        for row in csv.DictReader(f):
            cat = (row.get("Category") or "").strip()
            if cat:
                current = cat
            code = (row.get("Test Code") or "").strip()
            if not code:
                continue
            mapping.setdefault(code, set()).add(current)
    return mapping


def category_to_filters(categories: set[str]) -> tuple[list[str], list[str], list[str]]:
    """Return demographics, testCategories, website-ish labels."""
    demographics: set[str] = set()
    test_categories: set[str] = set()
    for cat in categories:
        key = cat.lower()
        if key in {"weakness", "fever", "pain", "cold", "cough"}:
            test_categories.add(cat)
        elif "diabet" in key:
            test_categories.add("Diabetes")
        else:
            test_categories.add(cat)
    # Heuristic demographics left empty unless women's hormones — handled by caller
    return sorted(demographics), sorted(test_categories or {"General"}), sorted(categories)


def demographics_for(name: str) -> list[str]:
    n = name.lower()
    if any(k in n for k in ("estradiol", "progesterone", "prolactin")):
        return ["Women"]
    if "men" in n and "women" not in n:
        return ["Men"]
    return ["Men", "Women"]


def http_json(url: str):
    with urllib.request.urlopen(url) as resp:
        return json.loads(resp.read().decode())


def post_form(fields: dict, multi: dict[str, list[str]] | None = None) -> None:
    pairs: list[tuple[str, str]] = []
    for k, v in fields.items():
        if v is None:
            continue
        pairs.append((k, str(v)))
    if multi:
        for k, values in multi.items():
            for v in values:
                pairs.append((k, str(v)))
    body = urllib.parse.urlencode(pairs).encode()
    req = urllib.request.Request(f"{CMS}/tests/save", data=body, method="POST")
    req.add_header("Content-Type", "application/x-www-form-urlencoded")
    try:
        urllib.request.urlopen(req)
    except urllib.error.HTTPError as e:
        if e.code not in (302, 303):
            raise


def build_index(tests: list[dict]) -> dict[str, dict]:
    index: dict[str, dict] = {}
    for t in tests:
        attrs = t.get("attributesJson") or {}
        code = (attrs.get("internalCode") or "").strip().upper()
        if code:
            index[f"code:{code}"] = t
        index[f"slug:{t.get('slug')}"] = t
        index[f"name:{norm(t.get('name') or '')}"] = t
        for alias_key, aliases in NAME_ALIASES.items():
            if norm(t.get("name") or "") in aliases or any(a == norm(t.get("name") or "") for a in aliases):
                for a in aliases:
                    index[f"alias:{a}"] = t
            if alias_key == norm(t.get("name") or ""):
                for a in aliases:
                    index[f"alias:{a}"] = t
    # Explicit alias registration from names
    for t in tests:
        n = norm(t.get("name") or "")
        for aliases in NAME_ALIASES.values():
            if n in aliases:
                for a in aliases:
                    index[f"alias:{a}"] = t
    return index


def find_existing(index: dict[str, dict], code: str, name: str):
    code = (code or "").strip().upper()
    if code and f"code:{code}" in index:
        return index[f"code:{code}"]
    n = norm(name)
    if f"name:{n}" in index:
        return index[f"name:{n}"]
    if f"alias:{n}" in index:
        return index[f"alias:{n}"]
    for aliases in NAME_ALIASES.values():
        if n in aliases:
            for a in aliases:
                if f"name:{a}" in index:
                    return index[f"name:{a}"]
                if f"alias:{a}" in index:
                    return index[f"alias:{a}"]
    # soft contains
    for key, t in index.items():
        if key.startswith("name:") and (n in key[5:] or key[5:] in n) and len(n) > 8:
            return t
    return None


def upsert_test(
    *,
    existing_id: str | None,
    name: str,
    code: str,
    symptoms: str,
    categories: set[str],
    test_type: str = "Test",
    included_ids: list[str] | None = None,
    customizable: bool = False,
    badge: str = "",
) -> None:
    fasting, no_alcohol = fasting_for(name, code)
    original, discounted = prices_for(code, name)
    cats = categories or {"General"}
    _, test_categories, _ = category_to_filters(cats)
    demos = demographics_for(name)
    fields = {
        "id": existing_id or "",
        "testName": name[:600],
        "testImagePath": pick_image(name, list(cats)),
        "shortDescription": short_description(name, symptoms)[:10000],
        "longDescription": long_description(name, symptoms)[:10000],
        "alternativeNames": "",
        "internalTestCode": code[:20],
        "externalTestCode": code[:20],
        "testStatus": "Live",
        "testType": test_type,
        "customizable": "true" if customizable else "false",
        "originalPrice": str(original),
        "hasDiscountedPrice": "true",
        "discountedPrice": str(discounted),
        "sampleType": sample_type_for(name) if test_type == "Test" else "Blood & Urine",
        "preparationText": preparation_for(name, fasting, no_alcohol),
        "collectionMethod": "At-home sample collection",
        "resultsTimeline": "24-48 hours after sample reaches the lab",
        "ageRange": "18+ recommended",
        "bookingNote": "Can be booked for family profiles",
        "faqsText": faqs_for(name, fasting),
        "parametersText": "",
        "symptomsText": "\n".join(parse_symptoms(symptoms)),
        "badge": badge,
        "numberOfTests": str(len(included_ids or []) or 1),
        "numberOfParameters": "1",
    }
    # When updating an existing Live test, do not blank out CMS-curated website fields.
    if existing_id:
        try:
            detail = http_json(f"{CMS}/api/v1/public/catalog/tests/{slugify(name)}")
            current = detail.get("test") or {}
            if current.get("preparation"):
                fields["preparationText"] = current["preparation"]
            if current.get("faqs"):
                fields["faqsText"] = "\n".join(
                    f"{f.get('question','')} | {f.get('answer','')}" for f in current["faqs"]
                )
            markers = []
            for group in current.get("whatsTested") or []:
                for m in group.get("markers") or []:
                    if m.get("name") and not str(m.get("name")).endswith(" parameters"):
                        desc = m.get("description") or ""
                        markers.append(f"{m['name']} | {desc}" if desc else m["name"])
            if markers:
                fields["parametersText"] = "\n".join(markers)
        except Exception:
            pass
    if fasting:
        fields["fastingRequired"] = "true"
    if no_alcohol:
        fields["noAlcohol"] = "true"

    multi = {
        "demographics": demos,
        "testCategories": test_categories[:6] or ["General"],
    }
    if included_ids:
        multi["includedTests"] = included_ids
    post_form(fields, multi)


def resolve_child_name(child: str) -> str:
    c = child.strip()
    c = re.sub(r"\s+", " ", c)
    # normalize common profile child labels to test-list names
    replacements = {
        "Glucose - Fasting": "Glucose-Blood-Fasting",
        "Glycosylated Hemoglobin (GHb/HbA1c)": "Glycosylated Hemoglobin (GHb/HbA1c)-WB-EDTA",
        "Complete Blood Count (CBC)": "CBC",
        "Complete Urine Analysis (CUE)": "Complete Urine Analysis",
        "Vitamin - B12 - Serum": "Vitamin-B12-Serum",
        "Iron Deficiency Profile-II": "Iron Defficiency Profile-II",
        "Lipid Profile": "Lipid Profile-Serum",
        "Liver Function Test (LFT)": "Liver Function Test (LFT)-Serum",
        "Thyroid Profile I": "Thyroid Profile-Total",
        "Kidney Function Test (KFT) - I": "Kidney Function Test (KFT)-Serum",
        "Kidney Function Test (KFT)": "Kidney Function Test (KFT)-Serum",
        "Calcium - Serum": "Calcium-Serum",
        "25 - Hydroxy Vitamin D - Serum": "25-Hydroxy Vitamin D-Serum",
        "Dengue Ns1 Antigen / Antibody - Rapid": "Dengue NS1 RAPID",
        "WIDAL slide test for Salmonella typhi": "Widal Test (Slide Test)- Serum",
        "Malarial Falciparum and Vivax Antigen (PV/PF)": "Malarial Falciparum and Vivax Antigen (Parasite V & F)",
        "Thyroid Stimulating Hormone (TSH) - Serum": "Thyroid Stimulating Hormone (TSH)-Serum",
        "Rheumatoid Factor (RA Test) - Serum": "Rheumatoid Factor (RA Test)-Serum",
        "Glucose-Urine -Fasting": "Glucose -Urine",
        "Erythrocyte Sedimentation Rate (ESR)": "Erythrocyte Sedimentation Rate (ESR)",
    }
    return replacements.get(c, c)


def main() -> None:
    print("Loading CSVs…")
    with TEST_CSV.open(encoding="utf-8-sig", newline="") as f:
        leaf_rows = list(csv.DictReader(f))
    with PROFILE_CSV.open(encoding="utf-8-sig", newline="") as f:
        profile_rows = list(csv.DictReader(f))
    cat_map = load_category_map()
    print(f"Leaf tests in CSV: {len(leaf_rows)}; Profiles: {len(profile_rows)}")

    catalog = http_json(f"{CMS}/api/v1/public/catalog")["tests"]
    index = build_index(catalog)
    print(f"Existing Live tests: {len(catalog)}")

    created = updated = 0
    for row in leaf_rows:
        code = (row.get("Test Code") or "").strip()
        name = (row.get("Test Name") or "").strip()
        symptoms = (row.get("Symptoms") or "").strip()
        if not name:
            continue
        cats = cat_map.get(code, set()) or {"General"}
        existing = find_existing(index, code, name)
        # Prefer canonical CSV name
        upsert_test(
            existing_id=str(existing["id"]) if existing else None,
            name=name,
            code=code,
            symptoms=symptoms,
            categories=cats,
            test_type="Test",
            badge="Popular" if code in {"DRS048", "DRS094", "DRS131", "DRS173"} else "",
        )
        if existing:
            updated += 1
            print(f"UPD {code} {name} (id={existing['id']})")
        else:
            created += 1
            print(f"NEW {code} {name}")
        time.sleep(0.15)

    # Refresh index after leaf upserts
    catalog = http_json(f"{CMS}/api/v1/public/catalog")["tests"]
    index = build_index(catalog)
    print(f"After leaf upsert Live count: {len(catalog)}")

    for row in profile_rows:
        code = (row.get("Test Code") or "").strip()
        name = (row.get("Profile Name") or "").strip()
        if not name:
            continue
        children_raw = [c.strip() for c in (row.get("Test Names") or "").splitlines() if c.strip()]
        included_ids: list[str] = []
        missing_children: list[str] = []
        for child in children_raw:
            resolved = resolve_child_name(child)
            found = find_existing(index, "", resolved) or find_existing(index, "", child)
            if found:
                included_ids.append(str(found["id"]))
            else:
                missing_children.append(child)
        symptoms = f"Preventive screening with {name}"
        existing = find_existing(index, code, name)
        upsert_test(
            existing_id=str(existing["id"]) if existing else None,
            name=name,
            code=code,
            symptoms=symptoms,
            categories={"Full Body", "Wellness"},
            test_type="Profile",
            included_ids=included_ids,
            customizable=False,
            badge="Package",
        )
        status = "UPD" if existing else "NEW"
        print(
            f"{status} PROFILE {code} {name} included={len(included_ids)} missing={missing_children}"
        )
        time.sleep(0.2)

    catalog = http_json(f"{CMS}/api/v1/public/catalog")["tests"]
    print("\nDone.")
    print(f"Leaf created≈{created}, updated≈{updated}")
    print(f"Live catalog now: {len(catalog)}")
    profiles = [t for t in catalog if t.get("testType") == "Profile"]
    print(f"Live profiles: {len(profiles)}")
    for t in sorted(catalog, key=lambda x: x.get("name") or ""):
        print(f" - {t['id']:>3} {t.get('testType'):7} {t.get('slug')}")


if __name__ == "__main__":
    main()
