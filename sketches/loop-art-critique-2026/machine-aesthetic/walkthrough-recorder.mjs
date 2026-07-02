/**
 * Tab capture (entry text + artworks) or canvas fallback — Ghost 77823 walkthrough (R key).
 */
export function createWalkthroughRecorder(getCanvas, getAudioStream, {
  downloadPrefix = "ghost-77823-walkthrough",
  recHud = document.getElementById("rec-hud"),
  onActiveChange,
} = {}) {
  let recorder = null;
  let chunks = [];
  let active = false;
  let captureStream = null;

  const pickMime = () => {
    const types = [
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4;codecs=avc1,mp4a.40.2",
      "video/mp4",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
  };

  const recExt = (mimeType) => (mimeType.startsWith("video/mp4") ? "mp4" : "webm");

  const setActive = (on) => {
    active = on;
    onActiveChange?.(on);
  };

  const setRecHud = (on) => {
    if (recHud) {
      recHud.classList.toggle("is-recording", on);
      recHud.setAttribute("aria-hidden", on ? "false" : "true");
    }
  };

  const releaseCapture = () => {
    if (captureStream) {
      captureStream.getTracks().forEach((t) => t.stop());
      captureStream = null;
    }
  };

  const finish = () => {
    if (!active) return;
    if (recorder && recorder.state !== "inactive") {
      try { recorder.stop(); } catch (_) { /* onstop runs cleanup */ }
      return;
    }
    releaseCapture();
    setActive(false);
    setRecHud(false);
    recorder = null;
  };

  const bindStreamEnd = (stream) => {
    stream.getTracks().forEach((track) => {
      track.addEventListener("ended", finish, { once: true });
    });
  };

  async function buildStream() {
    await getAudioStream();

    try {
      const display = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 60 },
        audio: true,
      });
      const tracks = [...display.getVideoTracks(), ...display.getAudioTracks()];
      if (!display.getAudioTracks().length) {
        const audioStream = await getAudioStream();
        tracks.push(...audioStream.getAudioTracks());
      }
      return new MediaStream(tracks);
    } catch (err) {
      if (err?.name === "NotAllowedError") throw err;
      const canvas = getCanvas();
      if (!canvas?.captureStream) throw new Error("capture unavailable");
      const videoStream = canvas.captureStream(60);
      const audioStream = await getAudioStream();
      return new MediaStream([
        ...videoStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);
    }
  }

  const start = async () => {
    if (active) return false;

    const mimeType = pickMime();
    if (!mimeType) {
      console.warn("MediaRecorder: no supported mp4/webm mime type");
      return false;
    }

    setRecHud(true);

    let stream;
    try {
      stream = await buildStream();
    } catch (err) {
      setRecHud(false);
      console.warn("Recording failed to start:", err);
      return false;
    }

    captureStream = stream;
    bindStreamEnd(stream);
    chunks = [];
    recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 16_000_000,
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType.split(";")[0] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      a.href = url;
      a.download = `${downloadPrefix}-seed77823-${ts}.${recExt(mimeType)}`;
      a.click();
      URL.revokeObjectURL(url);
      releaseCapture();
      setActive(false);
      setRecHud(false);
      recorder = null;
    };

    recorder.start(250);
    setActive(true);
    return true;
  };

  const stop = () => {
    if (!active || !recorder) return;
    if (recorder.state !== "inactive") recorder.stop();
    recorder = null;
  };

  const toggle = async () => {
    if (active) {
      stop();
      return false;
    }
    return start();
  };

  return { toggle, stop, isActive: () => active };
};
