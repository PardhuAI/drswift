#!/usr/bin/env python3
"""
Seed fixed + custom Women's Health profiles (and optionally refresh Custom Men's included set).

Uses the CMS HTML form POST so Included Tests / FAQs / related are preserved carefully.
Safe to re-run: updates by slug if Live catalog already has the profile.
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
from typing import Dict, List, Optional

CMS = "http://localhost:8080"

# Child leaf codes used for women's bundles
CORE8_CODES = [
    "DRS127",  # KFT
    "DRS133",  # LFT
    "DRS048",  # CBC
    "DRS056",  # Urine
    "DRS131",  # Lipid
    "DRS094",  # HbA1c
    "DRS091",  # Fasting glucose
    "DRS173",  # Thyroid profile total
]

CUSTOM_WOMEN_EXTRA_CODES = [
    "DRS082",  # Estradiol
    "DRS146",  # Progesterone
    "DRS147",  # Prolactin
    "DRS002",  # Vitamin D
    "DRS190",  # B12
    "DRS126",  # Iron II
    "DRS062",  # CRP
    "DRS041",  # Calcium
    "DRS081",  # ESR
]

CUSTOM_MEN_CODES = [
    "DRS002",
    "DRS041",
    "DRS048",
    "DRS056",
    "DRS081",
    "DRS091",
    "DRS094",
    "DRS126",
    "DRS127",
    "DRS131",
    "DRS133",
    "DRS173",
    "DRS190",
]


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


def save_payload(payload: dict, referer: str) -> str:
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
        return resp.geturl()


def code_to_id_map() -> Dict[str, str]:
    cat = http_json(f"{CMS}/api/v1/public/catalog")
    mapping: Dict[str, str] = {}
    for item in cat.get("tests") or []:
        detail = http_json(f"{CMS}/api/v1/public/catalog/tests/{item['slug']}")["test"]
        code = ((detail.get("attributesJson") or {}).get("internalCode") or "").strip().upper()
        if code:
            mapping[code] = str(detail["id"])
    return mapping


def find_live_id_by_slug(slug: str) -> Optional[str]:
    cat = http_json(f"{CMS}/api/v1/public/catalog")
    for item in cat.get("tests") or []:
        if item.get("slug") == slug:
            return str(item["id"])
    return None


def set_multi(payload: dict, name: str, values: List[str]) -> None:
    payload[name] = list(values)


def ensure_checkbox(payload: dict, name: str, enabled: bool, value: str = "true") -> None:
    if enabled:
        payload[name] = [value]
    elif name in payload:
        del payload[name]


def upsert_profile(
    *,
    slug: str,
    name: str,
    code: str,
    customizable: bool,
    child_codes: List[str],
    original: int,
    discounted: int,
    badge: str,
    short_desc: str,
    long_desc: str,
    symptoms: List[str],
    faqs: List[tuple],
    related_slugs: List[str],
    code_map: Dict[str, str],
    slug_to_id: Dict[str, str],
    demographics: Optional[List[str]] = None,
    categories: Optional[List[str]] = None,
) -> None:
    missing = [c for c in child_codes if c not in code_map]
    if missing:
        raise RuntimeError(f"{name}: missing child codes in Live catalog: {missing}")

    included_ids = [code_map[c] for c in child_codes]
    related_ids = [slug_to_id[s] for s in related_slugs if s in slug_to_id]

    existing_id = find_live_id_by_slug(slug)
    if existing_id:
        referer = f"{CMS}/tests/edit/{existing_id}"
        html = fetch_html(referer)
        payload = extract_form_payload(html)
        print(f"Updating existing {slug} id={existing_id}")
    else:
        referer = f"{CMS}/tests/new"
        html = fetch_html(referer)
        payload = extract_form_payload(html)
        # new form may have empty id
        if "id" in payload:
            payload["id"] = [""]
        print(f"Creating new {slug}")

    payload["testName"] = [name]
    payload["testType"] = ["Profile"]
    payload["testStatus"] = ["Live"]
    payload["internalTestCode"] = [code]
    payload["externalTestCode"] = [code]
    payload["shortDescription"] = [short_desc]
    payload["longDescription"] = [long_desc]
    payload["badge"] = [badge]
    payload["originalPrice"] = [str(original)]
    payload["discountedPrice"] = [str(discounted)]
    ensure_checkbox(payload, "hasDiscountedPrice", True, "true")
    ensure_checkbox(payload, "customizable", customizable, "true")
    ensure_checkbox(payload, "fastingRequired", True, "true")
    ensure_checkbox(payload, "noAlcohol", False)
    payload["sampleType"] = ["Blood & Urine"]
    payload["preparationText"] = [
        "Fast for 9-12 hours (water only) before sample collection unless advised otherwise. Share current medicines and supplements during booking."
    ]
    payload["collectionMethod"] = ["At-home sample collection"]
    payload["resultsTimeline"] = ["24-48 hours after sample reaches the lab"]
    payload["ageRange"] = ["18+ recommended"]
    payload["bookingNote"] = ["Can be booked for family profiles"]
    payload["numberOfTests"] = [str(len(included_ids))]
    payload["numberOfParameters"] = [str(len(included_ids))]
    payload["symptomsText"] = ["\n".join(symptoms)]
    payload["faqsText"] = ["\n".join(f"{q} | {a}" for q, a in faqs)]
    payload["parametersText"] = [""]
    payload["includedTestsText"] = [""]
    set_multi(payload, "includedTests", included_ids)
    set_multi(payload, "frequentlyPurchasedTests", related_ids)
    demo = demographics or (["Women"] if "women" in slug else ["Men"])
    cats = categories or (["Women", "Full Body Checkup"] if "women" in slug else ["Men", "Full Body Checkup"])
    set_multi(payload, "demographics", demo)
    set_multi(payload, "testCategories", cats)

    save_payload(payload, referer)
    time.sleep(0.5)

    after_id = find_live_id_by_slug(slug)
    if not after_id:
        raise RuntimeError(f"After save, slug {slug} not found in Live catalog")
    detail = http_json(f"{CMS}/api/v1/public/catalog/tests/{slug}")["test"]
    kids = len(detail.get("whatsTested") or [])
    print(
        f"  ✓ {slug} id={after_id} custom={detail.get('customizable')} "
        f"children={kids} ₹{detail.get('price')}/{detail.get('oldPrice')}"
    )
    if kids < len(included_ids):
        raise RuntimeError(f"{slug}: expected {len(included_ids)} children, got {kids}")


def main() -> int:
    print("Building code map from Live catalog…")
    code_map = code_to_id_map()
    cat = http_json(f"{CMS}/api/v1/public/catalog")
    slug_to_id = {t["slug"]: str(t["id"]) for t in cat.get("tests") or []}

    women_fixed_faqs = [
        ("Do I need to fast?", "Yes. Fast for 9-12 hours (water only) unless your clinician advises otherwise."),
        ("Who is this for?", "Women who want a fixed annual wellness bundle covering blood, metabolic, thyroid, and urine markers."),
        ("How is this different from Custom Women's Health?", "This is a fixed package price. Custom Women's Health lets you select or deselect panels before checkout."),
    ]
    women_custom_faqs = [
        ("How does pricing work?", "Your total is the sum of the panels you select. List price on the card is a reference package amount."),
        ("Can I remove core panels?", "Yes. Select only the tests you want included before adding to cart."),
        ("Do I need to fast?", "Most metabolic panels need 9-12 hours fasting. Follow the preparation note for your selected set."),
    ]

    upsert_profile(
        slug="women-s-health-test",
        name="Women's Health Test",
        code="DRSW001",
        customizable=False,
        child_codes=CORE8_CODES,
        original=8999,
        discounted=6999,
        badge="Popular",
        short_desc="A fixed women's wellness bundle covering blood, metabolic, thyroid, and urine markers.",
        long_desc=(
            "The Women's Health Test bundles core screenings commonly reviewed during preventive care — "
            "kidney and liver function, complete blood count, urine analysis, lipids, glucose control, and thyroid. "
            "It is designed as a practical fixed package without building a custom panel."
        ),
        symptoms=[
            "Annual preventive screening",
            "Fatigue and low energy",
            "Weight or thyroid concerns",
            "Metabolic wellness check",
        ],
        faqs=women_fixed_faqs,
        related_slugs=["cbc", "thyroid-profile-total"],
        code_map=code_map,
        slug_to_id=slug_to_id,
        demographics=["Women"],
        categories=["Women", "Full Body Checkup"],
    )

    # Refresh slug map after first create so related IDs resolve for custom
    cat = http_json(f"{CMS}/api/v1/public/catalog")
    slug_to_id = {t["slug"]: str(t["id"]) for t in cat.get("tests") or []}

    custom_codes = CORE8_CODES + CUSTOM_WOMEN_EXTRA_CODES
    # de-dupe preserving order
    seen = set()
    custom_codes_unique = []
    for c in custom_codes:
        if c not in seen:
            seen.add(c)
            custom_codes_unique.append(c)

    upsert_profile(
        slug="custom-women-s-health-test",
        name="Custom Women's Health Test",
        code="DRSW002",
        customizable=True,
        child_codes=custom_codes_unique,
        original=25999,
        discounted=19999,
        badge="Customizable",
        short_desc="Build your women's wellness panel by selecting only the tests you want.",
        long_desc=(
            "Build a women's wellness panel by selecting the tests you want included. "
            "Start with core kidney, liver, blood count, urine, lipid, glucose, and thyroid panels, "
            "then add hormones, vitamins, iron, or inflammation markers before adding the panel to cart."
        ),
        symptoms=[
            "Hormone and cycle health conversations",
            "Preventive women's wellness",
            "Iron or vitamin concerns",
            "Custom panel building",
        ],
        faqs=women_custom_faqs,
        related_slugs=["women-s-health-test", "estradiol-e2-serum", "thyroid-profile-total"],
        code_map=code_map,
        slug_to_id=slug_to_id,
        demographics=["Women"],
        categories=["Women", "Full Body Checkup"],
    )

    # Link fixed women's related to custom now that it exists
    wid = find_live_id_by_slug("women-s-health-test")
    cid = find_live_id_by_slug("custom-women-s-health-test")
    if wid and cid:
        referer = f"{CMS}/tests/edit/{wid}"
        payload = extract_form_payload(fetch_html(referer))
        rel = list(dict.fromkeys((payload.get("frequentlyPurchasedTests") or []) + [cid]))
        set_multi(payload, "frequentlyPurchasedTests", rel)
        set_multi(payload, "demographics", ["Women"])
        set_multi(payload, "testCategories", ["Women", "Full Body Checkup"])
        save_payload(payload, referer)
        print("  ✓ linked women-s-health-test related → custom-women-s-health-test")

    # Refresh Custom Men's included set if present
    if find_live_id_by_slug("custom-men-s-health-test"):
        print("Refreshing Custom Men's Health included children…")
        # light touch: only included tests via edit form
        mid = find_live_id_by_slug("custom-men-s-health-test")
        referer = f"{CMS}/tests/edit/{mid}"
        payload = extract_form_payload(fetch_html(referer))
        set_multi(payload, "includedTests", [code_map[c] for c in CUSTOM_MEN_CODES if c in code_map])
        ensure_checkbox(payload, "customizable", True, "true")
        payload["testType"] = ["Profile"]
        payload["testStatus"] = ["Live"]
        save_payload(payload, referer)
        detail = http_json(f"{CMS}/api/v1/public/catalog/tests/custom-men-s-health-test")["test"]
        print(f"  ✓ custom-men-s-health-test children={len(detail.get('whatsTested') or [])} custom={detail.get('customizable')}")

    print("Done.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except urllib.error.URLError as exc:
        print(f"CMS unreachable at {CMS}: {exc}", file=sys.stderr)
        raise SystemExit(1)
