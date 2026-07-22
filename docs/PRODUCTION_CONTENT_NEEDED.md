# Production Content Needed

Phase 1 ships **designed UI surfaces** for every item below, driven by [`assets/js/site-content.js`](../assets/js/site-content.js). Blocks tagged `data-content-status="design"` show a small “Design content — replace before launch” note.

Phase 2 replaces those placeholders with verified ops/legal facts, sets `status: "live"`, strips design notes, and wires real APIs.

Do not invent or imply launch-verified details until Phase 2.

## Phase 1 / Phase 2 map

| Content | Phase 1 UI | Config key | Phase 2 action |
|--------|------------|------------|----------------|
| Partner lab legal names, accreditation, certificate numbers, validity | About `#lab-partners`; home lab strip | `labs[]` | Replace with real partner names + certs |
| Service cities, PIN coverage, collection hours, blackout dates | Home coverage meta + checkout coverage note | `coverage` | Connect coverage API; publish real blackouts |
| Registered address, support phone, escalation, hours | About `#contact` (`contact-extras`) | `contact` | Confirm address, phone, escalation desk |
| Phlebotomist qualification, sample handling, cold chain | About `#collection-quality` | `collection` | Ops-approved statements |
| Payment, refund, cancellation, reschedule policy | [`policies.html`](../policies.html), terms summary, checkout links | `policies` | Legal-approved copy |
| OTP expiry, resend cooldown, rate limit, delivery failure | Checkout + login OTP hints / error strings | `otp` | Wire OTP API + real rate limits |
| Data retention, consent, clinician review, urgent care | Privacy sections; checkout consent; confirm disclaimer | `clinical` | Legal + clinical approval |

## Currently published design defaults (confirm in Phase 2)

- Support phone on marketing surfaces: `+91 90004 24591`
- Service cities: Hyderabad, Nalgonda, Secunderabad, Warangal

## API notes (Phase 2)

When the coverage API is available, connect the homepage check and checkout address step to the same authoritative serviceability endpoint. Until then, the interface says availability is confirmed before payment and uses local design hours/cities from `site-content.js`.
