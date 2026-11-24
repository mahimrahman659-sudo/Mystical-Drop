# Mystical Drop — NPD Competition Presentation Content

**Date:** 2026-11-24 · Where the website now communicates product concept, innovation, and craftsmanship — and what is deliberately withheld.

---

## 1. Where each NPD theme lives

| Theme | Location | Status |
|---|---|---|
| First-10-seconds pitch (what/why) | Homepage hero + badges + banner overlay | **Published** |
| Product concept | Homepage §4 "The Product Concept"; `/innovation` §"The product concept" | **Published** |
| Design inspiration | Product pages "Design Notes → Inspiration & Craftsmanship"; `/innovation` collection cards | **Published** |
| Differentiation of the three designs | Homepage §3; `/innovation` "What makes the three designs distinct" table | **Published** |
| Development journey | Homepage §5 (5 stages) + `/innovation` "From observation to finished piece" (Notice→Sketch→Build→Refine→Produce) | Journey **draft, unpublished** (`SHOW_DEVELOPMENT_JOURNEY=false`); innovation-process framing published as *approach*, not historical claim |
| Craftsmanship / in-house role | Homepage §6; About "What we do"; product info panels; cart/checkout info cards | **Published** (owner-sanctioned "made by our team" framing only) |
| Target customers | `/innovation` "Who it's for" — explicitly labelled *"a working hypothesis, not market research"* | **Published** (honest framing) |
| Value proposition | `/innovation` "Why choose a Mystical Drop fountain?" (4 bullets, all verifiable) | **Published** |
| Problem/opportunity | `/innovation` "Small spaces deserve nice things too." — framed as the team's observation, no invented research data | **Published** |
| Future development | `/innovation` "Where the collection could go next" — explicitly "Planned directions — not yet built" | **Published** (clearly future) |
| Product demonstration video | Homepage §7 draft slot (`SHOW_DEMONSTRATION=false`) — no fake player rendered | **Unpublished** until a real video exists |
| Team page block | `/about` team section (`SHOW_TEAM_SECTION=false`) | **Unpublished** until verified member info supplied |

## 2. How to flip drafts on (for the owner)

In `app/page.tsx`: `SHOW_DEVELOPMENT_JOURNEY`, `SHOW_DEMONSTRATION`. In `app/about/page.tsx`: `SHOW_TEAM_SECTION`. Set to `true` only after verifying the underlying evidence (records/photos/video/team details).

## 3. Honesty guardrails used throughout

- No market-size, survey, or research statistics anywhere.
- No completion claims beyond "the three products exist and are presented here".
- No awards, certifications, founding dates, founder bios, workshop addresses, or manufacturing statistics.
- Every differentiation point traces to something observable or owner-stated (original designs, nature-inspired forms, tabletop format, in-house production).
- Audience and future statements are explicitly labelled hypotheses/plans.

## 4. Judge navigation path (short presentation)

Home (hero + collection) → product page (design notes) → **Our Innovation** (concept → designs → process → differentiation → audience → value → future) → **Our Story** (brand narrative) → Contact (footer phone). All reachable from the top nav within one click; verified working in E2E.
