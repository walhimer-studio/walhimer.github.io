# Computer Edition

A generative artwork that runs **live, in real time** on its own small computer and monitor. The artwork is self-contained and runs entirely on the machine. The internet is optional.

**Status:** planning (started 2026-11-11). Nothing here is built yet.

Related docs:
- `docs/wall-screen-edition/` — existing wall-screen work (offline appliance, buying guide, installer one-pager)
- `docs/computer-edition/artist-agreement-draft.md` — draft agreement (not reviewed by a lawyer)

---

## 1. The idea in one page

1. Sketch in Three.js / WebGL and test.
2. Publish a page on the website where people can buy the work.
3. Keep entering competitions and calls for entry.
4. Start selling **plotter drawings**, each with its **associated digital file**, sold together.
5. Offer a **ready-made computer and screen** running the work live.
6. Eventually sell **full installations (rooms)**.

Set up **one golden computer**, copy it for future units, and run several works on each machine in the studio until a unit is sold.

### Where things stand today

The works currently play on a Fire Stick running **AbleSign** (digital signage). The playlist (screenshot, 2026-11-11) plays recordings and still images:

8 items, 359 seconds in total.

| # | File | Type | Seconds |
|---|---|---|---|
| 1 | `invisible-layer.mp4` (AbleSign shows "Warn") | Video, landscape | 60 |
| 2 | `curved-marks-2-landscape-3840×2160-colors-5-percent-60-depth-seed-3019475570.png` | Image, landscape | 20 |
| 3 | `3-areas-not-a-pattern copy.jpg` | Image, portrait | 20 |
| 4 | `curved-marks-2-landscape-3840×2160-colors-5-percent-60-depth-seed-3019475570.png` (same file again) | Image, landscape | 10 |
| 5 | `seeded-flower-v5-landscape-seed663750501-60fps-60s.mp4` | Video, landscape | 60 |
| 6 | `invisible-layer-marfa-2026-screen-landscape-seed1-60fps-60s.mp4` | Video, landscape | 60 |
| 7 | `chutes-study-2026-08-25T03-30-58.mp4` | Video, landscape | 99 |
| 8 | `Untitled.mp4` (AbleSign shows "Warn") | Video, landscape | 30 |

**The computer replaces this.** The artwork runs live from the computer. No MP4s. The playlist is the old way of showing the work.

Not yet known: what the "Warn" labels mean in AbleSign, and what AbleSign does for you that the computer needs to replace (scheduling, remote control, etc.).

## 2. Principles

1. **Live, real time.** The artwork is generated on the machine, not played back from a recording.
2. **One mind.** The artwork runs on the machine and never depends on a network.
3. **Offline first.** Ship with networking off. The internet is an optional extra the owner can choose.
4. **Monitoring is separate from the art.** Any status reporting is a small program beside the piece. The piece never knows it exists.
5. **Freeze the software.** A fixed browser version, no auto-updates, so the piece looks the same years later.
6. **No changes to a sold work over the network.**
7. **Do not edit the artwork files to make any of this work.** The computer loads each piece as it is. Three.js needs a browser engine to run. No rewrite into native code unless explicitly requested.

## 3. The unit

- Small computer (AMD mini PC), **Linux Mint (Cinnamon edition)**, Google Chrome (the `.deb`, version pinned).
- Boots straight to the piece, full screen (kiosk mode), no desktop visible.
- BIOS set to power on automatically after an outage.
- Sleep, screen timeout, and updates turned off.
- Pieces stored locally (they are already self-contained HTML, no CDN).
- One identical image copied to every unit. Only the piece and the unit ID differ.
- **Golden image rule:** a unit can hold several works while it is in the studio. Before it is sold, re-image it from the golden image so it holds only the sold work.

### Why Linux Mint (not Ubuntu)

- Same base as current Ubuntu LTS, so hardware support is essentially the same.
- No snap packages by default, which makes it easier to freeze the browser version.
- Clear controls for turning off automatic updates.
- Ubuntu is the better pick only if the most online guides matter more. It has no advantage for a kiosk.

### Open questions

- Which monitor, and do we ship it?
- Does any piece depend on the date or clock? (The unit has no internet time source.)
- Can the hardware hold the target frame rate at the monitor's resolution? (See Section 4.)

## 4. Our computers

**How many to start:** two. Computer 1 is the golden unit. Computer 2 tests the clone: copy the saved image onto it and confirm it behaves exactly like the first. The Mac stays the workstation. Build more when something sells (keep one spare), not before.

| Name | Model | Role | Network | Notes |
|---|---|---|---|---|
| Computer 1 | Etorli GT103 Mini PC, Ryzen 5 7430U, 16 GB RAM, 512 GB SSD, dual LAN | Golden unit | Currently Windows, connected to the Mac by USB-C Ethernet | Specs as stated by Mark. Confirm with `dxdiag`. |
| Computer 2 | To confirm (same model?) | Clone test | | |

### Hardware notes (general knowledge, not tested on this machine)

- Ryzen 5 7430U is a 6-core, 12-thread laptop-class chip (Zen 3) with older Radeon Vega integrated graphics.
- 16 GB RAM and a 512 GB SSD are plenty.
- It should run lighter Three.js scenes at 1080p smoothly. **4K at 60 fps with heavy shaders or lots of geometry may struggle.** Not tested.
- If it can't hold the frame rate: run at lower resolution, simplify the piece for this hardware (artist's decision), or use more powerful hardware for sold units.
- Check that the HDMI/DisplayPort output does 4K at 60 Hz (some mini PCs only do 4K at 30 Hz on one port), and that the monitor and cable do too.
- Check the BIOS has "Restore on AC power loss" (or similar). Smaller brands sometimes leave it out.
- Watch the temperature during a multi-hour test.

Still needed: `dxdiag` results (Processor, Memory, Display Name, Display Memory) and which piece is the heaviest, to test first.

## 5. Optional remote information

If a unit is connected to the internet, it can report:
- Uptime
- Temperature
- Which piece is running
- A screenshot of what is on screen

How: a private network (Tailscale) plus a small status script. Not built yet. If a unit is offline, it reports nothing, and that is fine. Remote checking is not possible until a unit is configured and connected. A fresh Windows machine answers nothing from another computer.

## 6. Swap every 2–3 years

1. Build a new unit from the golden image.
2. Ship it with a prepaid return label.
3. The owner swaps it in and sends the old unit back.
4. We wipe and destroy the old unit and keep a record (unit ID, date, method).

Open questions: who pays for hardware and shipping, and how long the owner has to send the old unit back.

## 7. Sales and the referral fee

- A smart contract can split the sale (for example 95% to the artist, 5% to the person who helped), pay resale royalties, and record ownership.
- The physical swap, return, and destruction cannot be enforced on-chain. They live in the written agreement.
- Plan: smart contract for the sale, split, royalties, and ownership. Written agreement for the physical rules, with its hash recorded in the contract.
- An offline unit cannot check who holds the token.
- Open question: which chain and marketplace.
- Get a lawyer to review the agreement and the referral arrangement before selling.

## 8. Next steps

Updated 2026-11-11. The artwork runs live, in real time. No MP4s.

**Tomorrow**
- [ ] Buy two USB drives, 32 GB or larger (one for the installer, one for the saved image)
- [ ] Download Linux Mint (Cinnamon edition)
- [ ] Make the Linux installer on the Mac
- [ ] On the Windows machine, run `dxdiag` and record the Processor, Memory, and Display Name (graphics chip). Write it in Section 4.

**Build the golden unit**
- [ ] Back up anything needed from the Windows machine, then wipe it and install Linux Mint
- [ ] Install Google Chrome from the `.deb` file and pin the version (no auto-updates)
- [ ] Copy one live piece onto the machine and make it start on boot, full screen (kiosk mode)
- [ ] Test the heaviest piece first, then the lightest: does it hold the target frame rate at the monitor's resolution?
- [ ] Run it for several hours and watch the temperature
- [ ] In the BIOS, set power-on after an outage. Turn off sleep, screen timeout, and updates.
- [ ] Unplug and replug the power twice to confirm it recovers by itself
- [ ] Save the golden image to the second USB drive

**Decisions**
- [ ] Choose the monitor model
- [ ] Decide the swap rules: years between swaps, who pays, time allowed to return the old unit
- [ ] Choose a chain and marketplace for the sale and the 5% split
- [ ] Set edition sizes and prices for the first works

**After the first unit works**
- [ ] Build a second unit from the image and confirm it matches the first
- [ ] Fill in the remaining blanks in this README
- [ ] Lawyer review of the agreement and the referral arrangement
- [ ] Sell one to three units before building more

## 9. Business checklist

Added 2026-11-11. General checklist, not legal or tax advice.

- [ ] **Edition rules.** Edition size and numbering for each work. What "the artwork" is (code, file, or unit). Whether the plotter drawing, digital file, and screen sell as one bundle or separately. One price list, the same across channels.
- [ ] **Certificates.** One per sale: title, edition number, seed, unit ID, file checksum. The plotter drawing and its digital file name the same seed.
- [ ] **Gallery and dealer terms.** Commission and consignment terms in writing.
- [ ] **Business basics.** Sales tax or VAT, shipping insurance, customs for international shipments, returns and warranty policy, liability insurance.
- [ ] **Spare stock.** A few built units and spare monitors.
- [ ] **Display consistency.** Same monitor model, locked brightness and color settings, specified in the agreement.
- [ ] **Backups.** Source, golden image, and edition records in three places, one off-site.
- [ ] **Documentation for each piece.** Photos or video of it running, an install sheet, a one-page statement.
- [ ] **Plotter drawing details.** Archival paper and ink, signature and edition number, record of plot settings.
- [ ] **Rooms and full installations.** Separate contract: deposit and milestone payments, site requirements (power, ventilation, wall size), who installs, who services it afterward.
- [ ] **Pace.** Sell one to three units before building many.

## 10. Network notes (2026-11-11)

- The Windows machine is connected through a USB-C Ethernet adapter on the Mac (`en12`, set to `192.168.50.1`).
- It appears on the cable at `169.254.133.7` (MAC `84:47:09:8d:2f:fe`), so it is powered and connected.
- It answers no pings and has no open ports (file sharing, Remote Desktop, remote management, SSH, web), which is normal for a fresh Windows machine with the default firewall.
- The addresses are on different networks, so the two machines can't talk until Windows is given a matching address (or both go through the router).
- Internet Sharing was unavailable on the Mac.
- Specs can't be read remotely yet. Run `dxdiag` on the Windows machine.
