/**
 * COMPOSE — ephemeral upload → RGB→XYZ GPU volume (new file).
 * Invisible RGB: R→XY, G→color, B→Z. No server storage.
 */
import * as THREE from "/sketches/js/three-0.170.0.module.js";

const PAL = {
  pink: [255, 16, 240],
  yellow: [255, 244, 0],
  orange: [255, 120, 0],
  skyBlue: [199, 225, 250],
  white: [255, 255, 255],
  mint: [153, 165, 207],
  violet: [180, 140, 255],
};

const SPECTRUM = [PAL.pink, PAL.yellow, PAL.orange, PAL.mint, PAL.violet, PAL.skyBlue];

const SLICE_FRAG = [
  "precision highp float;",
  "uniform sampler2D buf, img, mot;",
  "uniform float time;",
  "uniform vec3 dims;",
  "uniform float uSlice;",
  "uniform int doRaster;",
  "uniform int doSpectrum;",
  "uniform vec3 specA, specB, specInk;",
  "uniform float specAlphaAB, specAlphaInk, paletteVeil;",
  "varying vec2 vUv;",
  "vec2 atlasUV(vec2 uv, float z) { return vec2(uv.x, (z + uv.y) / dims.z); }",
  "vec3 sampleVol(vec2 uv, float dz) { return texture2D(buf, atlasUV(uv, uSlice + dz)).rgb; }",
  "void main() {",
  "  vec2 uv = vec2(vUv.x, 1.0 - vUv.y);",
  "  vec2 pos = floor(uv * dims.xy);",
  "  vec3 col = sampleVol(uv, 0.0);",
  "  vec4 m = texture2D(mot, uv);",
  "  float dr = floor(m.r * 255.0 + 0.5);",
  "  float dg = floor(m.g * 255.0 + 0.5);",
  "  float db = floor(m.b * 255.0 + 0.5);",
  "  vec2 oxy = vec2(0.0);",
  "  float oz = 0.0;",
  "  if (doRaster == 1) {",
  "    if (mod(dr, 2.0) >= 1.0) oxy.y += 1.0 / dims.y;",
  "    if (mod(dr, 4.0) >= 2.0) oxy.x += 1.0 / dims.x;",
  "    if (mod(dr, 8.0) >= 4.0) oxy.y -= 1.0 / dims.y;",
  "    if (mod(dr, 16.0) >= 8.0) oxy.x -= 1.0 / dims.x;",
  "    if (mod(db, 2.0) >= 1.0) oz += 1.0;",
  "    if (mod(db, 4.0) >= 2.0) oz -= 1.0;",
  "    if (mod(db, 8.0) >= 4.0) oz += 2.0;",
  "    col = sampleVol(uv + oxy, oz);",
  "  }",
  "  if (doSpectrum == 1) {",
  "    if (mod(dg, 2.0) >= 1.0) {",
  "      vec2 bUv = mod(pos, 16.0) / 16.0;",
  "      vec4 tile = texture2D(img, bUv);",
  "      col = mix(col, tile.rgb, tile.a * paletteVeil);",
  "    }",
  "    if (mod(dg, 4.0) >= 2.0) {",
  "      vec3 spec = mix(specA, specB, fract(time * 0.14));",
  "      col = mix(col, spec, specAlphaAB);",
  "    }",
  "    if (mod(dg, 8.0) >= 4.0) col = mix(col, specInk, specAlphaInk);",
  "  }",
  "  gl_FragColor = vec4(col, 1.0);",
  "}",
].join("\n");

const CUBE_FRAG = [
  "precision highp float;",
  "uniform sampler2D vol;",
  "uniform vec3 dims;",
  "uniform vec3 boxSize;",
  "varying vec3 vPos;",
  "varying vec3 vRayDir;",
  "vec2 atlasUV(vec2 uv, float z) { return vec2(uv.x, (z + uv.y) / dims.z); }",
  "vec3 sampleVol(vec3 p) {",
  "  vec3 q = clamp(p, 0.001, 0.999);",
  "  float z = q.z * (dims.z - 1.0);",
  "  return texture2D(vol, atlasUV(q.xy, z)).rgb;",
  "}",
  "void main() {",
  "  vec3 ro = vPos;",
  "  vec3 rd = normalize(vRayDir);",
  "  vec3 inv = 1.0 / max(abs(rd), 1e-4);",
  "  vec3 t0 = (-boxSize - ro) * inv;",
  "  vec3 t1 = (boxSize - ro) * inv;",
  "  vec3 tmin = min(t0, t1);",
  "  vec3 tmax = max(t0, t1);",
  "  float ta = max(max(tmin.x, tmin.y), tmin.z);",
  "  float tb = min(min(tmax.x, tmax.y), tmax.z);",
  "  if (tb < max(ta, 0.0)) { gl_FragColor = vec4(1.0); return; }",
  "  float tStart = max(ta, 0.0);",
  "  vec3 col = vec3(1.0);",
  "  for (float i = 0.0; i < 48.0; i++) {",
  "    float t = tStart + (tb - tStart) * (i + 0.5) / 48.0;",
  "    vec3 p = (ro + rd * t) / (boxSize * 2.0) + 0.5;",
  "    if (any(lessThan(p, vec3(0.0))) || any(greaterThan(p, vec3(1.0)))) continue;",
  "    vec3 s = sampleVol(p);",
  "    float ink = length(s - vec3(1.0));",
  "    float a = clamp(0.05 + ink * 0.58, 0.0, 0.94);",
  "    col = mix(col, s, a);",
  "  }",
  "  gl_FragColor = vec4(col, 1.0);",
  "}",
].join("\n");

function palette16() {
  const a = new Uint8Array(16 * 16 * 4);
  for (let i = 0; i < 256; i++) {
    const x = i % 16;
    const y = Math.floor(i / 16);
    const grid = x % 4 === 0 || y % 4 === 0;
    const c = grid ? SPECTRUM[(((x >> 2) + (y >> 2) * 2) % SPECTRUM.length)] : PAL.white;
    const veil = grid ? 0.12 + ((((x >> 2) + (y >> 2)) % 5) * 0.07) : 0;
    a[i * 4] = c[0];
    a[i * 4 + 1] = c[1];
    a[i * 4 + 2] = c[2];
    a[i * 4 + 3] = Math.floor(veil * 255);
  }
  return a;
}

function makeDataTex(w, h, data) {
  const tex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat, THREE.UnsignedByteType);
  tex.minFilter = THREE.NearestFilter;
  tex.magFilter = THREE.NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

function imageDataFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth || img.width;
        c.height = img.naturalHeight || img.height;
        c.getContext("2d").drawImage(img, 0, 0);
        resolve(c.getContext("2d").getImageData(0, 0, c.width, c.height));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image"));
    };
    img.src = url;
  });
}

export function createComposeRgbXyz({ mount, seed = 77823, onStatus } = {}) {
  const depth = 24;
  let width = 128;
  let height = 96;
  let renderer;
  let scene;
  let camera;
  let innerVol;
  let volTex = [];
  let volId = 0;
  let imgTex;
  let motTex;
  let motScratch;
  let sliceRT;
  let sliceMat;
  let sliceScene;
  let sliceCam;
  let raf = 0;
  let running = false;
  let hasOffer = false;
  let offerLabel = "";
  const options = { doRaster: 1, doSpectrum: 1 };
  const specA = new THREE.Vector3(1, 0.9, 0.2);
  const specB = new THREE.Vector3(0.2, 0.85, 1);
  const specInk = new THREE.Vector3(0.15, 0.1, 0.2);

  const setStatus = (msg) => onStatus?.(msg);

  const volSize = () => {
    let w = Math.max(96, Math.min(192, Math.floor(window.innerWidth * 0.45)));
    let h = Math.max(72, Math.min(144, Math.floor(window.innerHeight * 0.38)));
    const maxH = Math.floor(4096 / depth);
    if (h > maxH) {
      const s = maxH / h;
      h = maxH;
      w = Math.max(64, Math.floor(w * s));
    }
    return { w, h };
  };

  const uploadMot = (pixels) => {
    if (!motTex) return;
    if (!motScratch) motScratch = document.createElement("canvas");
    if (motScratch.width !== width || motScratch.height !== height) {
      motScratch.width = width;
      motScratch.height = height;
    }
    const src = document.createElement("canvas");
    src.width = pixels.width;
    src.height = pixels.height;
    src.getContext("2d").putImageData(pixels, 0, 0);
    const ctx = motScratch.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(src, 0, 0, width, height);
    const d = ctx.getImageData(0, 0, width, height);
    motTex.image.data.set(d.data);
    motTex.needsUpdate = true;
  };

  const copySliceToAtlas = (destTex, z) => {
    const gl = renderer.getContext();
    renderer.initTexture(destTex);
    const destProps = renderer.properties.get(destTex);
    const rtProps = renderer.properties.get(sliceRT);
    gl.bindTexture(gl.TEXTURE_2D, destProps.__webglTexture);
    gl.bindFramebuffer(gl.FRAMEBUFFER, rtProps.__webglFramebuffer);
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, z * height, 0, 0, width, height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  };

  const rebuild = () => {
    const { w, h } = volSize();
    width = w;
    height = h;

    volTex.forEach((t) => t.dispose());
    volTex = [0, 1].map(() => {
      const data = new Uint8Array(w * h * depth * 4);
      data.fill(255);
      const tex = new THREE.DataTexture(data, w, h * depth, THREE.RGBAFormat, THREE.UnsignedByteType);
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
      tex.needsUpdate = true;
      return tex;
    });

    if (imgTex) imgTex.dispose();
    imgTex = makeDataTex(16, 16, palette16());

    if (motTex) motTex.dispose();
    motTex = makeDataTex(width, height, new Uint8Array(width * height * 4).fill(255));

    if (sliceRT) sliceRT.dispose();
    sliceRT = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });

    if (sliceMat) {
      sliceMat.uniforms.dims.value.set(width, height, depth);
      sliceMat.uniforms.buf.value = volTex[0];
      sliceMat.uniforms.img.value = imgTex;
      sliceMat.uniforms.mot.value = motTex;
    }

    if (innerVol) {
      innerVol.material.uniforms.vol.value = volTex[0];
      innerVol.material.uniforms.dims.value.set(width, height, depth);
    }
  };

  const init = () => {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setClearColor(0xffffff, 1);
    mount.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(62, 1, 0.05, 400);
    camera.position.set(0, 2, 10);

    const { w, h } = volSize();
    width = w;
    height = h;

    volTex = [0, 1].map(() => {
      const data = new Uint8Array(w * h * depth * 4);
      data.fill(255);
      const tex = new THREE.DataTexture(data, w, h * depth, THREE.RGBAFormat, THREE.UnsignedByteType);
      tex.minFilter = THREE.NearestFilter;
      tex.magFilter = THREE.NearestFilter;
      tex.needsUpdate = true;
      return tex;
    });

    imgTex = makeDataTex(16, 16, palette16());
    motTex = makeDataTex(width, height, new Uint8Array(width * height * 4).fill(255));

    sliceRT = new THREE.WebGLRenderTarget(width, height, {
      minFilter: THREE.NearestFilter,
      magFilter: THREE.NearestFilter,
      depthBuffer: false,
      stencilBuffer: false,
    });

    sliceMat = new THREE.ShaderMaterial({
      uniforms: {
        buf: { value: volTex[0] },
        img: { value: imgTex },
        mot: { value: motTex },
        time: { value: 0 },
        dims: { value: new THREE.Vector3(width, height, depth) },
        uSlice: { value: 0 },
        doRaster: { value: 1 },
        doSpectrum: { value: 1 },
        specA: { value: specA },
        specB: { value: specB },
        specInk: { value: specInk },
        specAlphaAB: { value: 0.35 },
        specAlphaInk: { value: 0.22 },
        paletteVeil: { value: 0.55 },
      },
      vertexShader: "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }",
      fragmentShader: SLICE_FRAG,
      depthTest: false,
      depthWrite: false,
    });

    sliceScene = new THREE.Scene();
    sliceCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    sliceScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), sliceMat));

    const bx = 26;
    const by = 15;
    const bz = 8;
    const cubeMat = new THREE.ShaderMaterial({
      uniforms: {
        vol: { value: volTex[0] },
        dims: { value: new THREE.Vector3(width, height, depth) },
        boxSize: { value: new THREE.Vector3(bx, by, bz) },
      },
      vertexShader: [
        "varying vec3 vPos; varying vec3 vRayDir;",
        "void main(){ vPos=position; vec4 mv=modelViewMatrix*vec4(position,1.0);",
        "vRayDir=-mv.xyz; gl_Position=projectionMatrix*mv; }",
      ].join("\n"),
      fragmentShader: CUBE_FRAG,
      side: THREE.BackSide,
      depthWrite: false,
    });

    innerVol = new THREE.Mesh(new THREE.BoxGeometry(bx * 2, by * 2, bz * 2), cubeMat);
    innerVol.position.set(0, by * 0.35, -18);
    scene.add(innerVol);

    const resize = () => {
      rebuild();
      const pw = mount.clientWidth || window.innerWidth;
      const ph = mount.clientHeight || window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(pw, ph, false);
      camera.aspect = pw / Math.max(ph, 1);
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener("resize", resize);
    setStatus(`COMPOSE · seed ${seed >>> 0} · offer an image`);
  };

  const render = (timeMs) => {
    const t = timeMs * 0.001;
    sliceMat.uniforms.time.value = t;
    sliceMat.uniforms.doRaster.value = options.doRaster;
    sliceMat.uniforms.doSpectrum.value = options.doSpectrum;

    const volPrev = volId;
    const volCur = volId ^ 1;
    volId = volCur;

    sliceMat.uniforms.buf.value = volTex[volPrev];
    renderer.setRenderTarget(sliceRT);
    for (let z = 0; z < depth; z++) {
      sliceMat.uniforms.uSlice.value = z;
      renderer.render(sliceScene, sliceCam);
      copySliceToAtlas(volTex[volCur], z);
    }
    renderer.setRenderTarget(null);

    innerVol.material.uniforms.vol.value = volTex[volCur];

    const orbit = hasOffer ? 0.22 : 0.08;
    const z = 10 - (hasOffer ? 2.5 : 0);
    const x = Math.sin(t * orbit + seed * 0.001) * (hasOffer ? 3.2 : 1.2);
    const y = 2 + Math.sin(t * 0.31) * 0.6;
    camera.position.set(x, y, z);
    camera.lookAt(x * 0.2, y * 0.5, z - 24);

    renderer.render(scene, camera);
  };

  const start = () => {
    if (running) return;
    running = true;
    const loop = (t) => {
      if (!running) return;
      render(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  };

  const stop = () => {
    running = false;
    if (raf) cancelAnimationFrame(raf);
  };

  const offerImageData = (pixels, label = "") => {
    uploadMot(pixels);
    hasOffer = true;
    offerLabel = label;
    setStatus(label ? `offered · ${label}` : "offered · in GPU only (not stored)");
  };

  const offerFile = async (file, label = "") => {
    const pixels = await imageDataFromFile(file);
    offerImageData(pixels, label || file.name || "upload");
  };

  const capturePng = () => {
    const canvas = renderer?.domElement;
    if (!canvas) return null;
    try {
      return canvas.toDataURL("image/png");
    } catch (_) {
      return null;
    }
  };

  init();
  start();

  return {
    offerFile,
    offerImageData,
    capturePng,
    start,
    stop,
    get hasOffer() {
      return hasOffer;
    },
    get offerLabel() {
      return offerLabel;
    },
  };
}
