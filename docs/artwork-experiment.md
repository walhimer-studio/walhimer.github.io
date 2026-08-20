# Artwork Experiment

**Revised:** 2026-08-20 (full rewrite — superseded and disproven material removed)
**Scope:** Mark Walhimer, artist. Museum Planning LLC notes are below the line.

---

## The question

**Which pieces, through which door, at what price?**

Not "is the work good." Not "how do I grow an audience." When a specific work is
offered in a specific form through a specific channel, does anyone commit?

## Hard constraints

1. **Zero risk to the consulting business.** No email to the 6,000-person list.
   No announcement. No public repositioning. Six-figure consulting conversations
   are active and needed now.
2. **Nothing irreversible.** Any step requiring a one-way door waits for evidence.
3. **The answer comes before the bet.** Learn which work and which door first.

---

# ANSWER STATE — as of 2026-08-20

Read this section instead of re-deriving. Three parts to the question; two are
answered from evidence, one is not answerable yet and that is a finding rather
than a failure.

## ✅ Which door — ANSWERED, with a control experiment

**Email, reached through educational content ranking in search.**

Not inferred. User ran this experiment already on `museumplanning.com`: the
Museum School educational cluster generates the traffic, and a homepage change
multiplied *inquiries* (not visitors). Every artwork sale route he has ever
described — gallery opening, DM, referral, website — terminates in an email.
There is no second transaction channel to test.

## ✅ Which buyer — ANSWERED, named and structurally reachable

**The civic / institutional advocate** — the Youngstown persona. An advocate
inside a funding body, not a small buyer. Reachable because the funding mechanism
(percent-for-art, council appropriation) **does not require canonical standing**,
which is the one credential the artwork does not yet have. Existing CV
(Smithsonian, Fulbright, ICA Miami) is already sufficient for this door.

## ⚠️ Which work — NOT ANSWERABLE FROM CURRENT DATA

This is the honest status, and the reason matters:

- No $100k artwork door has ever been open, so **there is no historical
  conversion data to mine**.
- X and Instagram metrics measure whether people like an image. That is studio
  feedback, and valuable as such — it is **not purchase signal**. Thirteen
  earlier conclusions drawn from it were retracted; see § *Removed from this
  document*.
- The inquiry log with sender-type attribution (P0) **is the instrument that
  produces this answer**. It has not run yet.

### ⛔ RETRACTED — "room-scale is what gets placed" (same day it was written)

I proposed earlier on 2026-08-20 that placement history pointed at room-scale
work. **User data falsifies it.** Recorded so it is not re-derived.

### The real finding — curator selection events (user, 2026-08-20)

Actual selection events by qualified gatekeepers with stakes. This is the
strongest evidence in this document — far better than any engagement metric,
because each row is a decision, not a reaction.

| Selector | Chose | Scale |
|---|---|---|
| Museum (user to confirm which) | *Bloom* | Room / four-wall |
| ASTZ | *Surrender Machines* | Discrete / kiosk |
| Blackdove | *Centered* | Single screen |
| MCHSX / Anton | *Invisible Layer* | Single screen / browser |
| ICA Miami (Loop, curated by Doreen Rios) | *Surrender Machine 77823* | Discrete / kiosk |
| September show | TBD | TBD |

**Four-plus selectors, four different works, spanning three scales.** No series
dominates. The scales are not converging.

### What this actually means

**The selector is the variable, not the work.** Each curator chose the piece that
fit their context. So "which work" has no single global answer — it resolves
**per door**:

| Door | Work that gets selected | Economics |
|---|---|---|
| Screen platforms (Blackdove) | Single-screen pieces — *Centered* | Distribution, low price |
| Group shows / kiosks (ICA, ASTZ) | Discrete pieces — *Surrender Machines* | Standing, no revenue |
| Civic / architectural commission | Room-scale — *Bloom*, *Living Commons* | **The six-figure door** |

The price argument survives even though the placement argument did not: **nobody
pays six figures for a screen, they pay it for a room.** But that is an argument
about *the civic door specifically*, not about which work to make.

### Consequence — do NOT narrow to one series

User asked directly whether he needs to concentrate on Surrender Machines, and
noted it would be boring. **The evidence says no.**

1. Four selectors chose four different works. Narrowing **reduces the surface
   area that produces selections.**
2. Breadth is what is currently working; the diversity of the catalog is what
   lets different curators each find their fit.
3. Boredom is a **production constraint, not a preference.** The daily studio
   practice is the engine that generates the catalog. A narrowing that kills the
   engine costs more than it gains.

> **Concentrate the writing, not the artwork.** Breadth in the catalog; a single
> focused keyword surface in the guide.

### The instrument is already running

User's existing practice — presenting range and letting curators choose rather
than pushing one direction — **is the experiment.** Keep it, and log it:
selector, work chosen, scale, context, date, and whether money moved. That log
plus the inquiry log are the two instruments that answer this question.

### What "which work" still cannot tell us

No selection so far has been a **six-figure commission**. Every row above is
standing or distribution. So the civic-door row of the table is the one line
still untested, and it is the line the 90-day test exists to fill.

## Why this took as long as it did

The first half of the analysis was built on social metrics that did not survive
leave-one-out testing — 13 retractions, several caused by over-reading small
samples. The turn came from two moves: switching to Search Console, and using
`museumplanning.com` as a **control** where a conversion mechanism was already
proven. The lesson is reusable: **test against the surface where a result already
exists**, not the surface with the most data.

---

# PRIORITIZED TO-DO

## P0 — This week. Cheap, reversible, unblocks everything.

- [ ] **Write down the baseline.** Art inquiries in the last 90 days (believed 0).
      Without a recorded baseline no later result is falsifiable.
- [ ] **Instrument inquiries.** One inbound path per interest, and log two fields
      per inquiry: *sender type* (collector · museum · curator · civic/arts
      commission · gallery · student · other) and *attribution* (found the site ·
      opening · DM · referral · LinkedIn). ~1 hour.
- [x] **Draft candidate built 2026-08-20** —
      `drafts/homepage-deployment-map-candidate.html`. Copied from live
      `index.html` (all CSS, scripts, and carousel preserved), then restructured.
      `noindex`. Live homepage untouched. **Review, then authorize the swap.**
- [ ] **Front-door change on `mark-walhimer.com`.** Replace the first screen —
      currently live carousel + name + "Machine DNA" thesis — with existing
      **video of the work running on screens**, followed by a plain text
      deployment list: Bloom / Four Walls · Technical Objects Exist (ICA Miami) ·
      Miradas Tangentes (Madrid) · Async Museum · The Wrong Biennale. Place and
      date per line. Nothing else changes. *Requires explicit authorization.*
- [ ] **Watch file size.** A slow homepage loses the visitors the test exists to
      convert.

## P1 — Next 30 days. The test runs.

- [ ] **Count inquiries for 30 days.** Metric is **emails**, not visitors.
- [ ] **Finish the four-page draft guide** at
      `drafts/new-media-for-museums/` — scaffolding built 2026-08-20; the
      predictions page and all judgment slots need your voice.
- [ ] **Draft the civic deck** — the artifact for the arts-commission member
      presenting to a city council. See *The Youngstown mechanism*.
- [ ] **Fix `/available/`** — best-ranked commercial page (position 4), currently
      reads "0 available now." Either give it content or remove it from nav.

## P2 — 30–90 days. Traffic and standing.

- [ ] **Write the cost page:** *"How much does a digital art installation cost."*
      Highest-intent pattern in either dataset.
- [ ] **Resolve the near-zero listings.** 150+ works at ~$5 across six platforms.
      **Evidentiary problem, not a pricing problem** — it reads as hobbyist output
      and contradicts the claim that the work matters. Delist, or reframe
      explicitly as an archive with a stated rationale.
- [ ] **Index hygiene.** De-index ~90 near-textless pages (`test.html`,
      `testv9.html`, `Untitled3.html`, `convergence-era-v3 copy.html`,
      `899(grounded) 1248 x 1456.html`, `box.html`, `cube.html`, `five.html`,
      `terrain.html`, `bubbles.html`). Google cannot read what the site is about.
- [ ] **Rename `Machine Aesthetic/`** — capitals and a literal space in the URL.
      Six or more near-duplicate copies of that page exist with no canonical.
- [ ] **Choose one canonical identity pointer.** Currently `mark-walhimer.com` ·
      `walhimer.com` · `mark@walhimer.com` · `@WalhimerArt` · `@PublicInstall` ·
      `@markwalhimer`.
- [ ] **Decide on `/bio/index.html`** — 107 impressions, second-most-seen page,
      museum-career framing.

### P2a-AUDIT — actual cross-domain leaks, file by file (2026-08-20)

The split is **decided** but **not implemented**. 12 indexable pages on the artist
domain still reference the consulting business.

| File | Refs | Status |
|---|---:|---|
| `index.html` | 3 | JSON-LD `sameAs` + "Managing Partner" block + footer link — **all three fixed in `drafts/homepage-deployment-map-candidate.html`** |
| `bio/index.html` | 2 | Two dofollow links — **fixed in `drafts/bio-candidate.html`** |
| `installations/index.html` | 2 | 🔒 protected path — needs `AUTHORIZE EDIT` |
| `installations/living-commons.html` | 1 | 🔒 protected path |
| `installations/technical-drawing.html` | 1 | 🔒 protected path |
| `sketches/convergence-era-v3 copy{,2,3,4}.html` | 11 each | 🔒 protected — **also duplicate "copy" files; likely should not be published at all** |
| `sketches/living-commons.html` | 1 | 🔒 protected path |
| `sketches/living-commons-artwork.html` | 1 | 🔒 protected path |
| `sketches/surrender/surrender-machines 2.html` | 1 | 🔒 protected path |
| `drafts/containment-era/*.html` (4 files) | — | ✅ `noindex, nofollow` added — full Museum Planning marketing articles, previously crawlable |

**Strongest single signal still live:** `index.html` line 40, JSON-LD
`"sameAs":[…,"https://museumplanning.com"]`. That explicitly tells Google one
entity owns both domains. Candidate A removes it.

### What actually merges two entities — and what does not

Do not over-strip. The line is:

| Remove | Keep |
|---|---|
| `sameAs` entity markup pointing across domains | Authored books (*Museums 101*, *Designing Museum Experiences*) |
| Dofollow cross-domain links | Smithsonian, Fulbright, Macon, Georgia Tech, Tec de Monterrey |
| Duplicated consulting **marketing** content | "Managing partner of Museum Planning LLC" as a **biographical fact**, unlinked |

Employment history and authorship are ordinary CV material and do not cause
misclassification. They are also the institutional credibility the civic door
runs on. **Strip the wiring, keep the résumé.**

**Use meta `noindex`, not `robots.txt` `Disallow`.** A disallow prevents Google
from crawling the page, which means it never sees the noindex and the URL can
persist in the index. `robots.txt` currently reads `Allow: /`, which is correct
here.

### P2a-REVERSE — `museumplanning.com` → artist domain (2026-08-20)

**This direction is stronger than the artist→consulting direction.** Found in
`/Users/markwalhimer/Documents/GitHub/museum-planning-llc-website-2.0`.

| File | What it does | Severity |
|---|---|---|
| `index-resiliency-home.html` L25 | `Person` JSON-LD `@id .../#mark-walhimer` with `"url":"https://www.markwalhimer.com/"`, `sameAs:["https://www.markwalhimer.com/"]`, `worksFor` the org | 🔴 **Strongest possible merge.** One Person node is simultaneously Managing Partner and owner of the artist domain |
| `index-resiliency-home.html` L23 | `ProfessionalService` org node with `sameAs:["https://www.markwalhimer.com/"]` | 🔴 Organization claims the artist site as itself |
| `immersive-mexico/works/living-commons-work.html` L369–372 | **Artwork published on the consulting domain**, linking to `mark-walhimer.com`, Instagram, **and Objkt** | 🔴 Also puts an NFT marketplace link on the consulting site |
| `sitemap.xml` L430, L748 | `/mark-walhimer-resume/`, `/portfolio-item/designing-museum-experiences-book-by-mark-walhimer/` | 🟡 Personal-name URLs actively submitted |
| `404.html` L91, L99, L185 | Redirect maps for those personal-name paths | 🟢 Housekeeping |

**Note the domain spelling:** MP's structured data points at `markwalhimer.com`
(no hyphen); the artist site is `mark-walhimer.com`. Either way it is an entity
link, and it is the hostname the user eventually wants to move to.

### The precise cut — preserve authority, sever the bridge

Do **not** delete the `Person` node from `museumplanning.com`. It is carrying
author authority for the site that currently earns the money.

| Remove from the Person/Org nodes | Keep |
|---|---|
| `"url": "https://www.markwalhimer.com/"` | `name`, `jobTitle`, `image` |
| `"sameAs": ["https://www.markwalhimer.com/"]` (both nodes) | `worksFor` → the organization |

That removes the bridge at near-zero cost to MP's own rankings.

### Order of operations matters

Fixing only the artist side leaves the bridge standing from the other end.
**Do the `museumplanning.com` JSON-LD first or at the same time.**

### Artist sitemap

`page-sitemap.xml` (123 lines) **does** include the artwork pages that mention
museumplanning (`living-commons`, `convergence-era`, `technical-drawing`) — 4
matches. Those are actively submitted. `drafts/containment-era/` is **not** in
either sitemap, so the `noindex` added on 2026-08-20 is sufficient there.

### P2a — Decouple the domains in Google's index

**Decision 2026-08-20: keep the two properties separate**, so each funnel stays
measurable. `museumplanning.com` and `mark-walhimer.com` do not cross-promote for
now.

**Goal refinement:** the aim is *not* to strip museum signals — the buyers are
museums and the whole education play is museum-topic content. The aim is to strip
**museum-consulting-service** signals. It is a vocabulary problem, not a
credentials problem.

| Keep (credentials — needed for the civic door) | Remove (service vocabulary — matches "museum planners" queries) |
|---|---|
| Smithsonian · Fulbright Specialist (U.S. State Dept) | "museum planning" · "museum planner" |
| Author, two Bloomsbury titles | "exhibit design" · "consulting" |
| Institutional work, three continents | "managing partner" · Museum Planning LLC |
| Two years as interim director | links to `museumplanning.com/services` |

**Three coupling mechanisms found, strongest first:**

- [ ] **1. `index.html` JSON-LD declares the two are one entity.**
      `"sameAs":[…,"https://museumplanning.com"]` — in schema.org, `sameAs` is the
      explicit entity-identity property. **This is a published declaration, not a
      Google inference.** Removing one array item is the highest-leverage action
      available.
- [ ] **2. Four complete Museum Planning LLC marketing articles live on the artist
      domain** — `drafts/containment-era/containment-era-part-1…4.html`. Each has a
      `<title>` ending "— Museum Planning LLC", a nav logo linking to
      `museumplanning.com`, links to `/services` and `/books`,
      `mailto:mark@museumplanning.com`, a "Start a Conversation" CTA, a Museum
      Planning LLC byline, and a bio reading "managing partner of Museum Planning
      LLC (est. 1999)". **No `noindex`, no canonical**, and `robots.txt` is
      `Allow: /`.
      → Stronger consulting signal than the bio page by a wide margin.
      → **Second risk:** if these articles also exist on `museumplanning.com`, the
      two domains are competing against each other cross-domain, damaging both —
      the same cannibalization the domain consolidation is meant to end.
- [ ] **3. `/bio/index.html`** — museum-career framing on the second-most-seen page.

## P3 — Background, 6–12 months.

- [ ] **Build out the guide into a real body of educational content** (the
      artwork equivalent of Museum School).
- [ ] **Installation cost estimator** — dimensions + screen/projection/LED →
      budget range. Ends in *"email me this estimate."*
- [ ] **The sendable instrument** — *Generative Work Conservation Standard.*
      Serves museum acquisition, which is the slower door.
- [ ] **White paper** — *Commissioning Generative Art: A Guide for Institutions.*
      Gating it behind an email builds an **art-side list from zero**, so the
      consulting list is never touched.
- [ ] **Paid-search intent test** — a few hundred dollars across candidate
      phrases. The only instrument that separates *no demand* from *no traffic*.

---

# The direction

## Email is the only transaction channel

A first contact may arrive as a DM. Nobody transacts there. Two purchase paths,
one record:

1. **Email** — inquiry and commitment both written.
2. **In person at an opening** — someone commits standing in front of the work.
   **The commitment still results in an email.**

> **Email is the universal receipt.** Counting emails captures both paths.

**But email records the event, not the cause.** An inquiry produced at an opening
is not evidence the homepage worked. Hence the attribution field.

## The channel model

| Surface | Revenue | Legitimacy | Real function |
|---|---|---|---|
| **Email** | **the only channel** | — | where business happens |
| **LinkedIn** (4,000 followers + a group) | indirect | — | **distribution to actual buyers, already built** |
| Institutional / curated show | none directly | **deposits** | produces the lines the deployment map is made of |
| Commercial screen distribution (Blackdove) | none directly | ~neutral | marketing only |
| X / Instagram | none | — | **studio practice** (see below); may cause a name search |
| Near-zero marketplace listings | ~none | **withdraws** | contradicts the claim that the work matters |

**Do not dismiss institutional shows as "just marketing."** No email directly, but
they generate the lines that make the front door credible:

> institutional show → line on the deployment map → credible front door → email

## Posting is studio practice, not marketing

Daily posting is valued for a real reason: seeing which piece reads, what differs
between two works, what to change. That is artistic research, not promotion.

**Read it at the right resolution.** At median 58 impressions, post-versus-post
comparison is noise — four of seven apparent patterns collapsed when a single post
was removed. At **series level over a year** the signal is weak and real, and that
layer is where Surrender Machine held up (1.76× reposts, 1.35× likes, still
standing after removing its best post).

For "what is different between these two pieces," **Loop Art Critique gives more
signal per observation than any like count.**

## Two doors, at different distances

| Door | Evidence required | Status |
|---|---|---|
| **Civic / public commission** | Institutional credibility + delivery record | **OPEN NOW** — Smithsonian, Fulbright Specialist (U.S. State Dept), two Bloomsbury titles, museum projects on three continents, documented $100k+ delivery |
| Museum acquisition | Art-historical standing | Needs canon built first |

A city council does not care about Léger, Tinguely, or *Cybernetic Serendipity*.
They care about foot traffic, looking forward-looking, what peer cities did, cost,
maintenance, and whether it works in five years. **The canon problem is not a
blocker for the civic door.**

## Watch page — immersive digital art article (shipped 2026-08-20)

**URL:** https://mark-walhimer.com/guide/immersive-digital-art.html

**Structure (keyword test):**
1. Open — `immersive digital art` / `digital art installation`
2. Middle — `generative art` / `new media art` (+ teach `time-based media`)
3. Close — cost · public art · small museum · three questions before signing

**Metric:** Search Console queries + clicks to this URL; emails with subject
`Inquiry - Digital art installation`. Do not judge by social.

## The Youngstown search path — exact keywords (user, 2026-08-20)

**Persona restated:** 45-year-old mother of two, Youngstown. Summer trip to New
York for Broadway with her daughter. At MoMA she sees large-scale work —
**Sasha Stiles** and (especially) the wall-scale generative piece associated with
**Refik Anadol** (*Unsupervised*). She later hears about Anadol’s **DATALAND**
in Los Angeles. Daughter thinks it’s cool. She takes photos. Back home she wants
to understand it — and maybe mention it at the next public-arts / city-council
meeting. **What does she type?**

### Stage 1 — she does not know the field’s words yet

These are the *first* queries. Imprecise, name-driven, or “the thing I saw”:

| She types | Why |
|---|---|
| `digital art MoMA` | She knows the museum, not the medium |
| `AI art MoMA` / `AI art museum` | What the wall looked like / what the press called it |
| `swirling digital art` / `immersive digital art museum` | Visual memory, not vocabulary |
| `Sasha Stiles` | If she caught a name on a wall label |
| `Refik Anadol` / `Refik Anadol MoMA` | Same |
| `DATALAND Los Angeles` / `AI art museum Los Angeles` | If someone named the LA project |
| `what is generative art` | After one article taught her a word |

### Stage 2 — she learns what to call it

After one decent explainer, searches get sharper:

- `generative art`
- `new media art`
- `digital art installation`
- `immersive art installation` (funders love this word; curators may wince)
- `time-based media` (she only learns this from *you*)
- `creative coding`
- `video art vs generative art`

### Stage 3 — “how do I bring this to Youngstown?”

This is the money cluster for the experiment — civic / institutional intent:

| She types | Intent |
|---|---|
| `public art digital installation` | City / outdoor / lobby |
| `bring digital art to small museum` | Local museum path |
| `digital art for city council` / `public art proposal digital` | Meeting next month |
| `how much does a digital art installation cost` | Budget realism |
| `percent for art digital media` | Funding mechanism |
| `commission generative art` | Getting close to email |
| `LED wall art museum` / `museum LED installation` | Hardware she’s picturing |
| `interactive art installation for community center` | Civic building, not MoMA |

### What this means for the guide

**Rank for Stage 1 and Stage 3.** Stage 2 is the bridge *you* teach.

- Article / guide titles and openings should include the words she already has:
  **digital art, AI art, MoMA, immersive, generative art, new media art.**
- Mid-page, introduce the precise terms (**time-based media, creative coding,
  system vs recording**).
- End pages / related links should answer Stage 3 without a hard sell:
  **cost, maintenance, public art, city council, small museum.**

If she searches `bring digital art to small museum` and lands on your guide, the
funnel worked. If she only finds vendor pages and Anadol press, you lost her.

## The Youngstown mechanism

Observed repeatedly in consulting practice:

> A woman runs a small local history museum. She visits New York, sees screens and
> generative art, and doesn't know what she was looking at or what to call it. Her
> museum can't afford it. **But she sits on the arts commission, which reports to
> city council.** She doesn't want to sound stupid in front of them, so she builds
> a PowerPoint. She presents. **City council can write a $100,000 check without
> difficulty.**

She is not a small buyer. She is **an advocate inside a funding body**, and the
money is one room away.

### The artifact is a deck, not an article

| Requirement | Why |
|---|---|
| Slides, not prose | It must drop into *her* presentation |
| Plain language, quotable lines | She will paraphrase imperfectly |
| Images + a cost figure | Council needs something concrete |
| Peer cities that already did it | De-risks the decision |
| **No logo. No capabilities slide. No CTA.** | The moment it reads as vendor collateral she cannot use it |

> **It must make *her* the expert.** Same rule as the Museum Vitality Index.

### Structural funding mechanism

**Percent-for-art.** Many cities route a fixed percentage of capital budgets into
artwork by ordinance. Recurring money, defined process, published RFPs — and
`rfp interpretive` already ranks **position 1** on the consulting site. A defined
door with a published process, navigated professionally for 30 years.

## The vocabulary is the opportunity

She cannot search for what she wants because she lacks the word. So the terms to
own are **beginner phrases with an institutional qualifier**:

- what is new media art · screens in museum exhibits · digital art for small
  museums · LED wall for a gallery · video art vs new media art

**The audience qualifier is the filter, not the subject.** "What is generative
art" → students. "What is new media art, *for a small museum*" → her.

**What to write:** procurement literacy. LCD vs LED · 60Hz vs 120Hz · portrait vs
landscape · what a seed is · what generative means · short history. Artists write
for artists; AV integrators write for AV people. She is stranded between them with
a board meeting coming up.

**The insider term she will never find alone:** *time-based media* — what
conservation departments use, therefore what appears in acquisition paperwork.

## Teaching removes the announcement risk entirely

Explaining what an LED wall is, or what a seed is, **is indistinguishable from
consulting content.**

- Nothing is announced. No *"besides consulting, I'm now doing artwork."*
- The installations appear as **the examples** — naturally, since illustrating
  refresh rates with someone else's work would be absurd.
- The artist identity **emerges from the expertise** instead of being declared.

> **The Mailchimp email that felt too dangerous to send never has to exist,
> because there is nothing to announce.**

## Why this plan gets executed

Every other route asks for someone else: daily self-promotion, marketplace
management, chasing engagement. **This one runs on the existing default mode** —
anticipating what someone doesn't understand and giving them a way to think about
it. Two books, Museum School, and 4,000 LinkedIn followers are the same instinct.

## The benchmark — [lozano-hemmer.com](https://www.lozano-hemmer.com/)

**A posture reference, not a visual one.** ("Aesthetic" = the whole thing pulled
together: point of view, philosophy, working method, the work, how it looks.)

The homepage is a **deployment map**. One work image, then three lists —
Permanent, Current, Upcoming. ~19 permanent placements, each a line naming an
institution and a city: MoMA · Museo Jumex · National Gallery of Canada · Science
Museum London · MONA Hobart · Planet Word DC · Moody Center, Rice · Fidelity HQ
Boston. Nav ends at **Contacts**. No prices. No shop.

### It makes the canon argument without making an argument

He never claims importance. He lists ~19 institutions that decided it.

> **Don't write the lineage. List who conferred it.**

Contrast `Machine Aesthetic/machine-aesthetic.html` § 05, which argues lineage,
names four *living peers* (no Léger, Tinguely, *Cybernetic Serendipity*, Pfaff, or
Lipski), and concedes in writing that the work "has not yet closed this gap."
Excellent studio thinking; in an acquisition context it reads as
self-disqualification.

### Honest caveat

"Not selling" is an **effect** of position, not a cause — 19 institutions already
bought, and Max Estrella sells at the Armory. Adopt the posture without the
placements and you get an empty list.

**But the structure still transfers**, and it makes the homepage a **scoreboard**.
Strategy becomes two words: **add lines.**

### Prices live one click in, not on the front door

Front = proof of presence · Depth = information · Contact = one line, no pitch.

## Claim hygiene — submission ≠ accomplishment (user, 2026-08-20)

**User:** listing *Prix Ars Electronica* as an accomplishment is wrong — applying
is not an achievement. *The Wrong Biennale — Eclipse* **is** real and stays.

**Why this matters more than it looks.** The deployment map's only job is
verifiable proof. A curator who checks one line and finds a submission dressed as
an exhibition discounts **every** line. One soft claim costs the whole scoreboard.

**Removed** from `drafts/homepage-deployment-map-candidate.html` (deployment map
*and* the Selected CV "Exhibitions" group, where a submission was listed as an
exhibition) and from `drafts/homepage-streamlined-candidate.html`.

**Still live and still wrong:** `index.html` lists `Prix Ars Electronica` under
Selected CV → **Exhibitions** with no "submission" qualifier. Candidate A is the
replacement for that file, so promoting candidate A fixes it.

**Most of the repo already gets this right** — `sketches/traveling-landscape/`,
`installations/shared-ground.html`, and `program/DEADLINES.md` all say
"submission" or list it as a competition to enter. The defect was confined to the
homepage CV block.

**Rule going forward:** the deployment map carries only *placements* — shown,
installed, collected, or commissioned. Submissions, applications, and
longlistings do not appear, or appear in a separately labeled group that says so.

**Unverified, needs user confirmation:** *Async Museum — inaugural exhibition*.
*Miradas Tangentes* (Madrid) and *The Wrong Biennale — Eclipse* are confirmed real.

## Installation photography is the evidence (user, 2026-08-20)

**Found in repo:** `sketches/loop-art-critique-2026/assets/technical-objects-exist-installation.jpg`
— professional documentation of *Technical Objects Exist*, Loop Art Critique + ICA
Miami. Screen on a stand, plinth with headphones, didactic panel, and the
exhibition wall text with the participating-artist list legible on the right.

**Why it outranks the live carousel in the primary slot:** the carousel proves the
work *runs*. The photograph proves it was *installed in an institution* — the
gallery wall, the wall text, the lighting, and the plinth do that work before any
caption is read. That is the same claim a deployment-map line makes, except a
skeptical reader cannot discount it.

Practical: loads instantly, works offline, works over `file://`, and sidesteps the
carousel's HTTPS-only iframe behavior.

**What makes an installation photo function as evidence** — the room has to be
legible as an institution. A screen that could be anywhere proves nothing; wall
text, didactics, and gallery architecture in frame prove placement. A visitor in
frame additionally reads as *in use*.

**Action:** locate the Madrid / *Miradas Tangentes* documentation and any other
install photography. Every documented placement is a homepage asset and a line on
the scoreboard. This is the cheapest credibility available and it already exists —
it is just not on the site.

## Precedent — Reas and Lozano-Hemmer went sideways on two different tracks (user, 2026-08-20)

User observation: both are **educators who moved into the artwork sideways**, and
the educator persona is one he is already comfortable in. Correct, and it closes
the announcement-risk question — see § *Teaching removes the announcement risk*.
**Neither ever declared a career change.** Reas was a professor who made work until
the work was significant. Nobody was told. That is the mechanism, demonstrated
twice.

But they went sideways along **two different tracks**, and only one is still open:

| | **Reas track — build the tool** | **Lozano-Hemmer track — author the standard** |
|---|---|---|
| Authority from | Infrastructure the whole field adopted | Solving the institution's actual problem |
| Artifact | Processing (2001), *Form+Code*, teaching at UIUC | *Best Practices for Conservation of Media Art from an Artist's Perspective*; published studio source code |
| Why it worked | Every generative artist passed through his tool, so his artwork is art-historically legible | Institutions trust him with permanent placement because he answered year-fifteen before they asked |
| Open to user? | **Largely closed.** Processing exists; that window was 2001, and it is a software-product bet | **Open, and it is his existing expertise** |

**The consequence:** 30 years on the institutional side cannot make him Reas. It
makes him unusually able to run the Lozano-Hemmer play — the conservation and
procurement standard nobody has written. That is already identified in this
document as the *sendable instrument* and the *conservation asset*; the precedent
confirms it is the higher-leverage track.

**Content implication.** Of the two teaching clusters in candidate B, the
institutional one ("what do you actually own in year fifteen," "who maintains it,"
"what does it cost") is the one with precedent behind it. The blockchain cluster
serves a real and different funnel — the individual collector who wants to buy and
cannot work the mechanism — and is worth testing, but it is not the canon play.

**Also:** neither of them ever stopped teaching. The "How to" section is permanent
load-bearing infrastructure, not a traffic hack to be removed once inquiries start.

## Register — write up, not down (user, 2026-08-20)

**User:** the guide works for the Youngstown reader but "doesn't work well for
peers." Correct, and it is a real conflict: curators, practitioners, and Ars
Electronica-adjacent readers land on the same pages as the newcomer, and a
remedial register tells them he is not a serious practitioner.

**The resolution is not to make the writing harder.** Lozano-Hemmer's
conservation document is technically precise and a novice can still read it — it
works because it is *clear*, not because it is *simplified*. Clarity costs
nothing with peers; simplification costs standing.

**Cut the reassurance layer.** These are the specific tells in the current
drafts, and they are the exact lines that also read as condescending:

| Cut | Why |
|---|---|
| "That is an entirely reasonable place to start" | Reassures about a question nobody was ashamed of |
| "It assumes you are intelligent and that nobody has ever explained any of this to you" | Announces the reader's ignorance |
| "You are welcome to disagree" | Pre-apologizes for having a view |
| "If you only read one thing…" | Frames the reader as unwilling to read |
| "so take the opinions here as opinions" | Hedges the one thing peers respect |

**Keep instead:** precise terms used without apology, dates, named institutions,
primary sources, exact exhibition titles. Specificity is what peers check for and
it does not cost the newcomer anything — it is what she needs in the board
meeting.

**Rule:** explain the thing, never explain the reader.

## Navigation reduced to three (user, 2026-08-20)

**Guide · Catalog · Contact.** Reasoning, from the consulting site: every
transaction ends in email, and at ~55 visitors/month fewer paths means less
leakage.

Installations, Exhibitions, Practice, and Bio/CV stay reachable as **contextual
links inside the deployment map**, where the evidence sits and the link is earned.
`/available/` drops out of nav entirely while it reads "0 available now."

**Watch item:** the CV carries Smithsonian and Fulbright, which is the credential
set that makes a civic funding body comfortable. It must stay prominent inside the
deployment block, not merely reachable.

**Two candidates now exist to test:**

| File | Shape |
|---|---|
| `drafts/homepage-deployment-map-candidate.html` | **A** — full existing homepage, restructured: install photo, carousel, deployment map, three-item nav |
| `drafts/homepage-streamlined-candidate.html` | **B** — minimal. Name, install photo, deployment map, contact — then a rule, then "How to — New Media" |

## The metric

> ### ⚠ Visitors is the wrong number
>
> A homepage change **cannot** move visitor count — arrival is determined before
> someone lands. The homepage governs only what happens after.
>
> **Proof:** the consulting homepage change produced near-daily emails while
> Search Console barely registered it.
>
> **Measure inquiries, 30 days, against a baseline of ~0.**

### What 90 days can and cannot answer

| Can | Cannot |
|---|---|
| Does a fixed front door produce any qualified inquiry | Whether this is a business (1–2 yeses/yr won't show in a quarter) |
| Which rung/work inquiries name | Revenue projection |
| Will anyone accept a real price | Whether to leave consulting |

**Kill criterion.** Working front door + published depth + bought traffic yielding
**zero** inquiries ⇒ the door is not the website. Next hypothesis becomes
relational/curatorial — consistent with 39% of search clicks being people typing
the name.

### Scale of the target

At $100k+ per commission, replacing consulting income needs **one or two yeses per
year** — a few dozen well-chosen conversations. A list problem, not a marketing
problem.

---

# Evidence base

## `mark-walhimer.com` — Search Console, 3 months to 2026-08-18

**720 impressions, 56 clicks.** ~8 impressions/day. Growing (~4.5/day in late May
to ~9.5/day in August) from near zero.

- **39% of all clicks are the query "mark walhimer"** (22 clicks, 134 impressions,
  position 2.58). The site works as a business card for people who already know the
  name.
- **Only one query in the top three with >1 impression:** "mark walhimer" at 2.58.
- **The second-largest query cluster is museum planning, not art** — 41
  impressions across five museum-planning queries (positions 13.8–67) versus ~2
  for art-installation intent. **20:1.** Google reads the art domain as a
  consulting site; `/bio/index.html` (107 impr) is the likely magnet.
- **Commission-intent queries are absent.** "generative art installation" — 1
  impression, position 59. "living art installation" — 1, position 13.
- **Commerce pages are seen and ignored:** `/available/` 20 impr / 0 clicks /
  **position 4** · `/contact/` 48 / 0 / 19.7 · `/#commission` 3 / 0 / 1.67.
- **Only organic non-name demand is tool seekers** — "technical drawing
  generator," "elevation maker," "engineering drawing generator." They want free
  CAD software. Explains zero-click impressions from Vietnam (28), India (26),
  Philippines (18), Thailand (12), Bangladesh (9).
- **Artwork titles with any recurring volume:** async museum (17), the living
  commons + living commons (16), machine aesthetic (3), bloom variants (3).
- **Surrender Machine has zero search demand.** No query for it appears. The page
  drew 8 impressions, 1 click, position 4.25. May simply mean the name is unknown.

> **Limitation:** Search Console reports only queries where the site *appeared*.
> Absence cannot distinguish "no volume" from "ranks too low to surface." The door
> is **unbuilt**, not proven closed.

## X analytics — what survived leave-one-out testing

572 original posts / 12 months. Four of seven apparent findings were a single post
wearing a category's name. Survivors:

| Holds | Ratio after removing top post |
|---|---|
| Surrender Machine leads on reposts | 1.76× |
| Surrender Machine leads on likes | 1.35× |
| Naming three.js lifts bookmarks | 1.33× |
| Technical spec captions lift bookmarks | 1.34× |

No sale, no gallery conversation, no collector inquiry across the whole year.

## Surfaces and the price problem

| Surface | Volume | Audience | Public price |
|---|---|---|---|
| verse.works/mark-walhimer | ~115 works | 1 follower | — |
| transient.xyz/@markwalhimer | ~33 works, all 1/1 | 7 followers, 7 collectors | sold at 0.00013Ξ |
| objkt.com/@markwalhimer | dozens | — | 2–25 ꜩ |
| raster.art/collector/markwalhimer | 192 items (~55 own) | — | — |
| @WalhimerArt (X) | 572 posts/yr | median 58 impressions | — |
| Instagram | — | top posts ~2K views | — |
| mark-walhimer.com | featured works | — | commissions from $100,000 |

Also present historically: Foundation (closed), Zora, Rodeo, fx(hash),
Bootloader, Teia, Rarible, editart, Async Museum.

**150+ works publicly listed at or near zero; the only other published price is
$100,000. Nothing between.** A curator doing due diligence finds the cheap tier
first, because it is larger, older, and more indexed than the offer.

## Site defects

- `/available/` — position 4, 20 impressions, **0 clicks**, because it reads "0
  available now."
- ~90 near-textless pages indexed, including `test.html`, `Untitled3.html`,
  `convergence-era-v3 copy 2.html`.
- `Machine Aesthetic/` — capitals and a literal space in the URL; six or more
  near-duplicate copies with no canonical.

## Assets the metrics never saw

- Studios of Judy Pfaff (1985) and Donald Lipski (1987); Pratt MFA; Skidmore BA
- Fulbright Specialist, U.S. Department of State
- Smithsonian Institution design consultant
- Author, *Museums 101* and *Designing Museum Experiences* (Bloomsbury)
- Technical Objects Exist — Loop Art Critique + ICA Miami, curated by Doreen
  Rios, June 11 – October 5, 2026
- Miradas Tangentes, Madrid, curated by @luzotxoa
- Async Museum first exhibition; Creative Applications feature
- ~20 competition and residency applications in 2026 (Ars Electronica,
  Serpentine, Arts at CERN, ZKM Hertzlab, Schloss Solitude, Lumen, VH Awards,
  Marfa, El Paso Public Art, The Wrong Eclipse) — 2 accepted
- A 192-piece collection including Tabor Robak, Marius Watz, Joshua Davis,
  Leander Herzog, Piter Pasma, Zancan, Kevin Abosch, Botto
- Proven delivery of $100k+ exhibition projects across multiple organizations
- Two years as interim museum director

## The conservation asset

| Existing practice | Conservation meaning |
|---|---|
| Repo rule: self-contained HTML, no external CDN, all libs vendored, runs offline | Exactly what a conservator requires |
| Machine DNA — seed, deterministic, same hash → same work anywhere | Re-instantiable, not a decaying file |
| "A recording of the loop is an output. It is not the work." | The work is the algorithm, which is conservable |

Most digital artists cannot make this claim. **It is a demonstration, not a claim:
turn off the WiFi and open the page.**

## Target market

**US, not Mexico.** Living in Mexico, no plans to leave, but $100,000 is a
materially harder sale there. Lead with the US-institutional record. Write
educational content in US procurement vocabulary — RFP, capital project,
percent-for-art, budget phase.

---

## Removed from this document (do not re-derive)

Disproven or superseded, kept as one-liners only so they are not rediscovered:

- Physical-context framing beats screen captures — **dead** (leave-one-out).
- `float` as a strong series — **dead**; one repost by @threejs (~120k followers)
  produced 19.5% of the year's bookmarks. Not reproducible by tagging.
- Exhibition posts drive followers — **dead**; entirely one outlier.
- Surrender Machine on profile visits — **dead**.
- djkero as a valuable repeat collector — **dead**; proposed a wash-trading
  scheme.
- Mexico as an audience signal — **retracted**; tiny volume, likely inflated by
  self-generated searches.
- "Rank #1 for 'interactive art installation'" — **superseded**; the transferable
  mechanism is educational content, not service-term ranking.
- "What is generative art" ruled out as student bait — **corrected**; the missing
  audience qualifier was the problem, not the topic.
- Publish a three-rung priced ladder / pen plotter print / a $40 piece —
  **dropped**; conflicts with the benchmark and with needing 1–2 high-value yeses.
- "Teach small institutions, get referred to large ones" — **superseded** by the
  arts-commission → city-council mechanism.
- Conservation standard as first priority — **reprioritized**; it serves the
  slower door.
- "Posting isn't how you work" — **wrong**; it is studio practice.
- "Social's only job is to cause a name search" applied to LinkedIn — **wrong**;
  LinkedIn is built distribution to buyers.
- Canon required for every door — **wrong**; not required for civic commissions.

---
---

# Below the line — `museumplanning.com` and the funnel

## Resiliency positioning — user wants it removed (2026-08-20)

**User signal:** resiliency has produced **no inbound responses**. Meanwhile the
last week produced **multiple unsolicited emails about ordinary museum projects** —
possibly lower budget and slower, but real and arriving on their own.

**This is the same finding as the artwork side, applied to consulting:** the
metric is email, and the positioning that generates email wins over the
positioning that sounds most differentiated. Resiliency was a bet on a category;
regular project work is demonstrated demand.

**Not a fast fix — do not attempt in a single pass.** Scope to check first:
`index-resiliency-home.html` (a full homepage variant, distinct from
`index.html`), the org JSON-LD description ("Museum consultants for resiliency
planning…"), any `/museum-cultural-resiliency*` pages and nav entries, sitemap
and search-index entries, and
`drafts/museum-cultural-resiliency-planning-{governing-document,internal-brief}.md`
in the artist repo. Needs its own session with the same delete → regenerate →
verify sequence used for `immersive-mexico`.

## `digital-exhibits/` — leave as-is (user, 2026-08-20)

[Delivery proofs page](https://museumplanning.com/digital-exhibits/index.html) is
explicitly framed "Proofs for internal review — not a public product catalog," and
funded only through a Modular Implementation Menu line item. User: fine as-is,
build out later. The two remaining "Shared Ground" text mentions stay.


**Analysis only.** Per repo rules, edits belong in `Museum-Planning-LLC/website-2.0`,
not here.

## Context

Two years as interim museum director; the site went into stasis. Now moving off
WordPress to GitHub, and consolidating `museumplanner.org` and
`museumcourses.com` into `museumplanning.com/museum-school` to stop
self-cannibalizing. `museumcourses.com` still needs closing.

## Search Console control — same 3 months

**40,917 impressions, 629 clicks** — 57× the impressions and 11× the clicks of the
artist site.

> **Correction to a working assumption.** The site is **not** #1 for "museum
> planning." It is #1 for **"museum planning llc"** — its own brand name.
> Structurally identical to "mark walhimer" on the artist site.

| Query | Impr. | Clicks | Position | CTR |
|---|---:|---:|---:|---:|
| museum planning **llc** | 45 | 30 | **1.0** | 66.7% |
| museum planning | 587 | 6 | 10.0 | 1.0% |
| museum planner | 230 | 3 | 5.5 | 1.3% |
| museum planners | 244 | 3 | 15.3 | 1.2% |
| museum planning firm | 223 | 1 | 16.7 | 0.5% |

## The engine is Museum School

| Page | Clicks | Impr. | Position |
|---|---:|---:|---:|
| `/museum-school/how-to-start-a-museum.html` | **158** | 8,306 | 6.1 |
| `/` homepage | 113 | 5,112 | 23.0 |
| `/museum-school/museum-exhibition-design/` | 96 | 8,061 | 25.6 |
| `/museum-school/index.html` | 25 | 1,763 | 14.9 |
| `/museum-school/how-much-do-museum-exhibits-cost.html` | 14 | 407 | 6.1 |
| `/museum-school/what-is-a-museum-feasibility-study.html` | 9 | 143 | 4.5 |
| `/museum-planning-services.html` | 6 | 1,049 | 33.9 |
| `/museum-planning-contact.html` | 4 | 149 | 17.0 |

**Museum School ≈ 339 of 629 clicks (54%).** Homepage ≈ 121 (19%). All service,
about, and contact pages combined ≈ 119 (19%). One free article outperforms every
commercial page put together.

**The read is confirmed:** the how-to audience isn't hiring — 542 impressions and
11 clicks for "how to start a museum" against six clicks for the services page.
Different people. Content earns traffic and standing; hiring arrives through the
brand-name search once someone already knows you exist.

## What actually ranks #1–3

**Trap:** three apparent position-1 results are `site:` operator self-audits —
`site:www.museumplanner.org` (103 impr, 1.04), `site:museumplanner.org` (42,
1.29), `site:www.museumplanning.com` (29, 1.00). Not demand.

Genuine top-three, brand excluded:

| Query | Impr. | Clicks | Position |
|---|---:|---:|---:|
| how to open a children's museum | 15 | 0 | 2.07 |
| how to start a children's museum | 58 | 3 | 2.52 |
| museum strategic plan examples | 7 | 1 | 2.57 |
| créer un musée privé | 6 | 0 | 1.83 |

**The owned niche is children's museums**, not museum planning generally.

## Prioritized fixes

### MP-P0 — migration critical

- [ ] **Consolidate hostnames.** `https://museumplanning.com/`,
      `https://www.museumplanning.com/…`, and `http://museumplanning.com/` (534
      impr, 8 clicks) all serve as separate pages — up to four variants splitting
      link equity. **The same cannibalization the domain consolidation is meant to
      fix, one level down.** A redirect rule, not a content project.
- [ ] **Verify `museumplanner.org` redirects.** `site:` queries show it is still
      indexed.
- [ ] **Close `museumcourses.com`** with 301s into `museum-school`.
- [ ] **Preserve `/museum-school/how-to-start-a-museum.html`'s URL through the
      WordPress→GitHub move.** It is 25% of all site clicks. A broken redirect
      here costs more than everything else combined.

### MP-P1 — highest-value single fixes

- [ ] **"designing museum experiences"** — own book title, 410 impressions,
      **position 48.8, zero clicks.** The stated conversion for Museum School
      traffic is book sales, and the book title ranks 49th. Highest-value single
      page in the dataset.
- [ ] **Double down on children's museums.** The only genuine top-three territory.
      Expand it rather than fighting for "exhibition design."
- [ ] **More cost pages.** `how-much-do-museum-exhibits-cost` ranks 6.1 with the
      highest CTR of any major page. **Cost questions carry the most intent in
      either dataset.**

### MP-P2 — headroom

Positions 5–15, where movement converts:

museum planner (230 impr, 5.5) · how to open a museum (136, 6.6) · full-service
exhibit fabrication (143, 9.5) · museum architects and planners (146, 9.6) ·
museum planning (587, 10.0) · how to start a museum (542, 10.5) · master planning
for museums (146, 13.8) · museum campaign feasibility study (150, 14.9) · science
museum planner (145, 15.4) · museum planners (244, 15.3).

Stranded at positions 20–60 (~4,000 impressions/quarter, effectively zero CTR) —
treat as a separate, later project:

exhibition design (794, 43.1) · exhibit design (580, 36.3) · museum exhibit design
(334, 26.4) · how to create a museum (259, 23.4) · museum feasibility studies
(192, 23.4) · exhibition planning (190, 61.7) · institutional museum planning
(186, 24.0).

## The funnel gap

Museum School earns 54% of clicks. The services and contact pages earn 19%
between them. **There is no bridge.**

- The MVI works because it is a *named, sendable instrument* that establishes
  shared framing without pitching. That mechanism is proven — it needs more
  instances, not more service copy.
- Museum School pages should each route to a next artifact (an index, a guide, a
  checklist), not to a services page.
- The homepage sits at position 23.0 on 5,112 impressions — a poor position for a
  homepage — but it converts, and the mid-July projects-first change is why. Do
  not undo it during the migration.

## The boundary decision — RESOLVED 2026-08-20

Interactive and immersive demand is already landing on the **consulting** site:

| Query | Impr. | Clicks | Position |
|---|---:|---:|---:|
| immersive experience planning | 95 | 0 | 11.5 |
| co polk interactive museum | 161 | 0 | 7.2 |
| interactive exhibit design | 20 | 0 | 41.3 |
| interactive museum design | 11 | 0 | 39.7 |

**Decision: keep the two separate for now**, so each property stays measurable on
its own. `museumplanning.com` keeps whatever immersive/interactive demand it
already earns; the artist site builds its own. No cross-promotion.

Consequence: the decoupling work in **P2a** above is required, because the art
domain currently carries an explicit `sameAs` claim to `museumplanning.com` plus
four Museum Planning LLC marketing pages. Without that cleanup the two funnels are
not separable and neither is measurable.

Revisit once the artist property has its own baseline.

## Caveats on this data

- `Queries.csv` accounts for 14,565 of 40,917 impressions — ~65% of impressions
  and ~81% of clicks sit in Google's withheld long tail. All figures are floors.
- The mid-July inflection (clicks/day: 6.4 → 8.2 → 9.7 → 12.7) is consistent with
  the projects-first homepage change but is not proof of causation; recovery from
  stasis also produces growth.
