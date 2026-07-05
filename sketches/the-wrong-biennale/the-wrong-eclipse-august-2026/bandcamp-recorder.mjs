/**
 * Bandcamp PoC stereo capture — records master bus to WebM/WAV for submission prep.
 */

export function createBandcampRecorder(audioContext, masterGain) {
  let dest = null;
  let recorder = null;
  let chunks = [];
  let recording = false;

  function ensureTap() {
    if (dest) return dest;
    dest = audioContext.createMediaStreamDestination();
    masterGain.connect(dest);
    return dest;
  }

  function start() {
    if (recording) return false;
    ensureTap();
    chunks = [];
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    recorder = new MediaRecorder(dest.stream, { mimeType: mime, audioBitsPerSecond: 320_000 });
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    recorder.start(250);
    recording = true;
    return true;
  }

  function stop() {
    return new Promise((resolve) => {
      if (!recording || !recorder) {
        resolve(null);
        return;
      }
      recorder.onstop = () => {
        recording = false;
        const blob = new Blob(chunks, { type: recorder.mimeType });
        const ext = blob.type.includes("webm") ? "webm" : "wav";
        resolve({ blob, ext, mime: blob.type });
      };
      recorder.stop();
    });
  }

  function download(result, basename = "holes-in-the-sky-poc") {
    if (!result?.blob) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${basename}-${Date.now()}.${result.ext}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  return {
    isRecording: () => recording,
    start,
    stop,
    download,
  };
}
