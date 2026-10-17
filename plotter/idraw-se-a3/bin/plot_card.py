#!/usr/bin/env python3
"""Plot Marfa 2026 card from window.PLOT JSON on iDraw SE A3 (EBB)."""

from __future__ import annotations

import json
import os
import select
import sys
import termios
import time

PORT = "/dev/ttyACM0"
PLOT_PATH = "/home/markwalhimer/plotter/plots/current.json"
FIELD_W, FIELD_H = 256.0, 384.0
CARD_W, CARD_H = 4 * 2032, 6 * 2032  # 8128, 12192
# Home (0,0) stays at the card top-left. Shift strokes 1/16" left (−X).
X_SHIFT_STEPS = -(2032 // 16)  # -127
DOWN = 2500
UP = 25000
PEN_RP = 4
JOIN_STEPS = 4
SETTLE_LETTER_S = 0.85
SETTLE_ART_S = 0.28
SETTLE_REVISIT_S = 0.08
REVISIT_STEPS = 40
SKIP_STROKES = 0  # ~0.02" — same spot / same frame corner


def open_port():
    fd = os.open(PORT, os.O_RDWR | os.O_NOCTTY)
    attr = termios.tcgetattr(fd)
    attr[0] = 0
    attr[1] = 0
    attr[2] = termios.CS8 | termios.CREAD | termios.CLOCAL
    attr[3] = 0
    attr[4] = termios.B9600
    attr[5] = termios.B9600
    attr[6][termios.VMIN] = 0
    attr[6][termios.VTIME] = 0
    termios.tcsetattr(fd, termios.TCSANOW, attr)
    termios.tcflush(fd, termios.TCIOFLUSH)
    return fd


def read_for(fd, seconds):
    chunks = []
    deadline = time.time() + seconds
    while time.time() < deadline:
        ready, _, _ = select.select([fd], [], [], 0.05)
        if not ready:
            if chunks:
                extra, _, _ = select.select([fd], [], [], 0.08)
                if extra:
                    data = os.read(fd, 512)
                    if data:
                        chunks.append(data)
                break
            continue
        data = os.read(fd, 512)
        if not data:
            break
        chunks.append(data)
    return b"".join(chunks).decode("ascii", "replace")


def send(fd, cmd, wait=0.3):
    os.write(fd, (cmd + "\r").encode())
    reply = read_for(fd, wait)
    if "Err:" in reply:
        raise RuntimeError(cmd + " " + reply)
    return reply


def motor_xy(reply):
    text = reply.replace("OK", "").replace("\r", " ").replace("\n", " ")
    parts = []
    for token in text.replace(",", " ").split():
        if token.lstrip("-").isdigit():
            parts.append(int(token))
    if len(parts) < 2:
        raise RuntimeError("could not read QS: " + reply)
    m1, m2 = parts[0], parts[1]
    return (m1 + m2) // 2, (m1 - m2) // 2


def wait_idle(fd, seconds):
    deadline = time.time() + seconds
    while time.time() < deadline:
        reply = send(fd, "QM", 0.15)
        if "QM,0" in reply.replace("\r", "").replace("\n", ""):
            return True
        time.sleep(0.15)
    return False


def move(fd, x, y, tx, ty, draw=False):
    dx, dy = tx - x, ty - y
    if dx == 0 and dy == 0:
        return 0
    fastest = max(abs(dx + dy), abs(dx - dy))
    if draw:
        duration = max(900, int(fastest * 1.25) + 80)
    else:
        duration = max(700, fastest + 40)
    send(fd, "XM,%d,%d,%d" % (duration, dx, dy), 0.25)
    return duration


def pen_up(fd):
    send(fd, "SR,0,1", 0.2)
    send(fd, "SC,4,%d" % UP, 0.2)
    send(fd, "S2,0,%d" % PEN_RP, 0.2)
    time.sleep(0.12)
    send(fd, "S2,%d,%d,200,600" % (UP, PEN_RP), 0.35)
    send(fd, "SP,1,400", 0.4)
    time.sleep(0.45)


def pen_down(fd, settle):
    send(fd, "SR,0,1", 0.2)
    send(fd, "SC,5,%d" % DOWN, 0.2)
    send(fd, "S2,0,%d" % PEN_RP, 0.2)
    time.sleep(0.12)
    send(fd, "S2,%d,%d,200,700" % (UP, PEN_RP), 0.35)
    wait_idle(fd, 2.0)
    send(fd, "S2,%d,%d,200,700" % (DOWN, PEN_RP), 0.35)
    wait_idle(fd, 2.0)
    send(fd, "SP,0,400", 0.45)
    time.sleep(settle)


def to_steps(fx, fy):
    x = int(round(fx / FIELD_W * CARD_W)) + X_SHIFT_STEPS
    y = int(round(fy / FIELD_H * CARD_H))
    return x, y


def section(path):
    ys = [pt[1] for pt in path["pts"]]
    y1 = max(ys)
    if path.get("kind") != "letter":
        return "top"
    if y1 < 270:
        return "title"
    if y1 < 290:
        return "number"
    return "bottom"


def clean(path):
    pts = []
    for fx, fy in path["pts"]:
        p = to_steps(float(fx), float(fy))
        if pts and pts[-1] == p:
            continue
        pts.append(p)
    if path.get("closed") and len(pts) > 2 and pts[0] != pts[-1]:
        pts.append(pts[0])
    return pts


def main():
    plot = json.load(open(PLOT_PATH))
    groups = {"top": [], "title": [], "number": [], "bottom": []}
    for path in plot["paths"]:
        pts = clean(path)
        if len(pts) < 2:
            continue
        groups[section(path)].append(pts)

    order = ("top", "title", "number", "bottom")
    counts = {k: len(groups[k]) for k in order}
    print(
        "PLOT seed=%s card=%s top=%d title=%d number=%d bottom=%d"
        % (
            plot["seed"],
            plot["card"],
            counts["top"],
            counts["title"],
            counts["number"],
            counts["bottom"],
        )
    )

    fd = open_port()
    pen_is_down = False
    x = y = 0
    last_down = None
    try:
        send(fd, "SR,0,1", 0.2)
        pen_up(fd)
        x, y = motor_xy(send(fd, "QS", 0.35))
        print(
            "START %d %d x_shift=%d art_settle=%.2f revisit=%.2f"
            % (x, y, X_SHIFT_STEPS, SETTLE_ART_S, SETTLE_REVISIT_S)
        )

        drawn = 0
        print("SKIP_STROKES=%d" % SKIP_STROKES, flush=True)
        for key in order:
            print("SECTION %s n=%d" % (key, len(groups[key])))
            for pts in groups[key]:
                if drawn < SKIP_STROKES:
                    drawn += 1
                    if drawn % 10 == 0 or drawn == SKIP_STROKES:
                        print("SKIP %d" % drawn, flush=True)
                    continue
                x0, y0 = pts[0]
                at_start = (
                    pen_is_down
                    and abs(x - x0) <= JOIN_STEPS
                    and abs(y - y0) <= JOIN_STEPS
                )
                if not at_start:
                    if pen_is_down:
                        wait_idle(fd, 8.0)
                        pen_up(fd)
                        pen_is_down = False
                    dur = move(fd, x, y, x0, y0, draw=False)
                    wait_idle(fd, max(2.0, dur / 1000.0 + 1.5))
                    x, y = x0, y0
                    if key == "top":
                        settle = SETTLE_ART_S
                        if last_down is not None:
                            lx, ly = last_down
                            if abs(x0 - lx) <= REVISIT_STEPS and abs(y0 - ly) <= REVISIT_STEPS:
                                settle = SETTLE_REVISIT_S
                    else:
                        settle = SETTLE_LETTER_S
                    pen_down(fd, settle)
                    last_down = (x0, y0)
                    pen_is_down = True
                total = 0
                for tx, ty in pts[1:]:
                    total += move(fd, x, y, tx, ty, draw=True)
                    x, y = tx, ty
                wait_idle(fd, max(2.0, total / 1000.0 + 1.5))
                drawn += 1
                if drawn % 10 == 0:
                    print("PROGRESS %d x=%d y=%d" % (drawn, x, y), flush=True)

        if pen_is_down:
            pen_up(fd)
            pen_is_down = False
        dur = move(fd, x, y, 0, 0, draw=False)
        wait_idle(fd, max(3.0, dur / 1000.0 + 2.0))
        x2, y2 = motor_xy(send(fd, "QS", 0.35))
        send(fd, "QP", 0.25)
        print("DONE drawn=%d end=%d %d" % (drawn, x2, y2))
    except Exception as exc:
        print("STOP " + str(exc))
        try:
            os.write(fd, b"ES\r")
            time.sleep(0.2)
            os.write(fd, ("S2,%d,%d\r" % (UP, PEN_RP)).encode())
            time.sleep(0.3)
            print("ABORT " + repr(read_for(fd, 0.4)))
        except OSError:
            pass
        sys.exit(1)
    finally:
        os.close(fd)


if __name__ == "__main__":
    main()
