/**
 * Matrix Portal M4 — forward-slice LED export (browser Web Serial).
 * Reads a Three.js WebGLRenderTarget (vol3d FRONT pass / sliceRT), downscales to 64×64, sends RGB.
 */

export const LED_W = 64;
export const LED_H = 64;
export const FRAME_BYTES = LED_W * LED_H * 3;
export const BAUD = 921600;
export const PACKET_BYTES = 2 + FRAME_BYTES;
/** Target ~8 fps — stable on USB serial; full wire time + margin. */
export const WIRE_MS = Math.max(125, Math.ceil((PACKET_BYTES * 10 / BAUD)) + 40);
/** @deprecated use WIRE_MS */
export const MS_PER_FRAME = WIRE_MS;
export const HDR = new Uint8Array([0xaa, 0x55]);
export const ADAFRUIT_USB_VENDOR = 0x239a;

export function downscaleForwardSlice(rgba, srcW, srcH, dstW = LED_W, dstH = LED_H) {
  const out = new Uint8Array(dstW * dstH * 3);
  for (let y = 0; y < dstH; y++) {
    const srcY = srcH - 1 - Math.floor((y * srcH) / dstH);
    for (let x = 0; x < dstW; x++) {
      const srcX = Math.floor((x * srcW) / dstW);
      const si = (srcY * srcW + srcX) * 4;
      const di = (y * dstW + x) * 3;
      out[di] = rgba[si];
      out[di + 1] = rgba[si + 1];
      out[di + 2] = rgba[si + 2];
    }
  }
  return out;
}

export function readRenderTargetRGBA(renderer, renderTarget, width, height) {
  const buf = new Uint8Array(width * height * 4);
  renderer.readRenderTargetPixels(renderTarget, 0, 0, width, height, buf);
  return buf;
}

/** Read center 64×64 of what is on screen (fallback — prefer readCameraLed). */
export function readScreenLed(renderer) {
  const canvas = renderer.domElement;
  const w = canvas.width;
  const h = canvas.height;
  if (!w || !h) throw new Error('canvas not ready');
  const cw = Math.min(LED_W, w);
  const ch = Math.min(LED_H, h);
  const ox = Math.max(0, Math.floor((w - cw) / 2));
  const oyTop = Math.max(0, Math.floor((h - ch) / 2));
  const oy = h - oyTop - ch;
  const rgba = new Uint8Array(cw * ch * 4);
  const prevRT = renderer.getRenderTarget();
  renderer.setRenderTarget(null);
  const gl = renderer.getContext();
  gl.readPixels(ox, oy, cw, ch, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
  renderer.setRenderTarget(prevRT);
  return rgbaToRgb(rgba, cw, ch);
}

/** Re-render scene with the live camera into 64×64 — matches automated travel view exactly. */
export function readCameraLed(renderer, scene, camera, THREE, cameraRTRef) {
  if (!renderer || !scene || !camera || !THREE?.WebGLRenderTarget) {
    throw new Error('renderer, scene, camera, THREE required');
  }
  const aspect = camera.aspect > 0 ? camera.aspect : 1;
  const capH = LED_H;
  const capW = Math.max(LED_W, Math.round(LED_H * aspect));
  if (!cameraRTRef.rt || cameraRTRef.w !== capW || cameraRTRef.h !== capH) {
    cameraRTRef.rt?.dispose?.();
    cameraRTRef.rt = new THREE.WebGLRenderTarget(capW, capH, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.NearestFilter,
      format: THREE.RGBAFormat,
      depthBuffer: true,
    });
    cameraRTRef.w = capW;
    cameraRTRef.h = capH;
  }
  const prevRT = renderer.getRenderTarget();
  const prevAutoClear = renderer.autoClear;
  renderer.autoClear = true;
  renderer.setRenderTarget(cameraRTRef.rt);
  renderer.render(scene, camera);
  renderer.setRenderTarget(prevRT);
  renderer.autoClear = prevAutoClear;
  const ox = Math.max(0, Math.floor((capW - LED_W) / 2));
  const rgba = new Uint8Array(LED_W * LED_H * 4);
  renderer.readRenderTargetPixels(cameraRTRef.rt, ox, 0, LED_W, LED_H, rgba);
  return rgbaToRgb(rgba, LED_W, LED_H);
}

function rgbaToRgb(rgba, cw, ch) {
  const rgb = new Uint8Array(FRAME_BYTES);
  for (let y = 0; y < ch; y++) {
    const srcY = ch - 1 - y;
    for (let x = 0; x < cw; x++) {
      const si = (srcY * cw + x) * 4;
      const di = (y * LED_W + x) * 3;
      rgb[di] = rgba[si];
      rgb[di + 1] = rgba[si + 1];
      rgb[di + 2] = rgba[si + 2];
    }
  }
  return rgb;
}

/** Read 64×64 center of forward slice only (internal vol pass — not the camera view). */
export function readForwardSliceLed(renderer, renderTarget, srcW, srcH) {
  const cw = Math.min(LED_W, srcW);
  const ch = Math.min(LED_H, srcH);
  const ox = Math.max(0, Math.floor((srcW - cw) / 2));
  const oy = Math.max(0, Math.floor((srcH - ch) / 2));
  const rgba = new Uint8Array(cw * ch * 4);
  const prevRT = renderer.getRenderTarget();
  renderer.setRenderTarget(null);
  renderer.readRenderTargetPixels(renderTarget, ox, oy, cw, ch, rgba);
  renderer.setRenderTarget(prevRT);
  return rgbaToRgb(rgba, cw, ch);
}

export function testPatternFrame(phase = 0) {
  const rgb = new Uint8Array(FRAME_BYTES);
  const mode = Math.floor(phase / 16) % 3;
  let r = 0;
  let g = 0;
  let b = 0;
  if (mode === 0) {
    r = 255;
    g = 0;
    b = 200;
  } else if (mode === 1) {
    r = 255;
    g = 240;
    b = 0;
  } else {
    r = 0;
    g = 180;
    b = 255;
  }
  for (let i = 0; i < FRAME_BYTES; i += 3) {
    rgb[i] = r;
    rgb[i + 1] = g;
    rgb[i + 2] = b;
  }
  return rgb;
}

export function createForwardSliceLedExport(options = {}) {
  let port = null;
  let writer = null;
  let connected = false;
  let streaming = false;
  let framesSent = 0;
  let scratch = null;
  let sendChain = Promise.resolve();
  let sendBusy = false;
  const cameraRTRef = { rt: null, w: 0, h: 0 };

  const waitWireGap = () => new Promise((resolve) => setTimeout(resolve, WIRE_MS));

  const setStatus = (msg) => {
    if (options.onStatus) options.onStatus(msg);
  };

  const formatPortInfo = (p) => {
    const i = p.getInfo();
    const vid = i.usbVendorId != null ? `0x${i.usbVendorId.toString(16)}` : '?';
    const pid = i.usbProductId != null ? `0x${i.usbProductId.toString(16)}` : '?';
    return `usb ${vid}:${pid}`;
  };

  const pickPort = async () => {
    const granted = await navigator.serial.getPorts();
    const adafruit = granted.filter((p) => p.getInfo().usbVendorId === ADAFRUIT_USB_VENDOR);
    if (adafruit.length === 1) {
      setStatus(`Portal (${formatPortInfo(adafruit[0])})…`);
      return adafruit[0];
    }
    setStatus('pick Matrix Portal (usbmodem)…');
    return navigator.serial.requestPort({ filters: [{ usbVendorId: ADAFRUIT_USB_VENDOR }] });
  };

  const sendRgb = async (rgb) => {
    if (!writer) throw new Error('not connected');
    if (!rgb || rgb.length !== FRAME_BYTES) {
      throw new Error(`bad frame size (${rgb?.length ?? 0}, expected ${FRAME_BYTES})`);
    }
    if (!scratch || scratch.length !== HDR.length + FRAME_BYTES) {
      scratch = new Uint8Array(HDR.length + FRAME_BYTES);
      scratch.set(HDR, 0);
    }
    scratch.set(rgb, HDR.length);
    const payload = scratch.slice(0);
    sendChain = sendChain.catch(() => {}).then(() => writer.write(payload));
    await sendChain;
    framesSent += 1;
    return true;
  };

  /** Call once per animation frame, immediately after the sketch render completes. */
  const tickAfterRender = () => {
    if (!streaming || !writer || sendBusy) return;

    let rgb;
    try {
      if (typeof options.getCameraFrame === 'function') {
        const { renderer, scene, camera, THREE } = options.getCameraFrame();
        if (!renderer || !scene || !camera) return;
        rgb = readCameraLed(renderer, scene, camera, THREE, cameraRTRef);
      } else if (typeof options.getScreenFrame === 'function') {
        const { renderer } = options.getScreenFrame();
        if (!renderer) return;
        rgb = readScreenLed(renderer);
      } else if (typeof options.getSliceFrame === 'function') {
        const { renderer, sliceRT, w, h } = options.getSliceFrame();
        if (!renderer || !sliceRT || !w || !h) return;
        rgb = readForwardSliceLed(renderer, sliceRT, w, h);
      } else {
        setStatus('LED: missing getCameraFrame hook');
        streaming = false;
        return;
      }
    } catch (err) {
      setStatus(`read failed: ${err.message}`);
      return;
    }

    sendBusy = true;
    const t0 = performance.now();
    sendRgb(rgb)
      .then(() => waitWireGap())
      .then(() => {
        const fps = (1000 / Math.max(performance.now() - t0, 1)).toFixed(1);
        setStatus(`streaming · ${framesSent} fr · ${fps} fps`);
      })
      .catch((err) => {
        setStatus(`send failed: ${err.message}`);
        streaming = false;
      })
      .finally(() => {
        sendBusy = false;
      });
  };

  const startSendLoop = () => {
    sendBusy = false;
  };

  const connect = async () => {
    if (!navigator.serial) {
      setStatus('Web Serial unavailable — use Chrome');
      return false;
    }
    setStatus('opening serial port…');
    try {
      port = await pickPort();
      const info = formatPortInfo(port);
      if (port.getInfo().usbVendorId !== ADAFRUIT_USB_VENDOR) {
        throw new Error(`not Adafruit (${info})`);
      }
      await port.open({ baudRate: BAUD, bufferSize: 65536 });
      writer = port.writable.getWriter();
      connected = true;
      framesSent = 0;
      sendChain = Promise.resolve();
      await new Promise((r) => setTimeout(r, 500));
      setStatus(`Portal ready (${info})`);
      return true;
    } catch (err) {
      const msg = String(err?.message || err);
      if (/cancel/i.test(msg) || err?.name === 'NotFoundError') {
        setStatus('port pick cancelled');
      } else if (/busy|in use|lock|access/i.test(msg)) {
        setStatus(`port busy — close other serial tabs (${msg})`);
      } else {
        setStatus(`connect failed: ${msg}`);
      }
      await disconnect(true);
      return false;
    }
  };

  const disconnect = async (keepStatus = false) => {
    streaming = false;
    sendBusy = false;
    connected = false;
    try {
      if (writer) {
        await writer.close();
        writer = null;
      }
      if (port) {
        await port.close();
        port = null;
      }
    } catch (_) {
      /* ignore */
    }
    if (!keepStatus) setStatus('disconnected');
  };

  const runTestPattern = async (onFrame, shouldContinue) => {
    let phase = 0;
    while (shouldContinue()) {
      phase += 1;
      await sendRgb(testPatternFrame(phase));
      if (onFrame) onFrame(framesSent);
      await new Promise((r) => setTimeout(r, MS_PER_FRAME));
    }
  };

  const toggleStream = async () => {
    if (!connected) {
      const ok = await connect();
      if (!ok) return false;
    }
    streaming = !streaming;
    if (streaming) {
      startSendLoop();
    } else {
      sendBusy = false;
      setStatus(`paused · ${framesSent} frames sent`);
    }
    return streaming;
  };

  return {
    connect,
    disconnect,
    toggleStream,
    tickAfterRender,
    sendRgb,
    runTestPattern,
    downscaleForwardSlice,
    readScreenLed,
    readCameraLed,
    readForwardSliceLed,
    readRenderTargetRGBA,
    isConnected: () => connected,
    isStreaming: () => streaming,
    get framesSent() {
      return framesSent;
    },
  };
}
