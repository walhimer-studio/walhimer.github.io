#!/usr/bin/env python3
"""Sample testimony videos and run DeepFace emotion detection per labeled segment."""

import argparse
import json
import os
import sys
from collections import Counter, defaultdict
from pathlib import Path

import cv2
from deepface import DeepFace

ROOT = Path(__file__).resolve().parents[1]
TESTIMONY = ROOT / "sketches/digital-twin/sessions/testimony"
DEFAULT_OUT = ROOT / "sketches/digital-twin/sessions/testimony-emotion-ml.json"

SEGMENTS = [
    {"video": TESTIMONY / "digital-twin-7-302026.mov", "label": "neutral", "start": 11, "end": 55},
    {"video": TESTIMONY / "digital-twin-7-302026.mov", "label": "happy", "start": 55, "end": 96},
    {"video": TESTIMONY / "digital-twin-7-302026.mov", "label": "sad", "start": 96, "end": 144},
    {"video": TESTIMONY / "digital-twin-7-302026.mov", "label": "think", "start": 144, "end": 192},
    {"video": TESTIMONY / "digital-twin-7-302026.mov", "label": "surprise", "start": 192, "end": 234},
    {"video": TESTIMONY / "digital-twin-7-30-2026-2.mov", "label": "grief", "start": 0, "end": 63},
    {"video": TESTIMONY / "digital-twin-7-30-2026-2.mov", "label": "love", "start": 63, "end": 163},
    {"video": TESTIMONY / "digital-twin-7-30-2026-2.mov", "label": "anger", "start": 163, "end": 199},
]


def frame_at(cap, t_sec):
    cap.set(cv2.CAP_PROP_POS_MSEC, t_sec * 1000)
    ok, frame = cap.read()
    return frame if ok else None


def analyze_frame(frame):
    result = DeepFace.analyze(
        frame,
        actions=["emotion"],
        enforce_detection=False,
        silent=True,
    )
    if isinstance(result, list):
        result = result[0]
    return {
        "dominant": result.get("dominant_emotion"),
        "scores": {k: round(float(v), 2) for k, v in result.get("emotion", {}).items()},
    }


def summarize_segment(label, samples):
    if not samples:
        return {"label": label, "samples": 0, "note": "no face detected"}
    dom = Counter(s["dominant"] for s in samples)
    avg = defaultdict(float)
    for s in samples:
        for k, v in s["scores"].items():
            avg[k] += v
    n = len(samples)
    avg = {k: round(v / n, 2) for k, v in avg.items()}
    return {
        "label": label,
        "samples": n,
        "dominant_votes": dict(dom),
        "top_dominant": dom.most_common(1)[0][0],
        "avg_scores": dict(sorted(avg.items(), key=lambda x: -x[1])),
    }


def main():
    parser = argparse.ArgumentParser(description="DeepFace emotion samples on testimony video")
    parser.add_argument("--interval", type=float, default=5, help="Seconds between samples (default: 5)")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help="Output JSON path")
    args = parser.parse_args()

    out = {
        "segments": [],
        "model": "DeepFace emotion (enforce_detection=False)",
        "sample_every_s": args.interval,
    }
    caps = {}

    for seg in SEGMENTS:
        path = str(seg["video"])
        if path not in caps:
            caps[path] = cv2.VideoCapture(path)
        cap = caps[path]
        samples = []
        sample_log = []
        t = seg["start"] + min(1.0, args.interval)
        while t < seg["end"]:
            frame = frame_at(cap, t)
            if frame is not None:
                try:
                    result = analyze_frame(frame)
                    samples.append(result)
                    sample_log.append({"t_sec": round(t, 1), **result})
                except Exception as e:
                    print(f"  skip {seg['label']} @{t}s: {e}", file=sys.stderr)
            t += args.interval
        summary = summarize_segment(seg["label"], samples)
        summary["video"] = os.path.basename(path)
        summary["time_range_s"] = [seg["start"], seg["end"]]
        summary["samples_detail"] = sample_log
        out["segments"].append(summary)
        print(
            f"{seg['label']:10} ML→{summary.get('top_dominant', '?'):10} "
            f"votes={summary.get('dominant_votes', {})} (n={summary.get('samples', 0)})"
        )

    for cap in caps.values():
        cap.release()

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with open(args.out, "w") as f:
        json.dump(out, f, indent=2)
    print(f"\nWrote {args.out} ({args.interval}s interval)")


if __name__ == "__main__":
    main()
