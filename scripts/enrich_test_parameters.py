#!/usr/bin/env python3
"""
Carefully enrich CMS LabTest Parameters (What's Tested biomarkers) for Live leaf tests.

- Only updates parametersText + numberOfParameters via the CMS edit form.
- Preserves FAQs, related tests, preparation, fasting flags, prices, categories, etc.
- Skips Profiles and tests that already have curated multi-marker content.
- Safe to re-run: skips when existing markers already match the curated list.
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
from typing import Dict, List, Tuple

CMS = "http://localhost:8080"

# Curated biomarkers by internal test code. Format: (name, short description)
# Keep clinical and conservative — editors can refine later in CMS.
PARAMS_BY_CODE: Dict[str, List[Tuple[str, str]]] = {
    # Vitamins / minerals
    "DRS002": [
        ("25-Hydroxy Vitamin D", "Circulating vitamin D used to assess bone and muscle health status"),
    ],
    "DRS190": [
        ("Vitamin B12", "Cobalamin level linked to anemia, neuropathy, and energy metabolism"),
    ],
    "DRS087": [
        ("Folate (Folic Acid)", "Serum folate involved in red-cell production and DNA synthesis"),
    ],
    "DRS041": [
        ("Calcium", "Serum calcium for bone, nerve, and muscle function assessment"),
    ],
    "DRS142": [
        ("Phosphorus", "Serum inorganic phosphorus related to bone and kidney mineral balance"),
    ],
    # Inflammation / autoimmune
    "DRS081": [
        ("ESR", "Erythrocyte sedimentation rate — nonspecific inflammation marker"),
    ],
    "DRS062": [
        ("C-Reactive Protein (CRP)", "Acute-phase protein that rises with inflammation or infection"),
    ],
    "DRS160": [
        ("Rheumatoid Factor (RF)", "Autoantibody associated with rheumatoid arthritis screening"),
    ],
    "DRS024": [
        ("Anti-CCP", "Cyclic citrullinated peptide antibody for rheumatoid arthritis support"),
    ],
    "DRS145": [
        ("Procalcitonin", "Marker that can help assess bacterial infection severity"),
    ],
    "DRS115": [
        ("Total IgE", "Immunoglobulin E associated with allergy and atopic conditions"),
    ],
    # Blood counts / smear / group
    "DRS048": [
        ("Hemoglobin", "Oxygen-carrying protein in red blood cells"),
        ("RBC Count", "Red blood cell concentration"),
        ("WBC Count", "White blood cell concentration"),
        ("Platelet Count", "Platelets involved in clotting"),
        ("Hematocrit (PCV)", "Proportion of blood made up of red cells"),
        ("MCV", "Mean corpuscular volume — average red-cell size"),
        ("MCH", "Mean corpuscular hemoglobin"),
        ("MCHC", "Mean corpuscular hemoglobin concentration"),
        ("RDW", "Red-cell distribution width"),
        ("Neutrophils", "Differential white-cell component"),
        ("Lymphocytes", "Differential white-cell component"),
        ("Monocytes", "Differential white-cell component"),
        ("Eosinophils", "Differential white-cell component"),
        ("Basophils", "Differential white-cell component"),
    ],
    "DRS100": [
        ("Hemoglobin", "Oxygen-carrying protein in red blood cells"),
    ],
    "DRS143": [
        ("Platelet Count", "Platelets involved in clotting and bleeding risk assessment"),
    ],
    "DRS036": [
        ("RBC Morphology", "Red-cell shape and appearance on peripheral smear"),
        ("WBC Morphology", "White-cell appearance on peripheral smear"),
        ("Platelet Estimate", "Platelet adequacy estimate on smear"),
        ("Parasite Screen", "Smear review for blood parasites when clinically indicated"),
    ],
    "DRS035": [
        ("ABO Blood Group", "A, B, AB, or O blood group"),
        ("Rh (D) Type", "Rh-positive or Rh-negative typing"),
    ],
    # Glucose / diabetes
    "DRS091": [
        ("Fasting Blood Glucose", "Glucose after overnight fasting"),
    ],
    "DRS092": [
        ("Post-Prandial Blood Glucose", "Glucose measured after a meal (typically 2 hours)"),
    ],
    "DRS093": [
        ("Random Blood Glucose", "Glucose measured without fasting requirement"),
    ],
    "DRS191": [
        ("Urine Glucose", "Glucose detected in urine"),
    ],
    "DRS094": [
        ("HbA1c (Glycosylated Hemoglobin)", "Average glucose control over ~2–3 months"),
    ],
    "DRS061": [
        ("C-Peptide", "Marker of endogenous insulin production"),
    ],
    "DRS120": [
        ("Insulin", "Serum insulin level used in metabolic evaluation"),
    ],
    # Kidney / liver / lipid / electrolytes
    "DRS127": [
        ("Urea", "Kidney waste marker"),
        ("Creatinine", "Kidney filtration marker"),
        ("Uric Acid", "Purine metabolite related to gout and kidney status"),
        ("Sodium", "Serum electrolyte"),
        ("Potassium", "Serum electrolyte"),
        ("Chloride", "Serum electrolyte"),
        ("Calcium", "Often included in KFT panels"),
        ("Phosphorus", "Often included in KFT panels"),
    ],
    "DRS066": [
        ("Creatinine", "Kidney filtration marker"),
    ],
    "DRS187": [
        ("Urea", "Kidney waste marker"),
    ],
    "DRS188": [
        ("Uric Acid", "Purine metabolite related to gout and kidney status"),
    ],
    "DRS133": [
        ("Total Bilirubin", "Liver pigment marker"),
        ("Direct Bilirubin", "Conjugated bilirubin"),
        ("Indirect Bilirubin", "Unconjugated bilirubin"),
        ("AST (SGOT)", "Liver enzyme"),
        ("ALT (SGPT)", "Liver enzyme"),
        ("ALP", "Alkaline phosphatase"),
        ("Total Protein", "Serum protein"),
        ("Albumin", "Major serum protein made by the liver"),
        ("Globulin", "Calculated/measured serum globulin"),
        ("A/G Ratio", "Albumin to globulin ratio"),
    ],
    "DRS131": [
        ("Total Cholesterol", "Overall cholesterol level"),
        ("HDL Cholesterol", "High-density lipoprotein cholesterol"),
        ("LDL Cholesterol", "Low-density lipoprotein cholesterol"),
        ("Triglycerides", "Blood fats"),
        ("VLDL Cholesterol", "Very-low-density lipoprotein cholesterol"),
        ("Cholesterol/HDL Ratio", "Cardiovascular risk ratio"),
    ],
    "DRS080": [
        ("Sodium", "Serum electrolyte"),
        ("Potassium", "Serum electrolyte"),
        ("Chloride", "Serum electrolyte"),
        ("Bicarbonate", "Acid–base related electrolyte when reported"),
    ],
    "DRS011": [
        ("Amylase", "Pancreatic/salivary enzyme"),
    ],
    "DRS130": [
        ("Lipase", "Pancreatic enzyme"),
    ],
    "DRS065": [
        ("Creatine Kinase (CPK)", "Muscle enzyme that can rise with muscle injury"),
    ],
    "DRS114": [
        ("Homocysteine", "Amino acid linked to cardiovascular risk discussions"),
    ],
    # Thyroid / hormones
    "DRS173": [
        ("Total T3", "Total triiodothyronine"),
        ("Total T4", "Total thyroxine"),
        ("TSH", "Thyroid-stimulating hormone"),
    ],
    "DRS174": [
        ("TSH", "Thyroid-stimulating hormone"),
    ],
    "DRS146": [
        ("Progesterone", "Reproductive hormone"),
    ],
    "DRS147": [
        ("Prolactin", "Pituitary hormone related to lactation and cycle health"),
    ],
    "DRS082": [
        ("Estradiol (E2)", "Primary estrogen measured in serum"),
    ],
    # Urine
    "DRS056": [
        ("Urine Color & Appearance", "Gross urine characteristics"),
        ("Urine pH", "Acidity/alkalinity of urine"),
        ("Specific Gravity", "Urine concentration"),
        ("Urine Protein", "Protein on dipstick/chemistry"),
        ("Urine Glucose", "Glucose on dipstick/chemistry"),
        ("Urine Ketones", "Ketone bodies"),
        ("Urine Bilirubin", "Bilirubin on urine strip"),
        ("Urobilinogen", "Urobilinogen on urine strip"),
        ("Urine Blood", "Occult blood on strip"),
        ("Nitrite", "Often associated with bacteriuria"),
        ("Leukocyte Esterase", "Suggests white cells in urine"),
        ("Microscopy – RBCs", "Red cells on microscopic exam"),
        ("Microscopy – WBCs", "White cells on microscopic exam"),
        ("Microscopy – Casts/Crystals", "Casts and crystals when present"),
    ],
    "DRS137": [
        ("Urine Albumin", "Low-level albumin excretion"),
        ("Urine Creatinine", "Used to normalize albumin excretion"),
        ("Albumin/Creatinine Ratio (ACR)", "Microalbuminuria index"),
    ],
    "DRS151": [
        ("Urine Protein", "Spot urine protein"),
        ("Urine Creatinine", "Spot urine creatinine"),
        ("Protein/Creatinine Ratio", "Proteinuria index from spot sample"),
    ],
    # Infection / fever
    "DRS077": [
        ("NS1 Antigen", "Early dengue antigen marker (typically first days of fever)"),
    ],
    "DRS076": [
        ("Dengue IgM Antibody", "IgM response often associated with recent dengue exposure"),
    ],
    "DRS075": [
        ("Dengue IgG Antibody", "IgG response associated with dengue exposure history"),
    ],
    "DRS078": [
        ("NS1 Antigen", "Early dengue antigen marker"),
        ("Dengue IgM", "IgM antibody component of dengue profile"),
        ("Dengue IgG", "IgG antibody component of dengue profile"),
    ],
    "DRS136": [
        ("Malarial Parasite Identification", "Microscopic identification of malaria parasites"),
    ],
    "DRS135": [
        ("P. falciparum Antigen", "Falciparum malaria antigen"),
        ("P. vivax Antigen", "Vivax malaria antigen"),
    ],
    "DRS192": [
        ("Salmonella typhi O", "Widal O antigen titre"),
        ("Salmonella typhi H", "Widal H antigen titre"),
        ("S. paratyphi A (H)", "Paratyphoid A titre when reported"),
        ("S. paratyphi B (H)", "Paratyphoid B titre when reported"),
    ],
    "DRS193": [
        ("Salmonella typhi O", "Widal O antigen titre (tube method)"),
        ("Salmonella typhi H", "Widal H antigen titre (tube method)"),
        ("S. paratyphi A (H)", "Paratyphoid A titre when reported"),
        ("S. paratyphi B (H)", "Paratyphoid B titre when reported"),
    ],
    # Iron profiles (already good — keep explicit for re-run safety)
    "DRS125": [
        ("Serum Iron", "Circulating iron"),
        ("Ferritin", "Iron storage protein"),
    ],
    "DRS126": [
        ("Serum Iron", "Circulating iron"),
        ("TIBC", "Total iron-binding capacity"),
        ("Ferritin", "Iron storage protein"),
    ],
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
        # de-dupe while preserving order
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


def format_parameters_text(params: List[Tuple[str, str]]) -> str:
    lines = []
    for name, desc in params:
        name = name.strip()
        desc = (desc or "").strip()
        if not name:
            continue
        lines.append(f"{name} | {desc}" if desc else name)
    return "\n".join(lines)


def current_marker_names(detail: dict) -> List[str]:
    names = []
    for group in detail.get("whatsTested") or []:
        for m in group.get("markers") or []:
            n = (m.get("name") or "").strip()
            if n:
                names.append(n)
    return names


def needs_update(test_name: str, current: List[str], curated: List[Tuple[str, str]]) -> bool:
    curated_names = [n for n, _ in curated]
    if not current:
        return True
    # Placeholder: single marker equal to test name
    if len(current) == 1 and current[0].strip().lower() == test_name.strip().lower():
        return True
    # Already exact curated set
    if [c.lower() for c in current] == [c.lower() for c in curated_names]:
        return False
    # If curated is richer and current looks incomplete / old placeholder-ish
    if len(curated_names) > len(current):
        return True
    # If names differ but curated exists, refresh carefully when current is a weak single analyte rename
    if len(current) == 1 and len(curated_names) == 1 and current[0].lower() != curated_names[0].lower():
        return True
    # Multi already present and count matches — leave alone unless names are clearly the old test-name blob
    if len(current) >= 2 and len(current) >= len(curated_names):
        return False
    return True


def save_payload(payload: dict) -> None:
    pairs = []
    for k, vals in payload.items():
        for v in vals:
            pairs.append((k, v))
    body = urllib.parse.urlencode(pairs).encode()
    test_id = (payload.get("id") or [""])[0]
    req = urllib.request.Request(
        f"{CMS}/tests/save",
        data=body,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Origin": CMS,
            "Referer": f"{CMS}/tests/edit/{test_id}",
        },
    )
    with urllib.request.urlopen(req, timeout=90) as resp:
        if resp.status >= 400:
            raise RuntimeError(f"save failed status={resp.status}")


def main() -> int:
    catalog = http_json(f"{CMS}/api/v1/public/catalog")
    tests = catalog.get("tests") or []
    updated = []
    skipped = []
    missing_map = []
    errors = []

    for item in tests:
        if str(item.get("testType") or "").lower() != "test":
            continue
        slug = item["slug"]
        detail = http_json(f"{CMS}/api/v1/public/catalog/tests/{slug}")["test"]
        code = ((detail.get("attributesJson") or {}).get("internalCode") or "").strip().upper()
        if not code or code not in PARAMS_BY_CODE:
            missing_map.append(f"{detail.get('id')} {slug} code={code or '-'}")
            continue

        curated = PARAMS_BY_CODE[code]
        current = current_marker_names(detail)
        if not needs_update(detail.get("name") or "", current, curated):
            skipped.append(f"{slug} (already ok: {len(current)} markers)")
            continue

        test_id = detail["id"]
        try:
            html = fetch_html(f"{CMS}/tests/edit/{test_id}")
            payload = extract_form_payload(html)
            if not payload.get("id"):
                raise RuntimeError("edit form missing id")

            # Only overwrite parameters + parameter count. Keep every other posted field as-is.
            payload["parametersText"] = [format_parameters_text(curated)]
            payload["numberOfParameters"] = [str(len(curated))]

            save_payload(payload)
            time.sleep(0.35)

            after = http_json(f"{CMS}/api/v1/public/catalog/tests/{slug}")["test"]
            after_names = current_marker_names(after)
            faqs_before = len(detail.get("faqs") or [])
            faqs_after = len(after.get("faqs") or [])
            related_before = [r.get("slug") for r in (detail.get("related") or [])]
            related_after = [r.get("slug") for r in (after.get("related") or [])]
            if faqs_after < faqs_before:
                errors.append(f"{slug}: FAQ count dropped {faqs_before}->{faqs_after}")
            if related_after != related_before:
                errors.append(f"{slug}: related changed {related_before}->{related_after}")
            updated.append(f"{slug}: {current} -> {after_names}")
            print(f"✓ {slug}: {len(current)} -> {len(after_names)} markers")
        except Exception as exc:  # noqa: BLE001
            errors.append(f"{slug}: {exc}")
            print(f"✗ {slug}: {exc}", file=sys.stderr)

    print("\n=== SUMMARY ===")
    print(f"updated={len(updated)} skipped={len(skipped)} missing_map={len(missing_map)} errors={len(errors)}")
    if missing_map:
        print("missing map:")
        for line in missing_map:
            print(" ", line)
    if errors:
        print("errors:")
        for line in errors:
            print(" ", line)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
