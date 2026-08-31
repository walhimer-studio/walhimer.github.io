"""Machine DNA rules — shared by check_machine_dna.py and guard-artwork-write.py."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC_LOCK = ROOT / "docs" / "SPEC-LOCK.md"

# Forbidden in any sketches/**/*.html (agent-invented lifeline / recorder systems)
DNA_FORBIDDEN_IN_SKETCHES = (
    "lifeEnded",
    "rowEndZ",
    "setupRecording",
    "tickRecording",
    "recWarmup",
    "function lifespanMs",
    # Non-canonical recorders — Chronicle / august-29 only (frame-step)
    "paintRecordChrome",
    "records realtime",
    "realtime A/V",
    "RECORD_SECONDS * 1000",
)

# sketches/one-row-v3_portrait.html — user spec (enforced on commit)
ONE_ROW_V3 = "sketches/one-row-v3_portrait.html"

ONE_ROW_V3_CANVAS_REQUIRED = (
    "const CANVAS_W = 3840",
    "const CANVAS_H = 2160",
    "const PIXEL_DENSITY = 4",
    "const RECORD_FPS = 60",
    "createCanvas(CANVAS_W, CANVAS_H",
    "canvas.parent('stage')",
    "pixelDensity(PIXEL_DENSITY)",
)

ONE_ROW_V3_LIFELINE_REQUIRED = (
    "const LIFESPAN_MS = 480000",
    "function updateLifeline()",
    "if (!lifelineFill) return",
    "((millis() - lifeStart) / LIFESPAN_MS)",
    "lifelineFill.style.width = pct.toFixed(2)",
    "rebirth(artSeed + 1)",
    "lifeStart = millis()",
    "updateLifeline();",
)

ONE_ROW_V3_RECORD_REQUIRED = (
    "const CanvasRecorder = (getCanvas) =>",
    "const rec = CanvasRecorder(",
    "compositeCanvas.width = CANVAS_H",
    "compositeCanvas.height = CANVAS_W",
    "translate(0, CANVAS_W)",
    "rotate(-Math.PI / 2)",
    "captureStream(RECORD_FPS)",
    "videoTrack.requestFrame",
    "recorder.requestData()",
    "return { toggle, isActive: () => active, notifyFrame }",
    "rec.isActive()) rec.notifyFrame()",
    "rec.toggle()",
)

ONE_ROW_V3_STAGE_REQUIRED = (
    "#stage {\n      position: fixed;\n      left: 0;\n      top: 0;\n      width: 100%;\n      height: 100%",
    "object-fit: contain",
)

ONE_ROW_V3_STAGE_FORBIDDEN = (
    "#stage {\n      position: fixed;\n      left: 0;\n      top: 0;\n      width: 3840px",
    "width: 3840px !important",
    "height: 2160px !important",
)

ONE_ROW_V3_ART_REQUIRED = (
    "const REF_ROWS = 30",
    "let rows = 10",
    "const zMin = -REF_ROWS / 2",
    "const zMax = REF_ROWS / 2 - 1",
)

ONE_ROW_V3_ART_FORBIDDEN = (
    "function rowZIndexRange",
    "minIndex, maxIndex } = rowZIndexRange",
)

ONE_ROW_V3_ORIENTATION_REQUIRED = (
    "bottom of landscape on left",
    ': rotParam === "90" ? "90" : "90"',
    "function chooseRot() {\n      return rot;",
)

ONE_ROW_V3_ORIENTATION_FORBIDDEN = (
    ': "auto"',
    "w >= 3840",
    "h >= 2160",
    "physW() >= physH()",
    "below UHD",
    "auto (UHD",
    "?rotate=0 laptop",
    "Mac preview",
)

ONE_ROW_V3_FORBIDDEN = (
    # Viewport / resize canvas
    "createCanvas(windowWidth",
    "createCanvas(windowHeight",
    "resizeCanvas(windowWidth",
    "resizeCanvas(windowHeight",
    "function windowResized",
    "windowWidth",
    "windowHeight",
    # Display scale systems (SPEC-LOCK)
    "layoutArtStage",
    "art-stage",
    "#art-stage",
    "scale(${scale}",
    "Math.min(bw / CANVAS_W",
    "resolveCanvasSize",
    "?display=",
    "DESIGN_W",
    "0.25)",
    *ONE_ROW_V3_STAGE_FORBIDDEN,
    *ONE_ROW_V3_ART_FORBIDDEN,
    # Portrait shell — no auto / viewport rotation heuristics
    *ONE_ROW_V3_ORIENTATION_FORBIDDEN,
    # Record / lifeline inventions
    "compositeCanvas.width = CANVAS_W",
    "compositeCanvas.height = CANVAS_H",
    "compositeCtx.fillRect(0, 0, CANVAS_W, CANVAS_H)",
    "translate(CANVAS_H, 0)",
    "rotate(Math.PI / 2)",
    "compositeCanvas.width = window.innerWidth",
    "compositeCanvas.height = window.innerHeight",
    "CanvasRecorder = (getCanvas, getAudioStream",
    "captureStream(30)",
    "const REC_FPS = 30",
    "camZ - lifeStart",
    "millis() - rowEndZ",
)

SPEC_LOCK_REQUIRED_HEADINGS = (
    "# SPEC-LOCK",
    "## One Row V3 portrait",
    "3840 × 2160",
    "2160 × 3840",
    "bottom of landscape on left",
    "rotate=90",
    "SPEC-LOCK",
)


def spec_lock_errors() -> list[str]:
    errors: list[str] = []
    if not SPEC_LOCK.is_file():
        return ["missing docs/SPEC-LOCK.md"]
    text = SPEC_LOCK.read_text(encoding="utf-8")
    for heading in SPEC_LOCK_REQUIRED_HEADINGS:
        if heading not in text:
            errors.append(f"docs/SPEC-LOCK.md missing: {heading!r}")
    return errors


def sketch_forbidden_errors(rel: str, text: str) -> list[str]:
    """Repo-wide: block agent-invented lifeline/recorder tokens only."""
    if not rel.startswith("sketches/") or not rel.endswith(".html"):
        return []
    errors: list[str] = []
    for token in DNA_FORBIDDEN_IN_SKETCHES:
        if token in text:
            errors.append(f"{rel}: forbidden `{token}`")
    return errors


def one_row_v3_errors(text: str) -> list[str]:
    errors: list[str] = []
    for snippet in ONE_ROW_V3_CANVAS_REQUIRED:
        if snippet not in text:
            errors.append(f"missing canvas spec: {snippet!r}")
    for snippet in ONE_ROW_V3_LIFELINE_REQUIRED:
        if snippet not in text:
            errors.append(f"missing lifeline DNA: {snippet!r}")
    for snippet in ONE_ROW_V3_RECORD_REQUIRED:
        if snippet not in text:
            errors.append(f"missing record DNA: {snippet!r}")
    for snippet in ONE_ROW_V3_STAGE_REQUIRED:
        if snippet not in text:
            errors.append(f"missing stage display: {snippet!r}")
    for snippet in ONE_ROW_V3_ART_REQUIRED:
        if snippet not in text:
            errors.append(f"missing art placement: {snippet!r}")
    for snippet in ONE_ROW_V3_ORIENTATION_REQUIRED:
        if snippet not in text:
            errors.append(f"missing orientation spec: {snippet!r}")
    for snippet in ONE_ROW_V3_FORBIDDEN:
        if snippet in text:
            errors.append(f"forbidden: {snippet!r}")
    return errors


def one_row_v3_blob_errors(blob: str) -> str | None:
    """Hook: reject diff introducing v3 violations."""
    for snippet in ONE_ROW_V3_FORBIDDEN:
        if snippet in blob:
            return snippet
    return None
