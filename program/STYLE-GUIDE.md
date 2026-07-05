# Program — style guide

Voice, **rebrand visuals**, and post formats for daily mints (365/year) on mark-walhimer.com.

Mockup reference: `~/Desktop/rebrand/files (67)/markwalhimer-catalog.html`  
Site IA: [CATALOG.md](CATALOG.md)

---

## Positioning

Mark Walhimer publishes **numbered fragments** (`WS-NNNNNN`) of one world — generative works on Ethereum, daily when approved — within a practice of **physical objects** and **monumental installations**. Daily mints are studio publishing (20-year arc, ages 62–80); destination is commission-scale work.

Consulting is parallel — not the lead voice on daily posts.

---

## Rebrand visual tokens

Use on **catalog rebrand** (paper/red). Current white homepage remains until cutover.

| Token | Hex | Use |
|-------|-----|-----|
| `--paper` | `#f5f0e8` | Page background |
| `--ink` | `#111010` | Primary text |
| `--rule` | `#c8b89a` | Rules, borders |
| `--accent` | `#8b2020` | Links, Buy, italic emphasis |
| `--muted` | `#7a7060` | Meta, labels |
| `--pale` | `#ece6d8` | Thumbs, draft panels |
| `--green` | `#2a6b3a` | Pipeline active, approve |

**Typography**

- **Cormorant Garamond** — display, body on catalog site
- **DM Mono** — labels, meta, buttons, 9–10px uppercase tracking

**Components (mockup)**

- `.buy-btn` — accent background, paper text
- `.pipeline-status` — green pulse + last minted
- Section labels — DM Mono, letter-spacing `.2em`

---

## Naming

| Element | Format |
|---------|--------|
| Catalog ID | `WS-NNNNNN` |
| Title | `{Series} · WS-{n}` |
| Program day | Day {NNN} of {YYYY} |
| Files | `YYYY-MM-DD-{slug}` |
| Work URL | `/work/{slug}/` (TBD) |

Avoid “NFT drop”, “mint now”. Prefer “published”, “available”.

**CTA:** Buy on **mark-walhimer.com** — not “on Manifold” in copy.

---

## Voice

- Museum-adjacent, not crypto-bro
- Process visible in **context** posts, not every daily caption
- Gas: FAQ once (~$10 + fees)
- **12:00 ET** daily rhythm replaces FOMO
- Themes: focus/perception · cloud chambers · quantum · singularity · Machine DNA · acceptance / control / agency

---

## Export specs

| Use | Size |
|-----|------|
| Master | Source PNG |
| OG / work page | 1200 × 630 |
| Instagram | 1080 × 1080 or 4:5 |
| Story | 1080 × 1920 |
| X | 1600 × 900 or 1:1 |
| Newsletter | 600–800 px wide JPG |

No burned-in text on dailies v1.

---

## Cadence

| Channel | Frequency |
|---------|-----------|
| X + Instagram | **Daily** Post 1 on mint days |
| Newsletter | **Weekly** — 7 works + world paragraph |
| Context (Post 2) | ~Weekly or anchor weeks |
| TL Story | Optional from Post 2 |

Site newsletter signup copy:

> *Weekly studio digest — new works, competition news, and notes from the practice. Direct to your inbox.*

---

## Post 1 — Live (daily)

**X:**

```
{Series} · WS-{catalog#}

{One sentence.}

→ {workUrl}
```

**Instagram:**

```
{Series} · WS-{catalog#}

{1–2 sentences.}

Link in bio → mark-walhimer.com/catalog
```

---

## Post 2 — Context (weekly / anchors)

```
This week: {series or theme}.

{2–4 sentences — world, ARS/Lumen/CERN, monumental direction.}
```

---

## Newsletter — weekly

**Subject:** `Seven days — {Series} · WS-{first}–WS-{last}`

1. Seven fragments (thumb + link)
2. In the world (one paragraph)
3. Active series + 12:00 ET daily
4. Deadline line if &lt; 30 days ([DEADLINES.md](DEADLINES.md))
5. Objects/commission — quarterly

---

## Legal (FAQ)

- Copyright retained unless separate agreement
- ~$10 primary; 10% secondary royalty where enforced
- Commissions: mark@walhimer.com

---

## Drop JSON

See [drops.schema.json](drops.schema.json). Generated: `post1.txt`, weekly `newsletter-week-NN.md`.
