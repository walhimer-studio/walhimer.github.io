const MIN_PX = 1400;
const TARGET_PX = 4200;
const EXPORT_DPI = 300;
const MAX_BYTES = 10 * 1024 * 1024;
const FIT_INSET = 0.03;

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function snapshotCanvas(canvas) {
  const snap = document.createElement("canvas");
  snap.width = canvas.width;
  snap.height = canvas.height;
  const ctx = snap.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
  return snap;
}

function renderSquare(snap, size) {
  const out = document.createElement("canvas");
  out.width = size;
  out.height = size;
  const ctx = out.getContext("2d");
  ctx.fillStyle = "#07080c";
  ctx.fillRect(0, 0, size, size);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const inset = size * FIT_INSET;
  const frame = size - inset * 2;
  const scale = Math.min(frame / snap.width, frame / snap.height);
  const dw = snap.width * scale;
  const dh = snap.height * scale;
  ctx.drawImage(
    snap,
    0,
    0,
    snap.width,
    snap.height,
    (size - dw) / 2,
    (size - dh) / 2,
    dw,
    dh
  );
  return out;
}

function blobFromCanvas(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Export failed"))),
      type,
      quality
    );
  });
}

function embedJpegDpi(blob, dpi = EXPORT_DPI) {
  return blob.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return blob;

    for (let i = 2; i < bytes.length - 8; i++) {
      if (bytes[i] !== 0xff) continue;
      const marker = bytes[i + 1];
      if (marker === 0xe0) {
        const hi = (dpi >> 8) & 0xff;
        const lo = dpi & 0xff;
        bytes[i + 11] = 0x01;
        bytes[i + 12] = hi;
        bytes[i + 13] = lo;
        bytes[i + 14] = hi;
        bytes[i + 15] = lo;
        break;
      }
      if (marker === 0xd9) break;
      const segLen = (bytes[i + 2] << 8) | bytes[i + 3];
      i += 2 + segLen;
    }

    return new Blob([bytes], { type: "image/jpeg" });
  });
}

function embedPngDpi(blob, dpi = EXPORT_DPI) {
  return blob.arrayBuffer().then((buffer) => {
    const bytes = new Uint8Array(buffer);
    const signature = [137, 80, 78, 71, 13, 10, 26, 10];
    for (let i = 0; i < signature.length; i++) {
      if (bytes[i] !== signature[i]) return blob;
    }

    const ppm = Math.round(dpi / 0.0254);
    const chunk = new Uint8Array(21);
    const view = new DataView(chunk.buffer);
    view.setUint32(0, 9);
    chunk[4] = 112;
    chunk[5] = 72;
    chunk[6] = 89;
    chunk[7] = 115;
    view.setUint32(8, ppm, false);
    view.setUint32(12, ppm, false);
    chunk[16] = 1;

    let crc = 0xffffffff;
    for (let i = 4; i < 17; i++) {
      crc ^= chunk[i] << 24;
      for (let j = 0; j < 8; j++) {
        crc = crc & 0x80000000 ? (crc << 1) ^ 0x04c11db7 : crc << 1;
      }
    }
    view.setUint32(17, (crc ^ 0xffffffff) >>> 0, false);

    const out = new Uint8Array(bytes.length + chunk.length);
    out.set(bytes.subarray(0, 8), 0);
    out.set(chunk, 8);
    out.set(bytes.subarray(8), 8 + chunk.length);
    return new Blob([out], { type: "image/png" });
  });
}

function targetExportSize(canvas) {
  const srcMax = Math.max(canvas.width, canvas.height);
  return Math.max(MIN_PX, TARGET_PX, srcMax);
}

export async function downloadBloomCover(canvas) {
  if (!canvas?.width || !canvas?.height) {
    throw new Error("Bloom canvas not ready — wait for load, then try again");
  }

  const snap = snapshotCanvas(canvas);
  let size = targetExportSize(canvas);
  let out = renderSquare(snap, size);

  for (let attempt = 0; attempt < 14; attempt++) {
    for (let quality = 0.95; quality >= 0.6; quality -= 0.05) {
      let blob = await blobFromCanvas(out, "image/jpeg", quality);
      blob = await embedJpegDpi(blob, EXPORT_DPI);
      if (blob.size <= MAX_BYTES) {
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        triggerDownload(
          blob,
          `listening-to-the-sky-bloom-${size}x${size}-${EXPORT_DPI}dpi-${stamp}.jpg`
        );
        return { size, bytes: blob.size, format: "jpeg", quality, dpi: EXPORT_DPI };
      }
    }

    let png = await blobFromCanvas(out, "image/png");
    png = await embedPngDpi(png, EXPORT_DPI);
    if (png.size <= MAX_BYTES) {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      triggerDownload(
        png,
        `listening-to-the-sky-bloom-${size}x${size}-${EXPORT_DPI}dpi-${stamp}.png`
      );
      return { size, bytes: png.size, format: "png", dpi: EXPORT_DPI };
    }

    if (size <= MIN_PX) break;
    size = Math.max(MIN_PX, Math.floor(size * 0.88));
    out = renderSquare(snap, size);
  }

  throw new Error("Could not export under 10MB at 1400×1400 minimum");
}
