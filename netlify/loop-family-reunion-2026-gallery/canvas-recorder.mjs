/**
 * Canvas → MP4/WebM download via MediaRecorder (Safari mp4, Chrome webm fallback).
 * captureStream(fps) + requestFrame() each render tick for WebGL; video-only by default.
 */

export function createCanvasRecorder(getCanvas, opts = {}) {
  const filePrefix = opts.filePrefix ?? 'loop-gallery';
  const getAudioStream = opts.getAudioStream ?? null;
  const includeAudio = opts.includeAudio === true;
  const captureFps = opts.captureFps ?? 30;
  const onActiveChange = opts.onActiveChange ?? null;

  let recorder = null;
  let chunks = [];
  let active = false;
  let videoTrack = null;
  let mediaStream = null;
  let mimeType = '';
  let stopResolve = null;
  let lastResult = { ok: false, bytes: 0, seconds: 0 };
  let startedAt = 0;

  const pickMime = () => {
    const types = includeAudio
      ? [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
        'video/mp4;codecs=avc1,mp4a.40.2',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ]
      : [
        'video/mp4;codecs=avc1.42E01E',
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
      ];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
  };

  const recExt = (type) => (type.startsWith('video/mp4') ? 'mp4' : 'webm');

  const waitFrames = (count = 3) => new Promise((resolve) => {
    let n = 0;
    const step = () => {
      n += 1;
      if (n >= count) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  const setActive = (on) => {
    active = on;
    onActiveChange?.(on);
  };

  const notifyFrame = () => {
    if (!active || !videoTrack || videoTrack.readyState !== 'live') return;
    try {
      videoTrack.requestFrame();
    } catch (_) { /* optional on some browsers */ }
  };

  const downloadBlob = (blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    a.href = url;
    a.download = `${filePrefix}-${ts}.${recExt(mimeType)}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const start = async () => {
    if (active) return false;
    const canvas = getCanvas?.();
    if (!canvas?.captureStream) return false;

    mimeType = pickMime();
    if (!mimeType) {
      console.warn('MediaRecorder: no supported mp4/webm mime type');
      return false;
    }

    const videoStream = canvas.captureStream(captureFps);
    videoTrack = videoStream.getVideoTracks()[0] || null;
    mediaStream = videoStream;

    if (includeAudio && getAudioStream) {
      try {
        const audioStream = await getAudioStream();
        if (audioStream?.getAudioTracks?.().length) {
          mediaStream = new MediaStream([
            ...videoStream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
          ]);
        }
      } catch (err) {
        console.warn('CanvasRecorder: audio unavailable, recording video only', err);
      }
    }

    chunks = [];
    lastResult = { ok: false, bytes: 0, seconds: 0 };
    startedAt = Date.now();
    recorder = new MediaRecorder(mediaStream, {
      mimeType,
      videoBitsPerSecond: 16_000_000,
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    recorder.onerror = (e) => {
      console.error('CanvasRecorder error', e);
    };
    recorder.onstop = () => {
      const seconds = startedAt ? (Date.now() - startedAt) / 1000 : 0;
      const blob = new Blob(chunks, { type: mimeType.split(';')[0] });
      lastResult = { ok: blob.size > 0, bytes: blob.size, seconds, chunks: chunks.length };
      if (blob.size > 0) {
        downloadBlob(blob);
      } else {
        console.warn('CanvasRecorder: recording empty — no file saved');
      }
      mediaStream?.getTracks().forEach((t) => t.stop());
      videoTrack = null;
      mediaStream = null;
      setActive(false);
      const done = stopResolve;
      stopResolve = null;
      done?.(lastResult);
    };

    await waitFrames(3);
    notifyFrame();
    notifyFrame();
    recorder.start(250);
    setActive(true);
    return true;
  };

  const stop = () => new Promise((resolve) => {
    if (!active || !recorder) {
      resolve(lastResult);
      return;
    }
    stopResolve = resolve;
    try {
      if (recorder.state === 'recording') recorder.requestData();
    } catch (_) { /* optional */ }
    setTimeout(() => {
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      else resolve(lastResult);
    }, 300);
  });

  const toggle = async () => {
    if (active) {
      await stop();
      return false;
    }
    return start();
  };

  const elapsedSeconds = () => (active && startedAt ? (Date.now() - startedAt) / 1000 : 0);

  return {
    toggle,
    start,
    stop,
    isActive: () => active,
    notifyFrame,
    lastResult: () => lastResult,
    elapsedSeconds,
  };
}
