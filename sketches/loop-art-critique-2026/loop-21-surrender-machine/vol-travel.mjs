/**
 * RGB → XYZ forward travel segment (new file; vol3d lineage, not a copy of the full sketch).
 */
import * as THREE from "three";

const PAL = {
  pink: [255, 16, 240],
  yellow: [255, 244, 0],
  orange: [255, 120, 0],
  skyBlue: [199, 225, 250],
  white: [255, 255, 255],
};

export function createVolTravel({ seed = 210021, onComplete, durationMs = 16000 } = {}) {
  let renderer = null;
  let scene = null;
  let camera = null;
  let raf = 0;
  let running = false;
  let startT = 0;
  let motCanvas = null;
  let motCtx = null;
  let motTex = null;
  let innerVol = null;
  let volData = null;
  let volTex = null;
  const depth = 24;
  let w = 64;
  let h = 64;

  const makeRng = (s) => {
    let state = s >>> 0;
    return {
      random() {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      },
      uniform(a, b) { return a + this.random() * (b - a); },
      randint(a, b) { return a + Math.floor(this.random() * (b - a + 1)); },
    };
  };

  const rng = makeRng((seed ^ 0x210021) >>> 0);
  const grid = 8 + rng.randint(0, 1) * 8;

  const initGpu = () => {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setClearColor(0xffffff, 1);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(68, 1, 0.05, 400);
    camera.position.set(0, 2, 8);
    camera.lookAt(0, 1, -40);

    motCanvas = document.createElement("canvas");
    motCtx = motCanvas.getContext("2d");
    motTex = new THREE.CanvasTexture(motCanvas);
    motTex.minFilter = THREE.NearestFilter;
    motTex.magFilter = THREE.NearestFilter;

    w = 96 + rng.randint(0, 48);
    h = 64 + rng.randint(0, 32);
    motCanvas.width = w;
    motCanvas.height = h;
    volData = new Uint8Array(w * h * depth * 4);
    for (let i = 0; i < volData.length; i += 4) {
      volData[i] = 255;
      volData[i + 1] = 255;
      volData[i + 2] = 255;
      volData[i + 3] = 255;
    }
    volTex = new THREE.DataTexture(volData, w, h * depth, THREE.RGBAFormat, THREE.UnsignedByteType);
    volTex.minFilter = THREE.NearestFilter;
    volTex.magFilter = THREE.NearestFilter;
    volTex.needsUpdate = true;

    const bx = 28 + rng.uniform(0, 18);
    const by = 16 + rng.uniform(0, 10);
    const bz = 8 + rng.uniform(0, 6);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        vol: { value: volTex },
        dims: { value: new THREE.Vector3(w, h, depth) },
        boxSize: { value: new THREE.Vector3(bx, by, bz) },
      },
      vertexShader: [
        "varying vec3 vPos; varying vec3 vRayDir;",
        "void main(){ vPos=position; vec4 mv=modelViewMatrix*vec4(position,1.0);",
        "vRayDir=-mv.xyz; gl_Position=projectionMatrix*mv; }",
      ].join("\n"),
      fragmentShader: [
        "precision highp float;",
        "uniform sampler2D vol; uniform vec3 dims; uniform vec3 boxSize;",
        "varying vec3 vPos; varying vec3 vRayDir;",
        "vec2 atlasUV(vec2 uv,float z){return vec2(uv.x,(z+uv.y)/dims.z);}",
        "vec3 sampleVol(vec3 p){vec3 q=clamp(p,0.001,0.999);float z=q.z*(dims.z-1.0);",
        "return texture2D(vol,atlasUV(q.xy,z)).rgb;}",
        "void main(){",
        "vec3 ro=vPos; vec3 rd=normalize(vRayDir); vec3 inv=1.0/max(abs(rd),1e-4);",
        "vec3 t0=(-boxSize-ro)*inv; vec3 t1=(boxSize-ro)*inv;",
        "vec3 tmin=min(t0,t1); vec3 tmax=max(t0,t1);",
        "float ta=max(max(tmin.x,tmin.y),tmin.z); float tb=min(min(tmax.x,tmax.y),tmax.z);",
        "if(tb<max(ta,0.0)){gl_FragColor=vec4(1.0);return;}",
        "float tStart=max(ta,0.0); vec3 col=vec3(1.0);",
        "for(float i=0.0;i<40.0;i++){",
        "float t=tStart+(tb-tStart)*(i+0.5)/40.0;",
        "vec3 p=(ro+rd*t)/(boxSize*2.0)+0.5;",
        "if(any(lessThan(p,vec3(0.0)))||any(greaterThan(p,vec3(1.0))))continue;",
        "vec3 s=sampleVol(p); float ink=length(s-vec3(1.0));",
        "float a=clamp(0.06+ink*0.55,0.0,0.92); col=mix(col,s,a);",
        "} gl_FragColor=vec4(col,1.0);}",
      ].join("\n"),
      side: THREE.BackSide,
      depthWrite: false,
    });

    innerVol = new THREE.Mesh(new THREE.BoxGeometry(bx * 2, by * 2, bz * 2), mat);
    innerVol.position.set(0, by * 0.35, -20 - rng.uniform(0, 12));
    scene.add(innerVol);
  };

  const drawMot = (t) => {
    const ctx = motCtx;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    const nScan = 3 + Math.floor((t * 0.001) % 4);
    for (let i = 0; i < nScan; i++) {
      const x = (Math.sin(t * 0.0012 + i * 1.7) * 0.5 + 0.5) * (w - grid);
      ctx.fillStyle = `rgb(0,${120 + i * 30},0)`;
      ctx.fillRect(x, 0, grid, h);
    }
    const cols = [PAL.pink, PAL.yellow, PAL.orange, PAL.skyBlue];
    for (let i = 0; i < 12; i++) {
      const c = cols[i % 4];
      const px = (Math.sin(t * 0.0007 + i * 2.1) * 0.5 + 0.5) * (w - grid);
      const py = (Math.cos(t * 0.0009 + i * 1.3) * 0.5 + 0.5) * (h - grid);
      ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      ctx.fillRect(px, py, grid, grid);
    }
    for (let z = 0; z < depth; z++) {
      const slice = ctx.getImageData(0, 0, w, h);
      const off = z * w * h * 4;
      volData.set(slice.data, off);
    }
    volTex.needsUpdate = true;
  };

  const resize = () => {
    if (!renderer || !camera) return;
    const pw = window.innerWidth;
    const ph = window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(pw, ph);
    camera.aspect = pw / Math.max(ph, 1);
    camera.updateProjectionMatrix();
  };

  const frame = (t) => {
    if (!running) return;
    if (!startT) startT = t;
    const k = Math.min(1, (t - startT) / durationMs);
    drawMot(t);

    const z = 8 - k * 72;
    const y = 2 + Math.sin(k * Math.PI * 2.1) * 1.2;
    const x = Math.sin(k * Math.PI * 1.3 + seed * 0.001) * 4;
    camera.position.set(x, y, z);
    camera.lookAt(x * 0.3, y * 0.6, z - 30);

    renderer.render(scene, camera);
    if (k >= 1) {
      running = false;
      cancelAnimationFrame(raf);
      onComplete?.();
      return;
    }
    raf = requestAnimationFrame(frame);
  };

  return {
    mount() {
      if (renderer) return;
      initGpu();
      resize();
      window.addEventListener("resize", resize);
    },
    start() {
      if (!renderer) this.mount();
      running = true;
      startT = 0;
      raf = requestAnimationFrame(frame);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    dispose() {
      this.stop();
      window.removeEventListener("resize", resize);
      renderer?.domElement?.remove();
      volTex?.dispose();
      innerVol?.geometry?.dispose();
      innerVol?.material?.dispose();
      renderer?.dispose();
      renderer = scene = camera = null;
    },
    getCanvas: () => renderer?.domElement ?? null,
  };
}
