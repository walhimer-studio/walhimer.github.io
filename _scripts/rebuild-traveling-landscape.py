#!/usr/bin/env python3
"""Rebuild installations/traveling-landscape.html from the current template + iframe artwork."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "installations" / "traveling-landscape.html"
OUT_INSTALL = ROOT / "installations" / "traveling-landscape.html"
OUT_PROJECT = ROOT / "traveling-landscape" / "index.html"

# Inner markup only (inside #landscape-stage). Prefix must end after instruction-bar </div>.
NEW_STAGE_INNER = r'''
  <div id="controls">
    <div class="ctrl ctrl-piece-hint">
      <div class="ctrl-label">Interactive</div>
      <p class="ctrl-desc">Click inside the frame to unlock sound. Pentatonic piano and emergent DNA rhythm — use seed and record in the piece’s bar.</p>
    </div>

    <button id="fs-btn" title="Fullscreen" aria-label="Enter fullscreen">
      <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none" stroke-width="1.5">
        <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
        <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
      </svg>
      Fullscreen
    </button>

    <button id="journey-btn">New Journey</button>
  </div>

  <iframe id="tl-artwork" src="/installations/traveling-landscape-artwork.html" title="Traveling Landscape — interactive artwork" allow="fullscreen"></iframe>

  <button id="fs-close" aria-label="Exit fullscreen">
    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="1.5">
      <polyline points="4 14 4 20 10 20"/><polyline points="20 10 20 4 14 4"/>
      <line x1="20" y1="4" x2="13" y2="11"/><line x1="4" y1="20" x2="11" y2="13"/>
    </svg>
    Collapse
  </button>

  <button id="fs-refresh" aria-label="Reload artwork">
    <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" fill="none" stroke-width="1.5">
      <polyline points="23 4 23 10 17 10"/>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
    </svg>
    New Journey
  </button>

</div>
'''

LANDSCAPE_OPEN = """<!-- ── LANDSCAPE STAGE ──────────────────────────────────────────────── -->
<div id="landscape-stage">
"""

SCRIPT = r'''<script>
"use strict";

var stage = document.getElementById("landscape-stage");
var fsBtn = document.getElementById("fs-btn");
var fsClose = document.getElementById("fs-close");
var fsRefresh = document.getElementById("fs-refresh");
var journeyBtn = document.getElementById("journey-btn");
var artworkFrame = document.getElementById("tl-artwork");

function reloadArtwork() {
  var base = artworkFrame.src.split("#")[0];
  artworkFrame.src = base + (base.indexOf("?") >= 0 ? "&" : "?") + "t=" + Date.now();
}

function enterFullscreen() {
  stage.classList.add("is-fullscreen");
  document.body.style.overflow = "hidden";
  setTimeout(function () {
    window.dispatchEvent(new Event("resize"));
    try { artworkFrame.contentWindow.dispatchEvent(new Event("resize")); } catch (e) {}
  }, 30);
  if (stage.requestFullscreen) stage.requestFullscreen().catch(function () {});
}

function exitFullscreen() {
  stage.classList.remove("is-fullscreen");
  document.body.style.overflow = "";
  setTimeout(function () {
    window.dispatchEvent(new Event("resize"));
    try { artworkFrame.contentWindow.dispatchEvent(new Event("resize")); } catch (e) {}
  }, 30);
  if (document.fullscreenElement) document.exitFullscreen().catch(function () {});
}

fsBtn.addEventListener("click", enterFullscreen);
fsClose.addEventListener("click", exitFullscreen);
fsRefresh.addEventListener("click", reloadArtwork);
journeyBtn.addEventListener("click", reloadArtwork);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && stage.classList.contains("is-fullscreen")) exitFullscreen();
});

document.addEventListener("fullscreenchange", function () {
  if (!document.fullscreenElement && stage.classList.contains("is-fullscreen")) exitFullscreen();
});
</script>
'''

EXTRA_CSS = r'''
    #landscape-stage iframe#tl-artwork {
      display: block;
      width: 100%;
      max-width: 1000px;
      height: min(562px, 56.25vw);
      min-height: 400px;
      margin: 0 auto;
      border: 0;
      background: #fff;
    }
    #landscape-stage.is-fullscreen iframe#tl-artwork {
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
      min-height: 0 !important;
    }
    #controls {
      grid-template-columns: 1fr auto auto;
    }
    .ctrl-piece-hint .ctrl-desc {
      margin-top: 6px;
      line-height: 1.5;
      max-width: 52em;
    }
'''

def patch_head(head: str) -> str:
    head = head.replace("  </style>", EXTRA_CSS + "\n  </style>", 1)
    head = head.replace(
        """    #landscape-stage.is-fullscreen canvas {
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
    }""",
        """    #landscape-stage.is-fullscreen iframe#tl-artwork {
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
    }""",
    )
    head = head.replace(
        """    body.embed-mode #landscape-stage canvas {
      width: 100% !important; height: 100% !important; max-width: none !important;
    }""",
        """    body.embed-mode #landscape-stage iframe#tl-artwork {
      width: 100% !important; height: 100% !important; max-width: none !important;
    }""",
    )
    return head


def main():
    text = SRC.read_text(encoding="utf-8", errors="replace")
    lines = text.splitlines(keepends=True)

    head = "".join(lines[0:485])
    head = patch_head(head)

    # <body> … through instruction-bar </div> and blank line (lines 518–541 in rebuilt file).
    body_prefix = "".join(lines[517:541])
    body_suffix = "".join(lines[581:666])

    new_stage = LANDSCAPE_OPEN + NEW_STAGE_INNER + "\n</div>\n"

    out = (
        head
        + "\n</head>\n"
        + body_prefix
        + new_stage
        + body_suffix
        + "\n"
        + SCRIPT
        + "\n</body>\n</html>\n"
    )

    OUT_INSTALL.write_text(out, encoding="utf-8")
    print("Wrote", OUT_INSTALL, "bytes", len(out))

    # Project site /traveling-landscape/ — relative URL to artwork
    out_project = out.replace(
        'src="/installations/traveling-landscape-artwork.html"',
        'src="../installations/traveling-landscape-artwork.html"',
    )
    OUT_PROJECT.parent.mkdir(parents=True, exist_ok=True)
    OUT_PROJECT.write_text(out_project, encoding="utf-8")
    print("Wrote", OUT_PROJECT)


if __name__ == "__main__":
    main()
