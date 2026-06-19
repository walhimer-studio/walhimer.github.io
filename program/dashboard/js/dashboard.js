/**
 * markwalhimer.com studio dashboard — POC
 * Loads state.json, renders pages, posts actions to local server.
 */
(function () {
  const API = "/api";
  let state = null;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatShortDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function todayLabel() {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function drafts() {
    return state.drops.filter((d) => d.status === "draft" && !d.skipped);
  }

  function socialQueue() {
    return state.drops.filter(
      (d) => d.status === "minted" && d.post1 && !d.post1.publishedAt && !d.post1.skipped
    );
  }

  function lastMinted() {
    const minted = state.drops
      .filter((d) => d.status === "minted" && d.mint?.mintedAt)
      .sort((a, b) => new Date(b.mint.mintedAt) - new Date(a.mint.mintedAt));
    return minted[0] || null;
  }

  function platformLabel(p) {
    if (p === "transient_labs") return "Transient Labs";
    if (p === "manifold") return "Manifold";
    return p || "—";
  }

  function resonanceBadge(r) {
    const map = { high: "badge-high", medium: "badge-medium", low: "badge-low" };
    const cls = map[r] || "badge-low";
    const label = r ? r.charAt(0).toUpperCase() + r.slice(1) : "—";
    return `<span class="badge ${cls}">${esc(label)}</span>`;
  }

  function seriesBadge(b) {
    const map = {
      available: ["badge-available", "Available"],
      minted: ["badge-minted", "Minted"],
      study: ["badge-tier3", "Study"],
    };
    const [cls, label] = map[b] || ["badge-neutral", b];
    return `<span class="badge ${cls}">${esc(label)}</span>`;
  }

  function tierBadge(tier) {
    if (tier === 1) return '<span class="badge badge-tier1">Core</span>';
    if (tier === 2) return '<span class="badge badge-tier2">Active</span>';
    return '<span class="badge badge-tier3">Study</span>';
  }

  function toast(msg) {
    let el = $("#toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2800);
  }

  async function api(action, payload = {}) {
    const res = await fetch(`${API}/action`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || res.statusText);
    }
    state = await res.json();
    render();
    return state;
  }

  async function loadState() {
    const res = await fetch(`${API}/state`);
    if (!res.ok) throw new Error("Failed to load state");
    state = await res.json();
  }

  function draftRow(d, { showControls = true } = {}) {
    const platform = d.mint?.platform || state.pipeline.defaultPlatform;
    return `
      <div class="item" data-drop-id="${esc(d.id)}">
        <div style="display:flex;gap:14px">
          <div class="draft-thumb">${d.previewUrl ? `<img src="${esc(d.previewUrl)}" alt="">` : "preview"}</div>
          <div style="flex:1">
            <div class="item-top">
              <div>
                <div class="item-name">${esc(d.title)}</div>
                <div class="item-meta">Generated ${formatShortDate(d.date)} · ${esc(d.medium)} · ${esc(d.catalogNumber)} · ${esc(d.series)}</div>
              </div>
              <span class="badge badge-draft">Draft</span>
            </div>
            ${d.notes ? `<div class="item-note">${esc(d.notes)}</div>` : ""}
            ${
              showControls
                ? `<div class="item-actions">
              <button class="btn btn-green" data-action="approve" data-id="${esc(d.id)}">Approve → Mint</button>
              <button class="btn" data-action="preview" data-id="${esc(d.id)}">Preview live</button>
              <button class="btn btn-red" data-action="reject" data-id="${esc(d.id)}">Reject</button>
              <div style="margin-left:auto;display:flex;gap:6px;align-items:center">
                <span style="font-size:11px;color:var(--muted)">Edition:</span>
                <select data-field="edition" data-id="${esc(d.id)}">
                  <option value="1/1" ${d.edition === "1/1" ? "selected" : ""}>1/1</option>
                  <option value="open" ${d.edition === "open" ? "selected" : ""}>Open edition</option>
                  <option value="limited:5" ${d.edition === "limited:5" ? "selected" : ""}>Limited 5</option>
                  <option value="limited:10" ${d.edition === "limited:10" ? "selected" : ""}>Limited 10</option>
                </select>
                <span style="font-size:11px;color:var(--muted)">Marketplace:</span>
                <select data-field="platform" data-id="${esc(d.id)}">
                  <option value="transient_labs" ${platform === "transient_labs" ? "selected" : ""}>Transient Labs</option>
                  <option value="manifold" ${platform === "manifold" ? "selected" : ""}>Manifold</option>
                </select>
              </div>
            </div>`
                : ""
            }
          </div>
        </div>
      </div>`;
  }

  function socialItem(d, expanded = true) {
    const ig = d.post1?.instagram || "";
    const x = d.post1?.x || "";
    if (!expanded) {
      return `
        <div class="item" style="opacity:.6" data-drop-id="${esc(d.id)}">
          <div class="item-top" style="margin-bottom:8px">
            <div><div class="item-name">${esc(d.title)}</div><div class="item-meta">Minted ${formatShortDate(d.mint?.mintedAt || d.date)} · ${esc(d.medium)} · ${esc(d.series)}</div></div>
            <span class="badge badge-draft">Draft</span>
          </div>
          <div style="font-size:12px;color:var(--muted);font-style:italic">Captions drafted — expand to review and edit before posting</div>
        </div>`;
    }
    return `
      <div class="item" data-drop-id="${esc(d.id)}">
        <div class="item-top" style="margin-bottom:8px">
          <div><div class="item-name">${esc(d.title)}</div><div class="item-meta">Minted ${formatShortDate(d.mint?.mintedAt || d.date)} · ${esc(d.medium)} · ${esc(d.series)}</div></div>
          <span class="badge badge-draft">Draft</span>
        </div>
        <div class="two-col" style="margin-bottom:12px">
          <div class="social-caption" style="margin-bottom:0">
            <div class="social-label">Instagram — visibility platform</div>
            <textarea data-caption="instagram" data-id="${esc(d.id)}">${esc(ig)}</textarea>
          </div>
          <div class="social-caption" style="margin-bottom:0">
            <div class="social-label">Twitter / X — working platform</div>
            <textarea data-caption="x" data-id="${esc(d.id)}">${esc(x)}</textarea>
          </div>
        </div>
        <div class="item-actions">
          <button class="btn btn-primary" data-action="post-both" data-id="${esc(d.id)}">Post both</button>
          <button class="btn" data-action="post-ig" data-id="${esc(d.id)}">Instagram only</button>
          <button class="btn" data-action="post-x" data-id="${esc(d.id)}">Twitter / X only</button>
          <button class="btn" data-action="save-captions" data-id="${esc(d.id)}">Save edits</button>
          <button class="btn" data-action="skip-social" data-id="${esc(d.id)}">Skip</button>
        </div>
      </div>`;
  }

  function renderToday() {
    const d = drafts();
    const s = socialQueue();
    const lm = lastMinted();
    const p = state.pipeline;

    $("#page-today").innerHTML = `
      <div class="poc-banner">POC — actions update <code>program/dashboard/data/state.json</code> via local server. Mint/post are simulated (no chain or social APIs yet).</div>
      <div class="top-bar">
        <h2>Today</h2>
        <div class="date-label">${todayLabel()} · ${p.totalWorks} works in catalog</div>
      </div>
      <div class="metric-grid">
        <div class="metric"><div class="metric-label">Drafts awaiting approval</div><div class="metric-value">${d.length}</div><div class="metric-sub metric-warn">Review before minting</div></div>
        <div class="metric"><div class="metric-label">Social posts queued</div><div class="metric-value">${s.length}</div><div class="metric-sub metric-warn">Approve before posting</div></div>
        <div class="metric"><div class="metric-label">Last minted</div><div class="metric-value">${lm ? formatShortDate(lm.mint.mintedAt) : "—"}</div><div class="metric-sub metric-up">${lm ? esc(lm.title) : "None yet"}</div></div>
        <div class="metric"><div class="metric-label">Works available</div><div class="metric-value">${p.available}</div><div class="metric-sub">On ${platformLabel(p.defaultPlatform)}</div></div>
      </div>
      <div class="two-col">
        <div class="panel">
          <div class="panel-title">Approval queue — top draft</div>
          ${
            d.length
              ? `${draftRow(d[0], { showControls: true })}
            <div style="font-size:11px;color:var(--muted);border-top:0.5px solid var(--rule);padding-top:12px;margin-top:12px">${d.length - 1} more draft${d.length > 2 ? "s" : ""} waiting · <a href="#" data-nav="approvals">View all →</a></div>`
              : '<p style="font-size:13px;color:var(--muted)">No drafts in queue.</p>'
          }
        </div>
        <div class="panel">
          <div class="panel-title">Social post queue — top item</div>
          ${
            s.length
              ? socialItem(s[0], true)
              : '<p style="font-size:13px;color:var(--muted)">No posts awaiting approval.</p>'
          }
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">Pipeline status at a glance</div>
        <div class="pipeline-strip">
          <div class="pipeline-cell"><div class="num">${d.length}</div><div class="lbl">Drafts</div></div>
          <div class="pipeline-cell"><div class="num" style="color:var(--accent)">${p.approved}</div><div class="lbl">Approved</div></div>
          <div class="pipeline-cell"><div class="num" style="color:var(--purple)">${p.minted}</div><div class="lbl">Minted</div></div>
          <div class="pipeline-cell"><div class="num" style="color:var(--green)">${p.available}</div><div class="lbl">Available</div></div>
          <div class="pipeline-cell"><div class="num">${p.sold}</div><div class="lbl">Sold</div></div>
        </div>
      </div>`;
  }

  function renderSocial() {
    const s = socialQueue();
    $("#page-social").innerHTML = `
      <div class="top-bar"><h2>Social queue</h2><div class="date-label">${s.length} post${s.length === 1 ? "" : "s"} awaiting approval</div></div>
      <div class="panel">
        <div class="panel-title">Auto-drafted on mint — approve before publishing</div>
        <div style="font-size:12px;color:var(--muted);margin-bottom:20px;line-height:1.7">Each approved mint auto-drafts captions for Instagram and Twitter/X separately. Edit before posting.</div>
        ${s.length ? s.map((d, i) => socialItem(d, i === 0)).join("") : '<p style="color:var(--muted)">Queue empty.</p>'}
      </div>
      <div class="panel">
        <div class="panel-title">Recently posted — last 7 days</div>
        ${state.recentPosts
          .map((r) => {
            const plat =
              r.platforms === "both"
                ? '<span style="font-size:11px;color:var(--green);font-weight:500">Both platforms ✓</span>'
                : '<span style="font-size:11px;color:var(--muted)">Instagram only</span>';
            return `<div class="nl-row"><span>${esc(r.title)}</span><span style="font-size:11px;color:var(--muted);font-family:'DM Mono',monospace">${esc(r.date)}</span>${plat}</div>`;
          })
          .join("")}
      </div>`;
  }

  function renderApprovals() {
    const d = drafts();
    $("#page-approvals").innerHTML = `
      <div class="top-bar"><h2>Approval queue</h2><div class="date-label">${d.length} draft${d.length === 1 ? "" : "s"} · Generate → Approve → Mint</div></div>
      <div class="panel">
        <div class="panel-title">Drafts awaiting review</div>
        ${d.length ? d.map((x) => draftRow(x)).join("") : '<p style="color:var(--muted)">No drafts.</p>'}
      </div>`;
  }

  function renderCatalog() {
    const p = state.pipeline;
    const tiers = [
      { label: "Tier 1 — Core series", tier: 1 },
      { label: "Tier 2 — Active series", tier: 2 },
      { label: "Tier 3 — Experiments & studies", tier: 3 },
    ];
    const rows = tiers
      .map(
        (t) => `
      <div class="series-tier">${t.label}</div>
      ${state.series
        .filter((s) => s.tier === t.tier)
        .map(
          (s) => `
        <div class="series-row">
          <div><span class="series-name" ${s.tier === 3 ? 'style="color:var(--muted)"' : ""}>${esc(s.name)}</span></div>
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <span class="series-meta">${s.works} works · Updated ${esc(s.updated)}</span>
            ${s.tier < 3 ? seriesBadge(s.badge) : ""}
            ${tierBadge(s.tier)}
            ${s.flag ? `<span style="font-size:10px;color:var(--amber)">${esc(s.flag)}</span>` : ""}
          </div>
        </div>`
        )
        .join("")}`
      )
      .join("");

    $("#page-catalog").innerHTML = `
      <div class="top-bar"><h2>Catalog</h2><div class="date-label">${p.totalSeries} series · ${p.totalWorks} works · Updated ${formatShortDate(state.updatedAt)}</div></div>
      <div class="metric-grid">
        <div class="metric"><div class="metric-label">Total works</div><div class="metric-value">${p.totalWorks}</div><div class="metric-sub">Across ${p.totalSeries} series</div></div>
        <div class="metric"><div class="metric-label">Available</div><div class="metric-value">${p.available}</div><div class="metric-sub metric-up">On ${platformLabel(p.defaultPlatform)}</div></div>
        <div class="metric"><div class="metric-label">Sold</div><div class="metric-value">${p.sold}</div><div class="metric-sub">All time</div></div>
        <div class="metric"><div class="metric-label">Est. revenue</div><div class="metric-value">$${Math.round(p.revenueUsd / 1000)}K</div><div class="metric-sub metric-up">POC estimate</div></div>
      </div>
      <div class="panel">
        <div class="panel-title">Series — by priority</div>
        ${rows}
        <div style="border-top:0.5px solid var(--rule);padding-top:12px;margin-top:8px">
          <div style="font-size:10px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;font-family:'DM Mono',monospace">Hidden from public catalog</div>
          <div style="font-size:12px;color:var(--muted);line-height:2">${state.hiddenCatalog.map(esc).join(" · ")}</div>
        </div>
      </div>`;
  }

  function renderMinting() {
    const p = state.pipeline;
    $("#page-minting").innerHTML = `
      <div class="top-bar"><h2>Minting log</h2><div class="date-label">${p.minted} minted · ${p.sold} sold · $${Math.round(p.revenueUsd / 1000)}K revenue</div></div>
      <div class="two-col">
        <div class="panel">
          <div class="panel-title">Recent mints</div>
          ${state.mintingLog
            .map((m) => {
              const badge =
                m.status === "sold"
                  ? '<span class="badge badge-sold">Sold</span>'
                  : '<span class="badge badge-available">Available</span>';
              const price = m.priceEth ? ` · ${m.priceEth} ETH` : "";
              return `<div class="pipe-row"><span>${esc(m.title)}</span>${badge}<span class="pipe-value">${esc(m.date)} · ${platformLabel(m.platform)} · ${esc(m.edition)}${price}</span></div>`;
            })
            .join("")}
        </div>
        <div class="panel">
          <div class="panel-title">Marketplace split</div>
          ${state.marketplaceSplit
            .map(
              (m) => `
            <div class="bar-row"><span class="bar-label">${esc(m.name)}</span><div class="bar-track"><div class="bar-fill ${m.name.includes("Transient") ? "bar-fill-purple" : ""}" style="width:${m.pct}%"></div></div><span class="bar-pct">${m.pct}%</span></div>`
            )
            .join("")}
          <div class="divider"></div>
          <div class="panel-title" style="margin-bottom:12px">Edition types</div>
          ${state.editionSplit
            .map(
              (e, i) => `
            <div class="bar-row"><span class="bar-label">${esc(e.name)}</span><div class="bar-track"><div class="bar-fill ${i === 1 ? "bar-fill-green" : i === 2 ? "bar-fill-amber" : ""}" style="width:${e.pct}%"></div></div><span class="bar-pct">${e.pct}%</span></div>`
            )
            .join("")}
        </div>
      </div>`;
  }

  function renderAnalytics() {
    const a = state.analytics;
    const workRows = a.works
      .map(
        (w) => `
      <div class="c">${esc(w.title)}</div>
      <div class="c center">${w.igLikes}</div>
      <div class="c center">${w.igSaves}</div>
      <div class="c center">${w.twLikes}</div>
      <div class="c center">${w.twReposts}</div>
      <div class="c center">${resonanceBadge(w.resonance)}</div>`
      )
      .join("");

    const f = a.featured;
    $("#page-analytics").innerHTML = `
      <div class="top-bar"><h2>Analytics</h2><div class="date-label">Instagram vs Twitter/X · 30-day rolling</div></div>
      <div class="panel">
        <div class="panel-title">Per-work resonance — recent mints</div>
        <div class="analytics-grid">
          <div class="h">Work</div><div class="h center">IG likes</div><div class="h center">IG saves</div><div class="h center">TW likes</div><div class="h center">TW reposts</div><div class="h center">Resonance</div>
          ${workRows}
        </div>
      </div>
      <div class="two-col">
        <div class="panel">
          <div class="panel-title">Platform comparison — ${esc(f.title)}</div>
          <div class="platform-grid">
            <div class="platform-col">
              <div class="platform-label">Instagram — visibility platform</div>
              <div class="pipe-row" style="font-size:12px"><span class="pipe-stage">Likes</span><span class="pipe-count">${f.instagram.likes}</span></div>
              <div class="pipe-row" style="font-size:12px"><span class="pipe-stage">Saves</span><span class="pipe-count" style="color:var(--green)">${f.instagram.saves}</span></div>
              <div class="pipe-row" style="font-size:12px"><span class="pipe-stage">Comments</span><span class="pipe-count">${f.instagram.comments}</span></div>
              <div class="pipe-row" style="font-size:12px"><span class="pipe-stage">Reach</span><span class="pipe-count">${f.instagram.reach.toLocaleString()}</span></div>
              <div class="pipe-row" style="font-size:12px;border:none"><span class="pipe-stage">Read</span><span style="font-size:11px;color:var(--green);font-weight:500">${esc(f.instagram.read)}</span></div>
            </div>
            <div class="platform-col">
              <div class="platform-label">Twitter / X — working platform</div>
              <div class="pipe-row" style="font-size:12px"><span class="pipe-stage">Likes</span><span class="pipe-count">${f.twitter.likes}</span></div>
              <div class="pipe-row" style="font-size:12px"><span class="pipe-stage">Reposts</span><span class="pipe-count" style="color:var(--green)">${f.twitter.reposts}</span></div>
              <div class="pipe-row" style="font-size:12px"><span class="pipe-stage">Replies</span><span class="pipe-count">${f.twitter.replies}</span></div>
              <div class="pipe-row" style="font-size:12px"><span class="pipe-stage">Impressions</span><span class="pipe-count">${f.twitter.impressions.toLocaleString()}</span></div>
              <div class="pipe-row" style="font-size:12px;border:none"><span class="pipe-stage">Read</span><span style="font-size:11px;color:var(--green);font-weight:500">${esc(f.twitter.read)}</span></div>
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-title">Action queue — flagged works</div>
          ${a.actions
            .map((x) => {
              const color =
                x.tone === "green"
                  ? "var(--green)"
                  : x.tone === "amber"
                    ? "var(--amber)"
                    : x.tone === "red"
                      ? "var(--red)"
                      : "var(--muted)";
              return `<div class="resonance-row"><span>${esc(x.title)}</span>${resonanceBadge(x.resonance)}<span style="font-size:11px;color:${color}">${esc(x.action)}</span></div>`;
            })
            .join("")}
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">Series performance — resonance by series</div>
        ${a.seriesPerformance
          .map((s) => {
            const fill =
              s.tone === "green"
                ? "bar-fill-green"
                : s.tone === "amber"
                  ? "bar-fill-amber"
                  : "";
            const pctClass = s.tone === "green" ? "bar-pct-up" : "";
            return `<div class="bar-row"><span class="bar-label">${esc(s.name)}</span><div class="bar-track"><div class="bar-fill ${fill}" style="width:${s.pct}%"></div></div><span class="bar-pct ${pctClass}">${esc(s.label)}</span></div>`;
          })
          .join("")}
      </div>
      <div class="panel">
        <div class="panel-title">Diagnostic — what the data is saying</div>
        <div class="three-col">
          ${a.diagnostics
            .map(
              (d) => `
            <div class="diag-card diag-${d.type}"><div class="diag-title">${esc(d.title)}</div><div class="diag-body">${esc(d.body)}</div></div>`
            )
            .join("")}
        </div>
      </div>`;
  }

  function renderNewsletter() {
    const n = state.newsletter;
    $("#page-newsletter").innerHTML = `
      <div class="top-bar"><h2>Newsletter</h2><div class="date-label">Direct channel · Not platform-dependent</div></div>
      <div class="two-col">
        <div class="panel">
          <div class="panel-title">Recent sends</div>
          ${n.recent
            .map(
              (r) =>
                `<div class="nl-row"><span>${esc(r.subject)}</span><span style="font-size:11px;color:var(--muted);font-family:'DM Mono',monospace">${esc(r.date)} · ${r.subs} subs</span><span class="nl-rate">${r.openRate}%</span></div>`
            )
            .join("")}
          <div class="divider"></div>
          <div class="item-actions">
            <button class="btn btn-primary" data-action="stub" data-msg="Mailchimp draft — not wired in POC">Draft next issue</button>
            <button class="btn" data-action="stub" data-msg="Mailchimp history — not wired in POC">View all sends</button>
          </div>
        </div>
        <div class="panel">
          <div class="panel-title">Subscriber breakdown</div>
          <div class="pipe-row"><span class="pipe-stage">Total subscribers</span><span class="pipe-count">${n.subscribers}</span><span class="pipe-value">POC data</span></div>
          ${n.segments
            .map(
              (s) =>
                `<div class="pipe-row"><span class="pipe-stage">${esc(s.label)}</span><span class="pipe-count">${s.count}</span><span class="pipe-value">${esc(s.note)}</span></div>`
            )
            .join("")}
          <div class="pipe-row"><span class="pipe-stage">Avg open rate</span><span class="pipe-count">${n.avgOpenRate}%</span><span class="pipe-value metric-up">Mailchimp</span></div>
        </div>
      </div>`;
  }

  function renderCompetitions() {
    const c = state.competitions;
    const calClass = { active: "active", soon: "soon", future: "future", urgent: "urgent" };
    const calStatus = { active: "cal-green", soon: "cal-amber", future: "cal-muted" };
    $("#page-competitions").innerHTML = `
      <div class="top-bar"><h2>Competitions</h2><div class="date-label">June 2026 – June 2027</div></div>
      <div class="metric-grid">
        <div class="metric"><div class="metric-label">Upcoming deadlines</div><div class="metric-value">${c.upcoming}</div><div class="metric-sub">June 2026–2027</div></div>
        <div class="metric"><div class="metric-label">Works in preparation</div><div class="metric-value">${c.preparing}</div><div class="metric-sub">From analytics flags</div></div>
        <div class="metric"><div class="metric-label">Submitted to date</div><div class="metric-value">${c.submitted}</div><div class="metric-sub">See DEADLINES.md</div></div>
        <div class="metric"><div class="metric-label">Next deadline</div><div class="metric-value">${esc(c.nextDeadline.label)}</div><div class="metric-sub metric-warn">${esc(c.nextDeadline.note)}</div></div>
      </div>
      <div class="two-col">
        <div class="panel">
          <div class="panel-title">Competition calendar</div>
          ${c.calendar
            .map(
              (ev) => `
            <div class="cal-item ${calClass[ev.tone] || "future"}">
              <div class="cal-event">${esc(ev.event)}</div>
              <div class="cal-meta">${esc(ev.meta)}</div>
              <div class="cal-status ${calStatus[ev.tone] || "cal-muted"}">${esc(ev.status)}</div>
            </div>`
            )
            .join("")}
        </div>
        <div>
          <div class="panel" style="margin-bottom:16px">
            <div class="panel-title">Works being prepared — competition candidates</div>
            ${c.candidates
              .map(
                (w) => `
              <div class="item">
                <div class="item-top">
                  <div><div class="item-name">${esc(w.title)}</div><div class="item-meta">${esc(w.meta)}</div></div>
                  ${resonanceBadge(w.resonance)}
                </div>
                <div class="item-note">${esc(w.note)}</div>
                <div class="item-actions">
                  <button class="btn btn-primary" data-action="stub" data-msg="Submission tracker — not wired in POC">Add to submission</button>
                  <button class="btn" data-nav="analytics">View analytics</button>
                </div>
              </div>`
              )
              .join("")}
          </div>
          <div class="panel">
            <div class="panel-title">Submission notes</div>
            <div style="font-size:12px;color:var(--muted);line-height:1.8;white-space:pre-line">${esc(c.notes)}</div>
          </div>
        </div>
      </div>`;
  }

  function renderSidebar() {
    const el = $("#sidebar-status-label");
    if (el) {
      el.textContent = `Pipeline active · ${formatShortDate(state.updatedAt)}`;
    }
  }

  function render() {
    renderSidebar();
    renderToday();
    renderSocial();
    renderApprovals();
    renderCatalog();
    renderMinting();
    renderAnalytics();
    renderNewsletter();
    renderCompetitions();
    bindActions();
  }

  function bindActions() {
    $$("[data-action]").forEach((btn) => {
      btn.onclick = async (e) => {
        e.preventDefault();
        const action = btn.dataset.action;
        const id = btn.dataset.id;
        if (action === "stub") {
          toast(btn.dataset.msg || "Not wired in POC");
          return;
        }
        if (action === "preview") {
          toast("Preview opens drop sketch path when generator is wired.");
          return;
        }
        try {
          btn.disabled = true;
          if (action === "approve") {
            await api("approve", { id, edition: getSelect(id, "edition"), platform: getSelect(id, "platform") });
            toast("Approved and minted (simulated).");
          } else if (action === "reject") {
            await api("reject", { id });
            toast("Draft rejected.");
          } else if (action === "save-captions") {
            await api("save_captions", { id, captions: getCaptions(id) });
            toast("Captions saved.");
          } else if (action === "post-both" || action === "post-ig" || action === "post-x") {
            await api("save_captions", { id, captions: getCaptions(id) });
            await api("post_social", { id, mode: action.replace("post-", "") });
            toast("Marked posted (simulated).");
          } else if (action === "skip-social") {
            await api("skip_social", { id });
            toast("Post skipped.");
          }
        } catch (err) {
          toast(err.message || "Action failed");
        } finally {
          btn.disabled = false;
        }
      };
    });

    $$("[data-nav]").forEach((link) => {
      link.onclick = (e) => {
        e.preventDefault();
        const page = link.dataset.nav;
        const item = $(`.sidebar-item[data-page="${page}"]`);
        showPage(page, item);
      };
    });

    $$("select[data-field]").forEach((sel) => {
      sel.onchange = () => {
        const id = sel.dataset.id;
        const field = sel.dataset.field;
        api("update_drop", {
          id,
          [field === "platform" ? "platform" : "edition"]: sel.value,
        }).catch((err) => toast(err.message));
      };
    });
  }

  function getSelect(id, field) {
    const sel = $(`select[data-field="${field}"][data-id="${id}"]`);
    return sel ? sel.value : undefined;
  }

  function getCaptions(id) {
    const ig = $(`textarea[data-caption="instagram"][data-id="${id}"]`);
    const x = $(`textarea[data-caption="x"][data-id="${id}"]`);
    return {
      instagram: ig ? ig.value : "",
      x: x ? x.value : "",
    };
  }

  window.showPage = function (name, el) {
    $$(".page").forEach((p) => p.classList.remove("active"));
    $$(".sidebar-item").forEach((s) => s.classList.remove("active"));
    const page = $(`#page-${name}`);
    if (page) page.classList.add("active");
    if (el) el.classList.add("active");
  };

  async function init() {
    try {
      await loadState();
      render();
    } catch (err) {
      $("#main-pages").innerHTML = `<div class="panel"><p style="color:var(--red)">Could not load dashboard. Run <code>node server.mjs</code> from <code>program/dashboard/</code>.</p><p style="margin-top:8px;font-size:12px;color:var(--muted)">${esc(err.message)}</p></div>`;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
