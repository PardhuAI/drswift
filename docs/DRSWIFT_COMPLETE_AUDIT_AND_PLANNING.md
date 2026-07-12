# Dr.Swift Diagnostics — Complete Product Audit & Planning Brief

> **Purpose:** Single reference for what Dr.Swift is, how it works end-to-end, what exists in this monorepo, and how to plan a **similar but differentiated lifestyle + diagnostics** product.  
> **Generated from:** codebase inspection of `New_Dr_Swift_Website`, `DrSwift-CMS`, Flutter apps, channel backends, portal skeleton, report PDF tools, and design docs.  
> **Date context:** July 2026  

---

## Table of contents

1. [Executive summary — what Dr.Swift is](#1-executive-summary--what-drswift-is)
2. [Monorepo / ecosystem map](#2-monorepo--ecosystem-map)
3. [Brand, positioning & audience](#3-brand-positioning--audience)
4. [What Dr.Swift sells & how money flows](#4-what-drswift-sells--how-money-flows)
5. [Product surface inventory (every channel)](#5-product-surface-inventory-every-channel)
6. [User journeys (minute detail)](#6-user-journeys-minute-detail)
7. [Catalog & content model (tests, profiles, custom)](#7-catalog--content-model-tests-profiles-custom)
8. [Data model & database schema](#8-data-model--database-schema)
9. [Technical architecture](#9-technical-architecture)
10. [Design systems & UX patterns](#10-design-systems--ux-patterns)
11. [Ops, seeding & content workflows](#11-ops-seeding--content-workflows)
12. [Real vs demo / gaps](#12-real-vs-demo--gaps)
13. [Planning a lifestyle + diagnostics sibling product](#13-planning-a-lifestyle--diagnostics-sibling-product)
14. [Recommended MVP roadmap for your new app](#14-recommended-mvp-roadmap-for-your-new-app)
15. [Key file index](#15-key-file-index)

---

## 1. Executive summary — what Dr.Swift is

**Dr.Swift Diagnostics** is an **India-focused preventive / at-home diagnostics brand**. It helps families:

1. **Discover** lab tests and health packages (profiles)
2. **Customize** packages (pick included panels; price updates live)
3. **Book** home sample collection (web, WhatsApp, app waitlist)
4. **Understand** results as insights/trends — not only raw PDFs
5. **Manage** family profiles over time
6. **Sell through channels** (POS partners, relationship managers, commissions)

### One-line promise

> **“See more than numbers”** — clinical credibility + warm family health + multi-channel booking.

### What it is *not* (yet, on the marketing stack)

- Not a fully live payment + fulfillment OS on the static website
- Not only a PDF lab portal
- Not a generic e-commerce clone of Labcorp/Thyrocare; it borrows commerce patterns but centers **insights + family + at-home**

### Core product objects

| Object | Meaning |
|--------|---------|
| **Leaf test** | Single lab assay / panel (`testType = Test`) |
| **Profile** | Bundle of included leaf tests (`testType = Profile`) |
| **Customizable profile** | Profile where customer toggles included children; total = Σ selected prices |
| **Parameters / markers** | Biomarkers with name + short description (power What’s Tested + compare) |
| **Frequently purchased** | Related tests graph for PDP merchandising |
| **Channel order** | B2B/partner-placed order (commissioned), separate from website cart |
| **Report + insights** | Clinical results layer (schema exists; website mostly demo) |

---

## 2. Monorepo / ecosystem map

Workspace root: `swift_diagnostics/`

| Repo / folder | Role |
|---------------|------|
| **`New_Dr_Swift_Website`** | Static marketing + storefront (HTML/CSS/JS). Catalog from CMS public API; cart in LocalStorage; booking/auth mostly demo. |
| **`DrSwift-CMS`** | Spring Boot admin + public catalog API. Lab test CRUD, partners, POS channels, RMs, channel orders. Postgres/`swiftunit`. |
| **`dr_swift_flutter_new`** | Flutter customer app V2 design handoff — companion tabs (Home/Tests/Care/Reports/Profile). |
| **`swift_customer_flutter_chatGPT`** | Flutter customer app with session-state architecture (guest vs auth, family, OTP, lab data per member). |
| **`swift-customer-portal-chatGPT`** | Spring API skeleton (domain packages, DTOs, Firebase token exchange contract) — structure more than full product. |
| **`swift-diagnosis-platform-web-mobile`** | Broader platform web/mobile (linked in `dr_swift_diagnostics.txt`). |
| **`DrSwift-ChannelPartner-Backend`** | Channel partner ops backend. |
| **`DrSwift-ChannelManager-Backend`** | Channel manager ops backend. |
| **`patient-report-pdf`** | Lab report PDF generation tooling. |

**Mental model of the business stack:**

```
                    ┌─────────────────────┐
                    │   Content CMS       │  LabTest catalog, promos
                    │   DrSwift-CMS       │  Public API for apps/web
                    └─────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
 ┌──────────────┐    ┌────────────────┐    ┌─────────────────┐
 │ Marketing    │    │ Customer apps  │    │ Channel B2B     │
 │ Website      │    │ Flutter +      │    │ Partners / RMs  │
 │ cart/booking │    │ portal APIs    │    │ commissions     │
 └──────────────┘    └───────┬────────┘    └─────────────────┘
                             │
                    ┌────────▼────────┐
                    │ Clinical layer  │  patients, specimens,
                    │ reports/insights│  trends, OTP, checkout
                    │ (DB schema)     │
                    └─────────────────┘
```

---

## 3. Brand, positioning & audience

### Brand identity

| Element | Detail |
|---------|--------|
| Name | **Dr.Swift Diagnostics** |
| Mark | Leaf logo SVG |
| Contact | `care@drswift.health` |
| Domains | `*.drswift.in` (CORS), `drswift.health` (email) |
| Currency | **INR (₹)** |
| Locale cues | IST in CMS; Telugu columns in seed CSVs; WhatsApp +91 |

### Positioning pillars

1. **At-home collection** — phlebotomy to door; collection method default “At-home sample collection”
2. **Clear digital reports** — trends, insights, family account (promised heavily on web + Flutter)
3. **Preventive packages** — Men’s / Women’s health, full-body, diabetes, thyroid, heart, etc.
4. **Multi-channel** — Web shop, WhatsApp booking, mobile app, doctors/partners portal
5. **Trust without coldness** — clinical blue + warm photography + serif headlines

### Primary audiences

| Audience | Needs |
|----------|--------|
| **Families** | Book for self / spouse / parents; multi-profile account |
| **Preventive wellness shoppers** | Packages, compare options, transparent prep/price |
| **Symptom-led shoppers** | Filter by category / symptoms (fever, thyroid, etc.) |
| **Doctors / RMPs / partners** | Order for patients, commissions, portal access |
| **Channel partners** | POS discounts, payouts, order history |

### Brand differentiators (from design docs)

| Dr.Swift emphasizes | Typical lab sites skip |
|---------------------|------------------------|
| Insights / trends UI | PDF-only |
| Family account | Single-patient checkout |
| Customize package | Fixed SKUs only |
| Web + App + WhatsApp | Cart-only |
| Warm lifestyle imagery | Sterile clinic stock |

---

## 4. What Dr.Swift sells & how money flows

### Customer (B2C) SKUs

1. **Individual lab tests** — e.g. Vitamin D, Lipid Profile, HbA1c, ESR…
2. **Fixed health packages (Profiles)** — e.g. Men’s Health Test, Women’s Health Test — fixed included children, package price
3. **Customizable packages** — e.g. Custom Men’s / Custom Women’s — base + optional panels; price = sum of selected leaf prices
4. **Promotional tests** — time-boxed badge/title/colors/dates; listed on promotions page + hero carousel API

### Pricing mechanics

| Field | Behavior |
|-------|----------|
| `originalPrice` | Required INR integer (rupees) |
| `hasDiscountedPrice` + `discountedPrice` | Sale price; UI shows strikethrough |
| Customizable profile | Live total recalculated from selected included tests’ prices |
| Channel POS | Separate discount % + commission %/flat on partner channels |

### How a customer is meant to pay (intended vs current web)

**Intended journey:** Select → cart → book slot → **care team confirms** → **payment link later**.  
**Website copy explicitly says** no payment until slot confirmed.  
**Current website:** booking form does **not** create server orders or charge cards.

### Channel (B2B) money

- **POS channels** — discount %, commission %, payout schedule  
- **Partners** — place/view channel orders  
- **Relationship managers** — CRM overlay  
- Catalog sort on public API can prefer tests with more **confirmed channel order line items**

---

## 5. Product surface inventory (every channel)

### 5.1 Marketing website (`New_Dr_Swift_Website`)

| Page | What it does | Depth of reality |
|------|----------------|------------------|
| `index.html` | Hero, categories, featured tests, how-it-works, insights preview, FAQ, newsletter, community | Catalog live via API; newsletter unverified |
| `tests.html` | Full catalog, search, filter pills | Client-rendered Live catalog |
| `test-details.html` | PDP: price, buy, prep, What’s Tested, customize, Labcorp-style compare, FAQs, related | Rich client logic |
| `cart.html` | LocalStorage cart, qty, remove, continue to book | Client-only |
| `book.html` | Name/phone/address/date/slot/contact preference | Demo submit (no backend) |
| `promotions.html` | Promo grid | CMS-driven when available |
| `reports.html` / `sample-report.html` | Report center marketing + sample PDF | Demo / sample assets |
| `app.html` | App landing → waitlist | No real store links |
| `whatsapp.html` | WA booking funnel | Placeholder number |
| `doctors.html` | Doctor portal shell | Fake auth success |
| `login` / `signup` / `forgot-password` | Auth UI | Explicit “backend coming soon” |
| `about` / `help` / legal pages | Content | Legal marked for review |

**JS modules:** `api.js` (CMS client + fallback), `test-data.js` (offline demo), `panel-catalog.js`, `main.js` (storefront), `auth.js` (client validation).

### 5.2 CMS admin (`DrSwift-CMS`)

| Area | Capability |
|------|------------|
| Dashboard | Counts: total / Live / Draft / Retired / Featured / Promo; searchable table |
| Lab test form | Full CRUD + live preview; FAQ rows; Parameter rows; Included tests checklist; Frequently purchased; Custom Test create path |
| Public API | `/api/v1/public/catalog`, `/catalog/tests/{slug}`, `/hero-carousel`, `/health` |
| POS channels | Discount, commission, payout |
| Partners | List + order history |
| Relationship managers | CRM management |
| Security | Form login admin; API Basic Auth roles; **dev-mode often permit-all** |

### 5.3 Flutter customer apps

**V2 vision (`dr_swift_flutter_new`):**

- Tabs: **Home · Tests · Care · Reports · Profile**
- Care = 5-step booking (patient → address → schedule → review → payment)
- Reports = family selector, critical/attention/healthy, trends, library
- Home = companion feed, recommendations, upcoming care
- Design: calm premium healthcare; 8-pt spacing; 44pt touch targets

**Session architecture (`swift_customer_flutter_chatGPT`):**

Orthogonal state axes:

| Axis | Values | Meaning |
|------|--------|---------|
| Auth | guest / authenticated | JWT or browse |
| Family | none / members | Family profiles |
| Phone | unverified / verified | OTP gates checkout |
| Lab data (per member) | none / pending / available | Report lifecycle |

### 5.4 Platform DB clinical layer (schema present)

Even when UI is incomplete, Postgres schema `swiftunit` models:

- patients, specimens, reports, panels/panel_items  
- historical_trends, data_points, insights  
- test_interpretations, health_indicators, retesting_schedules  
- recommended_doctors, otp_records, checkout_sessions  
- device_push_tokens, notification_deliveries  
- channel_orders, order_line_items  
- advertisements, meetings, partner_documents, rmp_users  

This is the **real product north star** beyond the marketing site.

### 5.5 Channel backends & PDF

- Partner / manager backends for B2B ops  
- `patient-report-pdf` for generating report PDFs  

---

## 6. User journeys (minute detail)

### 6.1 Browse → PDP → (customize) → cart → book

```
Home featured OR tests.html
  → bootstrapCatalogFromCms() OR static fallback banner
  → filter pills (heart, diabetes, men, women, thyroid, immunity, full-body)
  → search by name
  → open test-details.html?test={slug}
       ├─ Leaf test
       │    • sticky buy card (price, add to cart, book, WhatsApp)
       │    • What’s Tested = parameter list (name + description)
       │    • Compare = product rows; expand for parameters
       │    • Related = frequently purchased
       │    • FAQs, prep (fasting, alcohol, sample type, timeline)
       │
       └─ Profile
            ├─ Fixed: included panels as cards/drawers; package compare
            └─ Customizable: toggle panels; live total; Optional markers in compare
  → Add to cart → localStorage key (e.g. drswift.cart.v1)
       • line may store customPanels selection
  → cart.html → Continue to booking
  → book.html?cart=checkout
       • collect demographics + slot + preferred contact
       • client success message only (today)
```

### 6.2 Compare (Labcorp-style)

- Sticky/header row: What’s tested | This test | Peer A | Peer B  
- Rows: panels (profiles) or product (leaf)  
- Cells: ✓ included · Optional · — not included  
- Expand row → description + parameter chips  
- Peers from: hard-coded `compareWith` → related IDs → same category heuristics  

### 6.3 Reports (intended)

```
Reports tab / reports.html
  → pick family member
  → latest summary (critical / attention / healthy)
  → trends (e.g. HbA1c over time)
  → doctor notes / interpretations
  → full PDF
```

Website today: marketing + sample PDF, login CTAs.

### 6.4 Auth & checkout gates (app model)

```
Guest browse OK
Checkout requires: authenticated AND phone OTP verified
Family members each have lab-data state independent of account
```

### 6.5 Channel partner order (B2B)

```
Partner logs in (channel app/backend)
  → selects tests for patient
  → channel_orders + order_line_items
  → commission / discount from PosChannel
  → CMS admin can view partner orders
```

---

## 7. Catalog & content model (tests, profiles, custom)

### 7.1 Test vs Profile vs Custom

| | Leaf `Test` | Fixed `Profile` | Customizable `Profile` |
|--|-------------|-----------------|------------------------|
| Children | None (own parameters) | `includedTestIds` | Same + selectable UI |
| Price | Own price | Package price | Σ selected child prices |
| What’s Tested | Parameters list | Child panels | Selected panels |
| CMS flag | `customizable` forced false | `customizable=false` | `customizable=true` |
| Examples | Lipid Profile-Serum*, Vitamin D | Men’s / Women’s Health | Custom Men’s / Women’s |

\*Note: some “Profile” named leaf assays exist as `Test` type (e.g. Lipid Profile-Serum) — naming ≠ `testType`.

### 7.2 Seeded health pairs (important merchandising)

- **Men’s Health Test** ↔ **Custom Men’s Health Test** (`compareWith` wired)  
- **Women’s Health Test** ↔ **Custom Women’s Health Test**  

Fixed packages include a curated child set; custom packages include a larger set with base + optional panels.

### 7.3 Taxonomy

**Website filter chips:**  
`all | heart | diabetes | men | women | thyroid | immunity | full-body`

**CMS categories (partial list):**  
40+, 50+, Allergies, Blood, Cancer, Cholesterol/Lipid, Cold/Cough, Diabetes/Sugar, Thyroid, Digestion, Energy, Fever, Fertility, Full Body Checkup, HairFall, Heart, Hormones, Infection, Iron, Joints Pain, Kidney, Liver, Lungs, Men, Women, Pancreas, …

**Demographics:** Men / Women (and heuristics in seed scripts).

**Symptoms:** Ordered list on each test → shown as “reasons to take this test” style content on PDP.

### 7.4 Merchandising fields

- Featured flag → homepage / featured carousels  
- Promotional block (dates, badge, colors, background image, tag)  
- Frequently purchased IDs → related cards (“Frequently bought together”)  
- Recommended next test interval (days/months concept)  
- Alternative names (search + SEO-ish matching)  

### 7.5 Preparation / logistics copy (defaults)

| Field | Default / role |
|-------|----------------|
| Sample type | Required (Blood, Urine, …) |
| Fasting required | Boolean |
| No alcohol | Boolean |
| Preparation text | Freeform instructions |
| Collection method | “At-home sample collection” |
| Results timeline | “24–48 hours after sample reaches the lab” |
| Age range | “18+ recommended” |
| Booking note | “Can be booked for family profiles” |
| Sample quantity / tube type | Lab ops metadata |

### 7.6 Parameters & FAQs

- **Parameters:** ordered `{name, description}` — leaf biomarkers  
- **FAQs:** ordered `{question, answer}`  
- CMS editors: structured rows (Add one more…), synced to hidden textareas on save  
- Website: parameters drive What’s Tested + compare expand bodies  

---

## 8. Data model & database schema

### 8.1 `LabTest` entity (CMS source of truth for catalog)

**Identity & copy:** id, testName, testImagePath, shortDescription, longDescription, alternativeNames, internalTestCode, externalTestCode  

**Lifecycle:** testStatus ∈ {Draft, Live, Retired}  

**Type:** testType ∈ {Test, Profile}; customizable boolean  

**Taxonomy collections:** testAudience (POS channels), demographics, testCategories, symptoms  

**Pricing:** originalPrice, hasDiscountedPrice, discountedPrice  

**Prep / collection:** sampleType, fastingRequired, noAlcohol, preparationText, collectionMethod, resultsTimeline, ageRange, bookingNote, sampleQuantity, collectionTubeType  

**Structure:** parameters[], faqs[], includedTestIds, includedTestsText, numberOfTests, numberOfParameters  

**Merchandising:** frequentlyPurchasedTestIds, recommendedNextTestInterval, isFeaturedTest, promotional* fields, badge colors, promotionalBackgroundImagePath  

**Audit:** createdAt, updatedAt  

### 8.2 Public catalog DTO (website/app contract)

Typical fields mapped by `CatalogController`:

- id, slug (derived from name), name, summary/headline/description  
- price, oldPrice, priceCents, currency=INR  
- parameterCount, images, filters[]  
- whatsTested[{title, description, markers[{name, description}]}]  
- related[], faqs[], reasons[] (from symptoms)  
- customizable, testType, prep/collection/age/results  
- isFeatured, promotional metadata  

**Rules of thumb:**

- Profile → `whatsTested` groups from Live included children  
- Leaf → parameters, else text lines, else self-named marker  
- Related → Live frequently-purchased only  

### 8.3 Broader `swiftunit` tables (platform)

| Domain | Tables |
|--------|--------|
| Catalog | lab_tests + join tables (audience, categories, demographics, symptoms, included, frequently_purchased, faqs, parameters) |
| Channels | pos_channels, partners, channel_relationship_managers, channel_orders, order_line_items, meetings, partner_documents |
| Clinical | patients, patient_contacts, specimens, ordering_physicians, reports, panels, panel_items |
| Insights | historical_trends, data_points, insights, test_interpretations, health_indicators, retesting_schedules, recommended_doctors |
| Auth / app | otp_records, checkout_sessions, device_push_tokens, notification_deliveries, rmp_users |
| Marketing | advertisements |

---

## 9. Technical architecture

### 9.1 Website ↔ CMS

```
Browser (localhost:5500 or *.drswift.in)
  → fetch GET /api/v1/public/catalog
  → map into window.DRSWIFT_TESTS / PANELS / PROMOTIONS
  → if fail: static test-data.js + offline banner
```

- Website default API base: `http://localhost:8080`  
- CORS allowlist includes localhost:5500 and `https://*.drswift.in`  
- Production API expects Basic Auth roles `API`/`ADMIN` unless `app.security.dev-mode=true`  
- Website `api.js` currently does **not** attach Basic Auth headers → relies on open/dev mode  

### 9.2 CMS stack

- Spring Boot 3, JPA/Hibernate, Thymeleaf admin  
- Postgres (Supabase) schema `swiftunit`  
- In-memory/admin users configurable via env  
- Docker / Render / nginx notes in CMS docs  

### 9.3 App / portal stack (target)

- Flutter client + Spring APIs  
- Firebase token exchange (skeleton)  
- Internal “Swift SSN” concept not exposed in customer DTOs  
- Vendor lab JSON ingestion contract (skeleton)  

### 9.4 Local preview (current team habit)

| Service | Typical command | Port |
|---------|-----------------|------|
| Website | `python3 -m http.server 5500` | 5500 |
| CMS | `mvn spring-boot:run` (OpenJDK 17) | 8080 |

---

## 10. Design systems & UX patterns

### 10.1 Marketing site (`DESIGN_AESTHETICS.md`)

| Layer | Choice |
|-------|--------|
| Philosophy | Clinical credibility + warm family health |
| Display type | Source Serif 4 |
| UI type | Inter |
| Primary | `#1E5BD7` blue |
| Health accents | Teal / mint / green |
| Hero signature | Purple / red / yellow / health gradient words |
| Layout | Sticky glass header, 1180px container, alternating soft sections |
| Motion | Hero spring, staggered reveals; respect reduced motion |
| Components | Pill CTAs, category scroll, test cards, sticky buy card, customize grid, compare table, panel drawers |

**Responsive polish (recent):** overflow clip, stepped footer columns, compare horizontal scroll on mobile, hero wrap until desktop, PDP 2→3 column hero, larger touch targets, nav body lock.

### 10.2 Flutter V2

- Healthcare-before-commerce, trust-before-conversion  
- Bottom nav 5 tabs; max depth 3  
- One dominant CTA per screen  
- Status language: “Needs attention” not alarmist  
- Tokens in `lib/design/dr_swift_tokens.dart`  

### 10.3 CMS admin UI

Separate system: Tailwind CDN, Inter, Font Awesome, dark sidebar — **not** the consumer brand system.

---

## 11. Ops, seeding & content workflows

| Artifact | Role |
|----------|------|
| `Category test list-Test List.csv` | ~52 leaf tests (codes, EN/TE names, symptoms) |
| `Category test list-Profiles.csv` | Profile codes (DRSP*), included test names |
| `Category test list-Category List.csv` | Symptom/category map (EN + Telugu) |
| `scripts/seed_cms_from_csv.py` | Seed Live catalog + approximate INR prices |
| `scripts/seed_custom_health_profiles.py` | Women’s pair + Custom Men children |
| `scripts/enrich_test_parameters.py` | Curated biomarkers by DRS* code |
| `scripts/set_frequently_purchased.py` | Related-test graph (~3 each for Live items) |
| CMS form save caveats | Saving Profile **without** re-posting included / frequently-purchased can clear them |
| Slugs | Derived from names (apostrophes → `men-s-health-test`) |

**Catalog quality loop:** CSV / curated dicts → Python scripts against CMS → website/apps read Live-only public API.

---

## 12. Real vs demo / gaps

| Capability | Status on marketing website | Status elsewhere |
|------------|-----------------------------|------------------|
| Live catalog | **Real** (CMS API) | CMS admin real |
| PDP / customize / compare | **Real client UX** | — |
| Cart | **LocalStorage only** | Needs server cart for apps |
| Booking / payment | **Demo form** | Flutter Care flow designed; checkout_sessions in DB |
| Customer auth | **Demo** | Flutter session + OTP designed |
| WhatsApp number | **Placeholder** | Ops must set real number |
| Reports viewing | **Sample assets** | Schema + PDF tool + Flutter Reports designed |
| Newsletter / community | Unverified backend | — |
| Channel orders | Not on website | CMS + channel backends |
| Featured collections API | Empty array | — |
| Legal pages | Placeholder review | — |
| Production API auth from website | Not wired | SecurityConfig ready |

**Critical planning insight:** The **product vision is much larger than the website**. The website proves catalog commerce UX; Flutter + DB schema define the companion OS; channel backends define B2B.

---

## 13. Planning a lifestyle + diagnostics sibling product

You want something **similar in capability** but **different in lifestyle focus**. Use Dr.Swift as a **reference architecture**, not a clone.

### 13.1 What to reuse conceptually (high leverage)

| Dr.Swift concept | Why it transfers | Lifestyle twist |
|------------------|------------------|-----------------|
| Leaf item vs Package vs Customizable package | Universal commerce pattern | e.g. single habit test vs “Metabolic Reset” vs build-your-own |
| Parameters with plain-language descriptions | Trust + education | Lifestyle biomarkers + behavioral metrics |
| Compare matrix (include / optional / missing) | Conversion | Compare lifestyle programs or biomarker panels |
| Frequently bought together | AOV | Pair diagnostics with coaching / kits / wearables |
| Family / member profiles | Retention | Household wellness members |
| Multi-channel book (web / WA / app) | India GTM | Same |
| Insights before PDF | Differentiation | Lifestyle score + trends + “what to do next” |
| Prep instructions | Ops clarity | Fasting, sleep, no workout before draw, etc. |
| CMS as catalog source of truth | Content ops | Lifestyle CMS: programs, rituals, lab SKUs |
| Guest → OTP → checkout gate | Conversion without friction | Same |
| Channel partners | Distribution | Gyms, clinics, corporates, nutritionists |

### 13.2 What to differentiate (so it’s not “another Dr.Swift”)

| Dimension | Dr.Swift today | Your lifestyle+ product could own |
|-----------|----------------|-----------------------------------|
| Core promise | See more than numbers (lab insights) | **Live better with measurable habits + labs** |
| Home feed | Health companion / tests / upcoming care | Daily lifestyle score, rituals, streaks, lab reminders |
| Catalog framing | Disease/category lab catalog | Goals: energy, sleep, metabolic, hormones, longevity |
| Post-result UX | Trends + doctor notes | **Action plans**: food, movement, sleep, supplements, retest |
| Social proof | Clinical trust | Coach / community / challenges (careful with medical claims) |
| SKUs | Lab tests & profiles | Labs **plus** digital programs, kits, consultations |
| Tone | Clinical-warm | Lifestyle-premium (still medically responsible) |

### 13.3 Suggested product domains for your app

Split early (Dr.Swift’s pain was mixing marketing demo with clinical OS):

1. **Catalog domain** — tests, packages, parameters, FAQs, pricing, promos  
2. **Commerce domain** — cart, checkout, payments, slots, phlebotomy status  
3. **Identity domain** — auth, OTP, family members  
4. **Clinical domain** — reports, trends, interpretations  
5. **Lifestyle domain (your differentiator)** — goals, habits, plans, content, coaching tasks, wearable imports  
6. **Growth domain** — referrals, partners, WhatsApp, push  

### 13.4 Feature parity checklist (build deliberately)

**Must-have parity with Dr.Swift (if selling labs):**

- [ ] CMS for Live/Draft catalog  
- [ ] Leaf + package + customizable package  
- [ ] Parameter education on PDP  
- [ ] Prep & collection expectations  
- [ ] Cart + booking with clear payment timing  
- [ ] Family member selection  
- [ ] Related / upsell graph  
- [ ] Compare at least for hero packages  

**Lifestyle add-ons (your wedge):**

- [ ] Goal-based discovery (“I want better energy”) → recommended labs + habits  
- [ ] Post-report action plan generator  
- [ ] Habit tracker tied to biomarkers (e.g. sleep → cortisol / fasting glucose)  
- [ ] Retest schedule from `recommendedNextTestInterval` analogue  
- [ ] Coach or AI guidance layer with medical disclaimers  
- [ ] Partner distribution (gyms/nutrition clinics) like POS channels  

### 13.5 Claims & compliance guardrails

Dr.Swift carefully markets diagnostics + insights. For lifestyle+:

- Never claim diagnosis/treatment without licensed clinicians  
- Separate **lab facts** from **lifestyle suggestions**  
- Prefer “may support conversations with your doctor” language  
- OTP + privacy vault for medical data (Flutter already thinks this way)  

### 13.6 Architecture recommendation for your new app

```
[Lifestyle App — Flutter or RN]
        │
        ├─ Catalog API  (clone DrSwift-CMS patterns)
        ├─ Commerce API (don’t stop at LocalStorage)
        ├─ Clinical API (reports/trends)
        └─ Lifestyle API (goals/habits/plans)  ← new
                │
         Postgres (modular schemas)
                │
         Admin CMS (catalog + lifestyle content)
```

**Do not** start with a static marketing site as the system of record. Use Dr.Swift website as **UX inspiration** only; use CMS + Flutter session model as **system inspiration**.

---

## 14. Recommended MVP roadmap for your new app

### Phase 0 — Positioning (1 week)

- Write one sentence that is *not* “at-home lab tests with insights”  
- Pick 1–2 lifestyle wedges (e.g. metabolic health, women’s hormones, executive energy)  
- Define non-goals (no telemedicine v1, no wearables v1, etc.)  

### Phase 1 — Catalog + discovery MVP

- Port LabTest-like model (or slim it)  
- 15–30 SKUs + 2 hero packages (fixed + custom)  
- Goal-based filters instead of (or beside) disease filters  
- PDP with parameters + prep + compare for hero pair  

### Phase 2 — Commerce MVP

- Auth + OTP  
- Family members  
- Cart server-side  
- Booking slots + manual confirm OR Razorpay/UPI  
- WhatsApp confirmation template  

### Phase 3 — Insights MVP

- Ingest or upload report  
- Simple trends for 5 markers  
- Lifestyle action plan template tied to out-of-range markers  

### Phase 4 — Lifestyle loop

- Daily/weekly rituals  
- Retest reminders  
- Partner channel (1 gym / 1 clinic)  

### Phase 5 — Scale

- Full channel commissions  
- Doctor notes  
- Push notifications  
- Promotions engine  

---

## 15. Key file index

| Concern | Path |
|---------|------|
| This audit | `docs/DRSWIFT_COMPLETE_AUDIT_AND_PLANNING.md` |
| Website design system | `New_Dr_Swift_Website/docs/DESIGN_AESTHETICS.md` |
| Website storefront logic | `New_Dr_Swift_Website/assets/js/main.js` |
| CMS catalog client | `New_Dr_Swift_Website/assets/js/api.js` |
| Offline fallback catalog | `New_Dr_Swift_Website/assets/js/test-data.js` |
| LabTest entity | `DrSwift-CMS/src/main/java/in/drswift/cms/entity/LabTest.java` |
| Public catalog API | `DrSwift-CMS/.../controller/CatalogController.java` |
| Unified DB schema | `DrSwift-CMS/datamodel.sql` |
| Flutter V2 handoff | `dr_swift_flutter_new/docs/dr_swift_v2_design_handoff.md` |
| App session flows | `swift_customer_flutter_chatGPT/docs/app_session_flows.md` |
| Portal skeleton | `swift-customer-portal-chatGPT/APPLICATION-SKELETON.md` |
| Seed / enrich scripts | `New_Dr_Swift_Website/scripts/*.py` |
| Repo URL list | `dr_swift_diagnostics.txt` |

---

## Appendix A — Dr.Swift in one paragraph

Dr.Swift is a preventive diagnostics platform centered on **at-home lab testing for Indian families**, sold as individual tests and fixed/customizable packages, merchandised with parameters, FAQs, compare tables, and related tests, operated through a **CMS catalog**, marketed via a **static website**, intended to be experienced as a **Flutter companion** for booking and report insights, and distributed also through **channel partners** with commissions — while much of auth, payment, and live report viewing remains **partially implemented** relative to the full database vision.

## Appendix B — Questions to answer before you build

1. Are labs first-party inventory, marketplace, or partner-fulfilled?  
2. Is lifestyle coaching human, AI, or content-only in v1?  
3. Will you sell only packages or also à-la-carte biomarkers?  
4. Same India GTM (UPI, WhatsApp) or different geography?  
5. Do you need B2B channels on day one?  
6. What is the single habit+lab loop users return for weekly?  

---

*End of audit. Use Section 13–14 as the planning spine; use Sections 5–12 as the implementation mirror of Dr.Swift.*
