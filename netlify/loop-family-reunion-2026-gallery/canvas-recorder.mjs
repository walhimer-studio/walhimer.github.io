/**
 * Canvas → MP4/WebM download via MediaRecorder (Safari mp4, Chrome webm fallback).
 */

export function createCanvasRecorder(getCanvas, opts = {}) {
  const filePrefix = opts.filePrefix ?? 'loop-gallery';
  const getAudioStream = opts.getAudioStream ?? null;
  const onActiveChange = opts.onActiveChange ?? null;

  let recorder = null;
  let chunks = [];
  let active = false;

  const pickMime = () => {
    const types = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4;codecs=avc1,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || '';
  };

  const recExt = (mimeType) => (mimeType.startsWith('video/mp4') ? 'mp4' : 'webm');

  const setActive = (on) => {
    active = on;
    onActiveChange?.(on);
  };

  const start = async () => {
    if (active) return false;
    const canvas = getCanvas?.();
    if (!canvas?.captureStream) return false;

    const mimeType = pickMime();
    if (!mimeType) {
      console.warn('MediaRecorder: no supported mp4/webm mime type');
      return false;
    }

    const videoStream = canvas.captureStream(60);
    let stream = videoStream;
    if (getAudioStream) {
      try {
        const audioStream = await getAudioStream();
        if (audioStream?.getAudioTracks?.().length) {
          stream = new MediaStream([
            ...videoStream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
          ]);
        }
      } catch (err) {
        console.warn('CanvasRecorder: audio unavailable, recording video only', err);
      }
    }

    chunks = [];
    recorder = new MediaRecorder(stream, {
      mimeType,
      videoBitsPerSecond: 16_000_000,
    });
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType.split(';')[0] });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      a.href = url;
      a.download = `${filePrefix}-${ts}.${recExt(mimeType)}`;
      a.click();
      URL.revokeObjectURL(url);
      stream.getTracks().forEach((t) => t.stop());
      setActive(false);
    };

    recorder.start(1000);
    setActive(true);
    return true;
  };

  const stop = () => {
    if (!active || !recorder) return;
    if (recorder.state !== 'inactive') recorder.stop();
    recorder = null;
  };

  const toggle = async () => {
    if (active) {
      stop();
      return false;
    }
    return start();
  };

  return { toggle, isActive: () => active };
}
