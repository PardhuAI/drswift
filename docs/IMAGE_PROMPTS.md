# Dr.Swift Website — Image Prompts

Use these prompts to generate or source photography. Drop finished files into `assets/images/` using the **filename** listed, then add `class="has-image"` to the parent `.media-slot` and an `<img>` tag (see reports page sample).

**Style guide for all images:**
- Warm, natural lighting — not sterile hospital stock
- Diverse Indian families and couples when people are shown
- Soft, approachable mood matching Dr.Swift brand (calm blues, greens, home settings)
- Avoid microscopes, harsh clinical whites, or aggressive medical imagery
- Prefer 16:10 or 4:3 landscape for web; export WebP + JPG fallback

---

## 1. Hero (already in use)

| File | Status | Prompt |
|------|--------|--------|
| `hero-couple.png` | ✅ Exists | *Couple in a bright modern Indian home, reviewing health results together on a laptop or tablet, warm natural window light, relaxed smiles, casual home clothes, soft blues and whites in the room, lifestyle photography not clinical, shallow depth of field* |

---

## 2. Wellness / family section (homepage)

| File | Slot ID | Dimensions | Prompt |
|------|---------|------------|--------|
| `wellness-family.jpg` (+ `.webp`) | `wellness-family` | 1200×900 (4:3) | *Multigenerational Indian family in a sunlit living room — grandmother, parents, and young child — one person holding a phone showing a health app, others engaged warmly, plants and soft furnishings, aspirational but relatable home wellness moment, no white coats, editorial lifestyle photography* |

**Where it goes:** Homepage → “One account for everyone you care about” section (left column).

**After adding:**
```html
<div class="media-slot media-slot--hero-ratio has-image" data-image-id="wellness-family">
  <img src="assets/images/wellness-family.jpg" alt="Family reviewing health profiles together at home" loading="lazy">
</div>
```

---

## 3. About page — team / trust

| File | Slot ID | Dimensions | Prompt |
|------|---------|------------|--------|
| `about-team.jpg` (+ `.webp`) | `about-team` | 1200×900 (4:3) | *Friendly Dr.Swift phlebotomist in neat casual medical attire (no scary PPE) arriving at an Indian apartment doorstep with a compact sample kit, warm morning light, patient smiling at door, professional but approachable, trust and care emphasis, lifestyle documentary style* |

**Where it goes:** About page → mission section (right column).

---

## 4. Test catalog card thumbnails (optional upgrades)

Current cards use branded gradient placeholders. Replace individually when ready:

| File | Test | Dimensions | Prompt |
|------|------|------------|--------|
| `test-cbc.jpg` | Complete Blood Count | 600×400 | *Abstract soft red and blue fluid art suggesting blood health, minimal, clean, no gore, white background accent, medical wellness brand aesthetic* |
| `test-heart.jpg` | Lipid Profile | 600×400 | *Healthy heart-healthy breakfast scene — oats, berries, nuts — top-down or 45° angle, soft natural light, wellness not cardiology clinic* |
| `test-thyroid.jpg` | Thyroid Profile | 600×400 | *Calm portrait silhouette with subtle neck/light glow metaphor, green-teal wellness tones, abstract and respectful, no anatomical diagrams* |
| `test-vitamin-d.jpg` | Vitamin D | 600×400 | *Morning sunlight through a window onto a kitchen table with citrus and a glass of water, warm golden light, vitality and wellness mood* |
| `test-full-body.jpg` | Full Body Checkup | 600×400 | *Active Indian adult stretching or walking in a park at golden hour, preventive health and annual checkup feeling, energetic but calm* |
| `test-womens-health.jpg` | Women's Hormone Panel | 600×400 | *Indian woman in her 30s reading peacefully by a window with soft green plants, self-care and hormonal wellness mood, natural light, not clinical* |

**After adding to a test card:**
```html
<div class="test-image">
  <img src="assets/images/test-cbc.jpg" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">
</div>
```

---

## 5. Reports page (already in use)

| File | Status | Prompt |
|------|--------|--------|
| `health-insights-1280.jpg` / `.webp` | ✅ Exists | *Mobile app mockup or screenshot-style health dashboard showing HbA1c, cholesterol, vitamin D cards with green/amber status indicators, clean white UI on soft background* |

---

## 5b. App landing page (`app.html`)

| File | Use | Prompt |
|------|-----|--------|
| `app-mockup.jpg` | Hero phone mockup | *iPhone-style device floating at slight angle showing Dr.Swift app home screen: family profile switcher, health insight cards (HbA1c, cholesterol), navy and teal brand accents, soft gradient background, photorealistic product shot style* |

---

## 6. Optional future sections

| File | Use | Prompt |
|------|-----|--------|
| `home-collection-step2.jpg` | How it works step 2 | *Phlebotomist seated at a dining table in an Indian home, gently preparing collection materials, patient seated comfortably, trust and professionalism* |
| `testimonial-bg.jpg` | Testimonial overlay (optional) | *Very soft bokeh abstract blue-teal circles on navy, subtle texture only — no people, for background depth* |
| `blog-article-1.jpg` | Future health articles | *Person jogging lightly in an Indian neighborhood at sunrise, preventive health article thumbnail, warm tones* |

---

## Quick checklist

- [ ] `wellness-family.jpg` — homepage family section
- [ ] `about-team.jpg` — about page
- [ ] `app-mockup.jpg` — app landing page hero
- [ ] Test thumbnails (optional, 6 files)
- [ ] Replace placeholder labels by adding `has-image` class + `<img>` tag

When you have images, share the files and we can wire them in and remove the placeholder labels.
