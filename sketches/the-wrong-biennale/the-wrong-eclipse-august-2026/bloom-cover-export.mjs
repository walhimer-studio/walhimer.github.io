const MIN_PX = 1400;
const MAX_BYTES = 10 * 1024 * 1024;

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function renderSquare(canvas, size) {
  const out = document.createElement("canvas");
  out.width = size;
  out.height = size;
  const ctx = out.getContext("2d");
  ctx.fillStyle = "#07080c";
  ctx.fillRect(0, 0, size, size);

  const srcW = canvas.width;
  const srcH = canvas.height;
  const scale = Math.min(size / srcW, size / srcH);
  const dw = srcW * scale;
  const dh = srcH * scale;
  ctx.drawImage(canvas, (size - dw) / 2, (size - dh) / 2, dw, dh);
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

export async function downloadBloomCover(canvas) {
  if (!canvas?.width || !canvas?.height) {
    throw new Error("Bloom canvas not ready — wait for load, then try again");
  }

  let size = Math.max(MIN_PX, canvas.width, canvas.height);
  let out = renderSquare(canvas, size);

  for (let attempt = 0; attempt < 12; attempt++) {
    for (let quality = 0.92; quality >= 0.55; quality -= 0.05) {
      const blob = await blobFromCanvas(out, "image/jpeg", quality);
      if (blob.size <= MAX_BYTES) {
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        triggerDownload(blob, `listening-to-the-sky-bloom-${size}x${size}-${stamp}.jpg`);
        return { size, bytes: blob.size, format: "jpeg", quality };
      }
    }

    const png = await blobFromCanvas(out, "image/png");
    if (png.size <= MAX_BYTES) {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      triggerDownload(png, `listening-to-the-sky-bloom-${size}x${size}-${stamp}.png`);
      return { size, bytes: png.size, format: "png" };
    }

    if (size <= MIN_PX) break;
    size = Math.max(MIN_PX, Math.floor(size * 0.9));
    out = renderSquare(canvas, size);
  }

  throw new Error("Could not export under 10MB at 1400×1400 minimum");
}
