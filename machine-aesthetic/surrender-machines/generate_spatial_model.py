#!/usr/bin/env python3
"""
Generate Surrender Machines visitor-path spatial model (GLTF 2.0).
Machine Aesthetic — Mark Walhimer / Loop Art Critique cohort 21.
"""

import json
import math
import struct
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent
GLTF_PATH = OUT_DIR / "surrender-machines-spatial.gltf"
BIN_PATH = OUT_DIR / "surrender-machines-spatial.bin"

# Palette — matches site (--accent / machine aesthetic)
COL_BLACK = (0.04, 0.04, 0.04, 1.0)
COL_WALL = (0.07, 0.07, 0.07, 1.0)
COL_FLOOR = (0.05, 0.05, 0.05, 1.0)
COL_ACCENT = (0.784, 0.659, 0.510, 1.0)  # #c8a882
COL_MACHINE = (0.12, 0.11, 0.10, 1.0)
COL_GLOW = (0.659, 0.525, 0.306, 0.85)  # warm brass
COL_DOORWAY = (0.784, 0.659, 0.510, 1.0)
COL_PATH = (0.15, 0.13, 0.11, 1.0)

vertices = []
indices = []
materials = []
meshes = []
nodes = []
accessors = []
buffer_views = []
node_children = {}

byte_offset = 0
bin_chunks = []


def align4(n):
    return (n + 3) & ~3


def add_material(name, rgba, metallic=0.0, roughness=0.85):
    idx = len(materials)
    materials.append(
        {
            "name": name,
            "pbrMetallicRoughness": {
                "baseColorFactor": list(rgba),
                "metallicFactor": metallic,
                "roughnessFactor": roughness,
            },
        }
    )
    return idx


def add_box(cx, cy, cz, sx, sy, sz, mat_idx, name=None):
    """Axis-aligned box centered at (cx,cy,cz) with full sizes sx,sy,sz."""
    hx, hy, hz = sx / 2, sy / 2, sz / 2
    # 8 corners
    corners = [
        (-hx, -hy, -hz),
        (hx, -hy, -hz),
        (hx, hy, -hz),
        (-hx, hy, -hz),
        (-hx, -hy, hz),
        (hx, -hy, hz),
        (hx, hy, hz),
        (-hx, hy, hz),
    ]
    face_indices = [
        (0, 1, 2, 3),  # -Z
        (4, 7, 6, 5),  # +Z
        (0, 4, 5, 1),  # -Y floor
        (2, 6, 7, 3),  # +Y ceiling
        (0, 3, 7, 4),  # -X
        (1, 5, 6, 2),  # +X
    ]
    base = len(vertices)
    for x, y, z in corners:
        vertices.append([cx + x, cy + y, cz + z])
    for quad in face_indices:
        a, b, c, d = [base + i for i in quad]
        indices.extend([a, b, c, a, c, d])

    mesh_idx = flush_mesh(mat_idx, name or "box")


def flush_mesh(mat_idx, name):
    global byte_offset
    if not vertices:
        return None

    pos_flat = []
    for v in vertices:
        pos_flat.extend(v)
    pos_bytes = struct.pack(f"<{len(pos_flat)}f", *pos_flat)
    idx_bytes = struct.pack(f"<{len(indices)}H", *indices)

    pos_pad = align4(len(pos_bytes))
    pos_bytes_padded = pos_bytes + b"\x00" * (pos_pad - len(pos_bytes))
    idx_pad = align4(len(idx_bytes))
    idx_bytes_padded = idx_bytes + b"\x00" * (idx_pad - len(idx_bytes))

    pos_view_idx = len(buffer_views)
    buffer_views.append(
        {
            "buffer": 0,
            "byteOffset": byte_offset,
            "byteLength": len(pos_bytes),
            "target": 34962,
        }
    )
    byte_offset += pos_pad

    idx_view_idx = len(buffer_views)
    buffer_views.append(
        {
            "buffer": 0,
            "byteOffset": byte_offset,
            "byteLength": len(idx_bytes),
            "target": 34963,
        }
    )
    byte_offset += idx_pad

    bin_chunks.append(pos_bytes_padded)
    bin_chunks.append(idx_bytes_padded)

    # bounds
    xs = [v[0] for v in vertices]
    ys = [v[1] for v in vertices]
    zs = [v[2] for v in vertices]
    min_b = [min(xs), min(ys), min(zs)]
    max_b = [max(xs), max(ys), max(zs)]

    pos_acc = len(accessors)
    accessors.append(
        {
            "bufferView": pos_view_idx,
            "componentType": 5126,
            "count": len(vertices),
            "type": "VEC3",
            "min": min_b,
            "max": max_b,
        }
    )
    idx_acc = len(accessors)
    accessors.append(
        {
            "bufferView": idx_view_idx,
            "componentType": 5123,
            "count": len(indices),
            "type": "SCALAR",
        }
    )

    mesh_idx = len(meshes)
    meshes.append(
        {
            "name": name,
            "primitives": [{"attributes": {"POSITION": pos_acc}, "indices": idx_acc, "material": mat_idx}],
        }
    )

    vertices.clear()
    indices.clear()
    return mesh_idx


def add_node(name, mesh_idx=None, translation=None, children=None):
    node = {"name": name}
    if mesh_idx is not None:
        node["mesh"] = mesh_idx
    if translation:
        node["translation"] = translation
    if children:
        node["children"] = children
    idx = len(nodes)
    nodes.append(node)
    return idx


def wall_segment(x, y, z, sx, sy, sz, mat):
    add_box(x, y, z, sx, sy, sz, mat)


def room_shell(
    cx,
    cz,
    width,
    depth,
    height,
    mat_wall,
    mat_floor,
    name_prefix,
    door_pz=None,
    door_nz=None,
    door_w=1.2,
    door_h=2.2,
):
    """Black box room; optional doorway openings on ±Z walls."""
    hw, hd = width / 2, depth / 2
    floor_y = 0.0
    cy_wall = height / 2

    add_box(cx, floor_y, cz, width, 0.05, depth, mat_floor, f"{name_prefix}_floor")
    add_box(cx, height, cz, width, 0.05, depth, mat_wall, f"{name_prefix}_ceiling")
    add_box(cx - hw, cy_wall, cz, 0.12, height, depth, mat_wall, f"{name_prefix}_wall_xn")
    add_box(cx + hw, cy_wall, cz, 0.12, height, depth, mat_wall, f"{name_prefix}_wall_xp")

    def wall_with_door(wall_z, tag, door):
        if door is None:
            add_box(cx, cy_wall, wall_z, width, height, 0.12, mat_wall, f"{name_prefix}_wall_{tag}")
            return
        seg_w = (width - door_w) / 2
        add_box(cx - hw + seg_w / 2, cy_wall, wall_z, seg_w, height, 0.12, mat_wall, f"{name_prefix}_wall_{tag}_l")
        add_box(cx + hw - seg_w / 2, cy_wall, wall_z, seg_w, height, 0.12, mat_wall, f"{name_prefix}_wall_{tag}_r")
        lintel_h = height - door_h
        if lintel_h > 0.01:
            add_box(cx, door_h + lintel_h / 2, wall_z, door_w, lintel_h, 0.12, mat_wall, f"{name_prefix}_lintel_{tag}")

    wall_with_door(cz - hd, "nz", door_nz)
    wall_with_door(cz + hd, "pz", door_pz)


def hallway(cx, z_start, z_end, width, height, mat_wall, mat_floor, name):
    depth = z_end - z_start
    cz = (z_start + z_end) / 2
    room_shell(cx, cz, width, depth, height, mat_wall, mat_floor, name, door_pz=True, door_nz=True, door_w=width * 0.85, door_h=2.3)


def doorway_shape_outline(cx, cz, width, height, mat, name="doorway_shape"):
    """Placeholder votive portal — rounded arch outline (torus-like frame)."""
    thickness = 0.06
    depth = 0.08
    segments = 24
    for i in range(segments):
        t0 = (i / segments) * math.pi
        t1 = ((i + 1) / segments) * math.pi
        r = width / 2
        x0 = cx + r * math.cos(t0)
        y0 = 0.4 + r * math.sin(t0)
        x1 = cx + r * math.cos(t1)
        y1 = 0.4 + r * math.sin(t1)
        mx = (x0 + x1) / 2
        my = (y0 + y1) / 2
        seg_len = math.hypot(x1 - x0, y1 - y0)
        add_box(mx, my, cz, seg_len + 0.02, thickness, depth, mat, f"{name}_seg_{i}")
    # vertical sides
    side_h = height - width / 2
    add_box(cx - width / 2, 0.4 + side_h / 2, cz, thickness, side_h, depth, mat, f"{name}_left")
    add_box(cx + width / 2, 0.4 + side_h / 2, cz, thickness, side_h, depth, mat, f"{name}_right")


def intake_machine(cx, cz, mat_body, mat_accent, name="intake_machine"):
    """Small votive machine — confession / what you are trying to accept."""
    add_box(cx, 0.9, cz, 0.8, 1.8, 0.8, mat_body, f"{name}_pedestal")
    add_box(cx, 1.6, cz, 0.5, 0.6, 0.5, mat_accent, f"{name}_core")
    # listening horn / funnel
    add_box(cx, 1.95, cz - 0.15, 0.35, 0.25, 0.35, mat_accent, f"{name}_horn")
    # small columns
    for dx in (-0.22, 0.22):
        add_box(cx + dx, 1.35, cz + 0.22, 0.08, 0.5, 0.08, mat_accent, f"{name}_col")


def surrender_machine(cx, cz, mat_body, mat_accent, mat_glow, name="surrender_machine"):
    """Large room-scale votive machine — ego / acceptance adjustment."""
    # base platform
    add_box(cx, 0.15, cz, 3.2, 0.3, 2.8, mat_body, f"{name}_platform")
    # central column
    add_box(cx, 1.4, cz, 0.6, 2.2, 0.6, mat_body, f"{name}_column")
    # ego dial ring (horizontal)
    add_box(cx, 1.8, cz, 1.6, 0.12, 1.6, mat_accent, f"{name}_ego_ring")
    # attachment arms
    for dz in (-0.9, 0.9):
        add_box(cx, 1.1, cz + dz, 2.4, 0.18, 0.18, mat_accent, f"{name}_arm")
    # glowing surrender core
    add_box(cx, 2.35, cz, 0.45, 0.45, 0.45, mat_glow, f"{name}_core")
    # side pedestals for sliders (abstract)
    for dx in (-1.3, 1.3):
        add_box(cx + dx, 0.75, cz + 1.1, 0.35, 1.2, 0.35, mat_body, f"{name}_ped_{dx}")
        add_box(cx + dx, 1.45, cz + 1.1, 0.12, 0.5, 0.12, mat_accent, f"{name}_slider_{dx}")


def visitor_path_markers(mat_path):
    """Subtle floor path dots along journey."""
    zs = [1.0, 8.0, 15.0, 21.0, 28.0]
    for i, z in enumerate(zs):
        add_box(0, 0.03, z, 0.25, 0.02, 0.25, mat_path, f"path_marker_{i}")


def build():
    mat_wall = add_material("wall_black", COL_WALL, roughness=0.95)
    mat_floor = add_material("floor_black", COL_FLOOR, roughness=0.9)
    mat_accent = add_material("accent_brass", COL_ACCENT, metallic=0.6, roughness=0.35)
    mat_machine = add_material("machine_body", COL_MACHINE, metallic=0.25, roughness=0.7)
    mat_glow = add_material("surrender_core", COL_GLOW, metallic=0.8, roughness=0.2)
    mat_door = add_material("doorway_outline", COL_DOORWAY, metallic=0.7, roughness=0.3)
    mat_path = add_material("visitor_path", COL_PATH, roughness=0.8)

    cx = 0.0
    height = 3.2

    # Zone 1 — Entry antechamber (8 people, ~5×4 m)
    entry_cz = 2.0
    entry_w, entry_d = 5.0, 4.0
    room_shell(cx, entry_cz, entry_w, entry_d, height, mat_wall, mat_floor, "01_entry", door_nz=True, door_pz=True, door_w=1.4, door_h=2.3)
    doorway_shape_outline(cx, entry_cz + entry_d / 2 - 0.06, 1.4, 2.3, mat_door, "01_doorway_shape")

    # Hallway 1 — long approach
    hall1_start = entry_cz + entry_d / 2
    hall1_end = hall1_start + 8.0
    hallway(cx, hall1_start, hall1_end, 1.8, height, mat_wall, mat_floor, "02_hallway_intake")

    # Zone 2 — First room: tell the machine what you are trying to accept
    room1_cz = hall1_end + 3.0
    room1_w, room1_d = 4.5, 6.0
    room_shell(cx, room1_cz, room1_w, room1_d, height, mat_wall, mat_floor, "03_room_intake", door_nz=True, door_pz=True, door_w=1.4, door_h=2.3)
    intake_machine(cx, room1_cz, mat_machine, mat_accent)

    # Hallway 2
    hall2_start = room1_cz + room1_d / 2
    hall2_end = hall2_start + 6.0
    hallway(cx, hall2_start, hall2_end, 2.0, height, mat_wall, mat_floor, "04_hallway_surrender")

    # Zone 3 — Large surrender room (8–10 people, ~6×7 m)
    room2_cz = hall2_end + 3.5
    room2_w, room2_d = 6.0, 7.0
    room_shell(cx, room2_cz, room2_w, room2_d, height, mat_wall, mat_floor, "05_room_surrender", door_nz=True, door_pz=None, door_w=1.6, door_h=2.3)
    surrender_machine(cx, room2_cz, mat_machine, mat_accent, mat_glow)

    visitor_path_markers(mat_path)

    # Assemble scene graph with labeled groups
    mesh_nodes = []
    for i, m in enumerate(meshes):
        mesh_nodes.append(add_node(m["name"], mesh_idx=i))

    # Group by zone prefix
    zones = {
        "SurrenderMachines": [],
        "01_Entry_Antechamber": [],
        "01_Doorway_Shape_Outline": [],
        "02_Hallway_To_Intake": [],
        "03_Room_Intake_Machine": [],
        "04_Hallway_To_Surrender": [],
        "05_Room_Surrender_Machine": [],
        "Visitor_Path": [],
    }
    for i, m in enumerate(meshes):
        n = m["name"]
        if n.startswith("01_entry") or n.startswith("01_door"):
            zones["01_Entry_Antechamber"].append(i)
            if "doorway" in n:
                zones["01_Doorway_Shape_Outline"].append(i)
        elif n.startswith("02_"):
            zones["02_Hallway_To_Intake"].append(i)
        elif n.startswith("03_") or n.startswith("intake_"):
            zones["03_Room_Intake_Machine"].append(i)
        elif n.startswith("04_"):
            zones["04_Hallway_To_Surrender"].append(i)
        elif n.startswith("05_") or n.startswith("surrender_"):
            zones["05_Room_Surrender_Machine"].append(i)
        elif n.startswith("path_"):
            zones["Visitor_Path"].append(i)

    root_children = []
    for zone_name, mesh_indices in zones.items():
        if zone_name == "SurrenderMachines" or not mesh_indices:
            continue
        child_nodes = [mesh_nodes[i] for i in mesh_indices]
        zone_idx = add_node(zone_name, children=child_nodes)
        root_children.append(zone_idx)

    add_node("SurrenderMachines_Root", children=root_children)

    # Write binary
    bin_data = b"".join(bin_chunks)
    BIN_PATH.write_bytes(bin_data)

    gltf = {
        "asset": {
            "version": "2.0",
            "generator": "Surrender Machines spatial generator — Mark Walhimer",
        },
        "scene": 0,
        "scenes": [
            {
                "name": "Surrender Machines — visitor path",
                "nodes": [len(nodes) - 1],
            }
        ],
        "nodes": nodes,
        "meshes": meshes,
        "materials": materials,
        "accessors": accessors,
        "bufferViews": buffer_views,
        "buffers": [{"byteLength": len(bin_data), "uri": BIN_PATH.name}],
        "extras": {
            "title": "Machine Aesthetic: Surrender Machines",
            "author": "Mark Walhimer",
            "cohort": "Loop Art Critique 21",
            "units": "meters",
            "visitor_sequence": [
                "Entry antechamber (8 people) — black room, votive threshold",
                "Doorway with shape outline (placeholder arch — replace with final form)",
                "Long hallway",
                "Room 1 — Intake machine: tell it what you are trying to accept",
                "Hallway",
                "Room 2 — Large surrender machine: adjust ego / acceptance (8–10 people)",
            ],
            "notes": "Spatial diagram for critique and planning. Doorway shape is provisional.",
        },
    }

    GLTF_PATH.write_text(json.dumps(gltf, indent=2))
    print(f"Wrote {GLTF_PATH}")
    print(f"Wrote {BIN_PATH} ({len(bin_data)} bytes)")
    print(f"Meshes: {len(meshes)}, Materials: {len(materials)}")


if __name__ == "__main__":
    build()
