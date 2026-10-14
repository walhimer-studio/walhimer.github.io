# iDraw SE A3

EiBotBoard on the DrawCore board. Commands go straight to the controller over USB. Not G-code. Not Inkscape.

Port: `/dev/cu.usbmodem101`  
9600 baud, each command ends with `\r`  
Firmware read from the board: EBB 3.0.2

## Home

Top-left corner of the 4 × 6 portrait card, from the seat in front of the machine.

`EM,1,1` locks the motors and zeros the step counter. That spot is 0, 0.  
`EM,0,0` releases the motors and also clears the counter, so home is lost.

| Axis | Direction |
|---|---|
| +X | Right, along the short edge of the card |
| +Y | Down the page, toward the bottom of the card |

## 4 × 6 card (portrait)

80 steps per millimeter. 2032 steps per inch.

| Edge | Inches | Steps |
|---|---:|---:|
| Width (+X) | 4 | 8128 |
| Height (+Y) | 6 | 12192 |

### Card corners (validated)

| Corner | Steps (X, Y) |
|---|---|
| Top-left (home) | 0, 0 |
| Top-right | 8128, 0 |
| Bottom-right | 8128, 12192 |
| Bottom-left | 0, 12192 |

Home stays at the physical top-left of the card. Marfa card strokes map field→steps, then shift **1/16 inch left** (−127 steps in X) so the drawing is not slightly right-justified. Y is unchanged.

Move with `XM,milliseconds,x_steps,y_steps`. That command is in card X and Y. The board mixes the two motors for CoreXY.

### Example insets

| Inset from every edge | Top-left of inset | Size |
|---|---|---|
| 1/2 inch | 1016, 1016 | 3 × 5 inches |
| 3/4 inch | 1524, 1524 | 2.5 × 4.5 inches |
| 1 inch | 2032, 2032 | 2 × 4 inches |

## Pen

The pen servo is RB1. In an `S2` command that pin is `4`, not `1`.

The arm only swings about 1 or 2 degrees. Contact with the paper is the carriage settling onto the nib, not a long servo stroke.

| | Pulse |
|---|---:|
| On the paper | 2500 |
| Up | 25000 |

Servo power turns itself off. `SR,0,1` holds it on. Keep power held whenever you raise or lower.

### Reliable up / down (required)

A plain `SP,0` / `SP,1` is not enough. The channel can stick in the up state. Always reset the channel first:

**Up**

1. `SR,0,1`
2. `SC,4,25000`
3. `S2,0,4` (channel off)
4. `S2,25000,4,200,600`
5. `SP,1,400`

**Down**

1. `SR,0,1`
2. `SC,5,2500`
3. `S2,0,4` (channel off)
4. `S2,25000,4,200,700` (nudge high)
5. Wait until idle
6. `S2,2500,4,200,700` (down)
7. Wait until idle
8. `SP,0,400`
9. Wait about a second for the carriage to settle before any inked move

### Habits

1. Travel with the pen up.
2. Drop the pen with the sequence above, then wait for settle.
3. Draw.
4. Lift the pen at the end of every drawing. Do not leave the nib on the paper or it will blot.
