import { AURORA_CONFIG, auroraColor } from "./aurora";

type TexPair = {
  read: WebGLFramebuffer;
  write: WebGLFramebuffer;
  readTex: WebGLTexture;
  writeTex: WebGLTexture;
  width: number;
  height: number;
  swap: () => void;
};

const VS = `#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](vec2(-1.0,-1.0), vec2(3.0,-1.0), vec2(-1.0,3.0));
out vec2 vUv;
void main() {
  vec2 p = POS[gl_VertexID];
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FS_ADVECT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 frag;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform float uDt;
uniform float uDissipation;
void main() {
  vec2 vel = texture(uVelocity, vUv).xy;
  vec2 coord = vUv - uDt * vel * vec2(uTexel.y / uTexel.x, 1.0);
  frag = texture(uSource, coord) * uDissipation;
}`;

const FS_DIVERGENCE = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 frag;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main() {
  float L = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).y;
  float T = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vUv.x < uTexel.x) L = -C.x;
  if (vUv.x > 1.0 - uTexel.x) R = -C.x;
  if (vUv.y < uTexel.y) B = -C.y;
  if (vUv.y > 1.0 - uTexel.y) T = -C.y;
  frag = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`;

const FS_PRESSURE = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 frag;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexel;
void main() {
  float L = texture(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  float div = texture(uDivergence, vUv).x;
  frag = vec4((L + R + B + T - div) * 0.25, 0.0, 0.0, 1.0);
}`;

const FS_GRADIENT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 frag;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main() {
  float L = texture(uPressure, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexel.y)).x;
  vec2 vel = texture(uVelocity, vUv).xy;
  vel -= vec2(R - L, T - B) * 0.5;
  frag = vec4(vel, 0.0, 1.0);
}`;

const FS_CURL = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 frag;
uniform sampler2D uVelocity;
uniform vec2 uTexel;
void main() {
  float L = texture(uVelocity, vUv - vec2(uTexel.x, 0.0)).y;
  float R = texture(uVelocity, vUv + vec2(uTexel.x, 0.0)).y;
  float B = texture(uVelocity, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture(uVelocity, vUv + vec2(0.0, uTexel.y)).x;
  frag = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`;

const FS_VORTICITY = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 frag;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexel;
uniform float uDt;
uniform float uCurlForce;
void main() {
  float L = texture(uCurl, vUv - vec2(uTexel.x, 0.0)).x;
  float R = texture(uCurl, vUv + vec2(uTexel.x, 0.0)).x;
  float B = texture(uCurl, vUv - vec2(0.0, uTexel.y)).x;
  float T = texture(uCurl, vUv + vec2(0.0, uTexel.y)).x;
  float C = texture(uCurl, vUv).x;
  vec2 force = vec2(abs(T) - abs(B), abs(R) - abs(L));
  float len = length(force) + 1e-5;
  force = force / len * C * uCurlForce;
  vec2 vel = texture(uVelocity, vUv).xy;
  vel += force * uDt;
  vel *= 0.999;
  frag = vec4(vel, 0.0, 1.0);
}`;

const FS_SPLAT = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 frag;
uniform sampler2D uTarget;
uniform vec2 uPoint;
uniform vec3 uColor;
uniform vec2 uForce;
uniform float uRadius;
uniform float uAspect;
uniform float uAddVelocity;
void main() {
  vec4 base = texture(uTarget, vUv);
  vec2 p = vUv - uPoint;
  p.x *= uAspect;
  vec2 dir = uForce;
  float fl = length(dir);
  vec2 n = fl > 1e-5 ? dir / fl : vec2(1.0, 0.0);
  vec2 t = vec2(-n.y, n.x);
  vec2 local = vec2(dot(p, n) * 0.58, dot(p, t) * 1.35);
  float d2 = dot(local, local);
  float g = exp(-d2 / max(uRadius, 1e-6));
  if (uAddVelocity > 0.5) {
    frag = vec4(base.xy + uForce * g, 0.0, 1.0);
  } else {
    frag = vec4(base.rgb + uColor * g, 1.0);
  }
}`;

const FS_DISPLAY = `#version 300 es
precision highp float;
in vec2 vUv;
out vec4 frag;
uniform sampler2D uDye;
uniform vec2 uTexel;
uniform float uIntensity;
vec3 sampleDye(vec2 uv) {
  return max(texture(uDye, uv).rgb, vec3(0.0));
}
void main() {
  vec3 core = sampleDye(vUv);
  vec3 body = vec3(0.0);
  body += sampleDye(vUv + vec2(uTexel.x * 2.2, 0.0));
  body += sampleDye(vUv - vec2(uTexel.x * 2.2, 0.0));
  body += sampleDye(vUv + vec2(0.0, uTexel.y * 2.2));
  body += sampleDye(vUv - vec2(0.0, uTexel.y * 2.2));
  body += sampleDye(vUv + vec2(uTexel.x * 1.6, uTexel.y * 1.6));
  body += sampleDye(vUv - vec2(uTexel.x * 1.6, uTexel.y * 1.6));
  body *= 0.167;
  vec3 haze = vec3(0.0);
  haze += sampleDye(vUv + vec2(uTexel.x * 7.0, 0.0));
  haze += sampleDye(vUv - vec2(uTexel.x * 7.0, 0.0));
  haze += sampleDye(vUv + vec2(0.0, uTexel.y * 7.0));
  haze += sampleDye(vUv - vec2(0.0, uTexel.y * 7.0));
  haze *= 0.25;
  vec3 col = core * 0.42 + body * 0.4 + haze * 0.55;
  col *= uIntensity;
  float luma = dot(col, vec3(0.22, 0.48, 0.30));
  float alpha = smoothstep(0.0, 0.085, luma) * min(1.0, luma * 2.4);
  frag = vec4(col, alpha);
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) throw new Error("shader");
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(log || "compile");
  }
  return sh;
}

function program(gl: WebGL2RenderingContext, fs: string) {
  const p = gl.createProgram();
  if (!p) throw new Error("program");
  const v = compile(gl, gl.VERTEX_SHADER, VS);
  const f = compile(gl, gl.FRAGMENT_SHADER, fs);
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) || "link");
  }
  return p;
}

function createTexture(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  format: number,
  type: number,
  internal: number,
) {
  const tex = gl.createTexture();
  if (!tex) throw new Error("texture");
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);
  return tex;
}

function createFbo(gl: WebGL2RenderingContext, tex: WebGLTexture) {
  const fbo = gl.createFramebuffer();
  if (!fbo) throw new Error("fbo");
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  return fbo;
}

function pair(
  gl: WebGL2RenderingContext,
  w: number,
  h: number,
  format: number,
  type: number,
  internal: number,
): TexPair {
  const a = createTexture(gl, w, h, format, type, internal);
  const b = createTexture(gl, w, h, format, type, internal);
  const fa = createFbo(gl, a);
  const fb = createFbo(gl, b);
  const p: TexPair = {
    read: fa,
    write: fb,
    readTex: a,
    writeTex: b,
    width: w,
    height: h,
    swap() {
      const t = p.read;
      p.read = p.write;
      p.write = t;
      const tx = p.readTex;
      p.readTex = p.writeTex;
      p.writeTex = tx;
    },
  };
  return p;
}

function clear(gl: WebGL2RenderingContext, fbo: WebGLFramebuffer) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

export function createAuroraFluid(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: "high-performance",
  });
  if (!context) return null;
  const gl: WebGL2RenderingContext = context;

  gl.getExtension("EXT_color_buffer_float");
  gl.getExtension("OES_texture_float_linear");
  gl.getExtension("EXT_float_blend");

  let texType: number = gl.HALF_FLOAT;
  let internal: number = gl.RGBA16F;
  const test = createTexture(gl, 4, 4, gl.RGBA, texType, internal);
  const testFbo = createFbo(gl, test);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.deleteFramebuffer(testFbo);
  gl.deleteTexture(test);
  if (!ok) {
    texType = gl.UNSIGNED_BYTE;
    internal = gl.RGBA;
  }

  const programs = {
    advect: program(gl, FS_ADVECT),
    divergence: program(gl, FS_DIVERGENCE),
    pressure: program(gl, FS_PRESSURE),
    gradient: program(gl, FS_GRADIENT),
    curl: program(gl, FS_CURL),
    vorticity: program(gl, FS_VORTICITY),
    splat: program(gl, FS_SPLAT),
    display: program(gl, FS_DISPLAY),
  };

  const loc = (p: WebGLProgram, name: string) => gl.getUniformLocation(p, name);

  let simW = 1;
  let simH = 1;
  let velocity!: TexPair;
  let dye!: TexPair;
  let pressure!: TexPair;
  let divergenceTex!: WebGLTexture;
  let divergenceFbo!: WebGLFramebuffer;
  let curlTex!: WebGLTexture;
  let curlFbo!: WebGLFramebuffer;

  const lowPower =
    (navigator.hardwareConcurrency ?? 8) <= 4 ||
    Boolean((navigator as Navigator & { deviceMemory?: number }).deviceMemory &&
      (navigator as Navigator & { deviceMemory?: number }).deviceMemory! <= 4);

  function alloc(w: number, h: number) {
    velocity = pair(gl, w, h, gl.RGBA, texType, internal);
    dye = pair(gl, w, h, gl.RGBA, texType, internal);
    pressure = pair(gl, w, h, gl.RGBA, texType, internal);
    divergenceTex = createTexture(gl, w, h, gl.RGBA, texType, internal);
    divergenceFbo = createFbo(gl, divergenceTex);
    curlTex = createTexture(gl, w, h, gl.RGBA, texType, internal);
    curlFbo = createFbo(gl, curlTex);
    clear(gl, velocity.read);
    clear(gl, velocity.write);
    clear(gl, dye.read);
    clear(gl, dye.write);
    clear(gl, pressure.read);
    clear(gl, pressure.write);
    clear(gl, divergenceFbo);
    clear(gl, curlFbo);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, AURORA_CONFIG.maxDpr);
    const cssW = window.innerWidth;
    const cssH = window.innerHeight;
    const dw = Math.max(1, Math.floor(cssW * dpr));
    const dh = Math.max(1, Math.floor(cssH * dpr));
    if (canvas.width !== dw || canvas.height !== dh) {
      canvas.width = dw;
      canvas.height = dh;
    }
    const scale = lowPower ? AURORA_CONFIG.simScale * 0.62 : AURORA_CONFIG.simScale;
    const nw = Math.max(96, Math.floor(cssW * scale));
    const nh = Math.max(54, Math.floor(cssH * scale));
    if (nw === simW && nh === simH && velocity) return;
    simW = nw;
    simH = nh;
    alloc(simW, simH);
  }

  resize();

  const blit = () => gl.drawArrays(gl.TRIANGLES, 0, 3);

  function bind(p: WebGLProgram) {
    gl.useProgram(p);
  }

  function setTex(unit: number, tex: WebGLTexture, locName: WebGLUniformLocation | null) {
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.uniform1i(locName, unit);
  }

  const mouse = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, tx: 0.5, ty: 0.5, vx: 0, vy: 0, inside: false };
  let primed = false;
  let activity = 0;
  let raf = 0;
  let last = performance.now();
  let running = true;
  let hidden = document.hidden;

  function splat(x: number, y: number, dx: number, dy: number, speed: number) {
    const aspect = canvas.width / Math.max(1, canvas.height);
    const radius =
      AURORA_CONFIG.splatRadius * (0.85 + Math.min(speed * 28, 3.2)) * AURORA_CONFIG.cursorInfluence;
    const forceScale = AURORA_CONFIG.splatForce * (0.35 + Math.min(speed * 18, 2.6));
    const color = auroraColor(performance.now() * 0.001);
    const jitter = (Math.random() - 0.5) * 0.12;
    const dyeBoost = AURORA_CONFIG.intensity * (0.55 + Math.min(speed * 14, 1.8));

    bind(programs.splat);
    gl.viewport(0, 0, simW, simH);
    gl.uniform2f(loc(programs.splat, "uPoint"), x, y);
    gl.uniform2f(loc(programs.splat, "uForce"), dx * forceScale, dy * forceScale);
    gl.uniform1f(loc(programs.splat, "uRadius"), radius);
    gl.uniform1f(loc(programs.splat, "uAspect"), aspect);
    gl.uniform1f(loc(programs.splat, "uAddVelocity"), 1);
    gl.uniform3f(loc(programs.splat, "uColor"), 0, 0, 0);
    setTex(0, velocity.readTex, loc(programs.splat, "uTarget"));
    gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write);
    blit();
    velocity.swap();

    gl.uniform1f(loc(programs.splat, "uAddVelocity"), 0);
    gl.uniform3f(
      loc(programs.splat, "uColor"),
      color[0] * dyeBoost,
      color[1] * dyeBoost,
      color[2] * dyeBoost + jitter * 0.08,
    );
    setTex(0, dye.readTex, loc(programs.splat, "uTarget"));
    gl.bindFramebuffer(gl.FRAMEBUFFER, dye.write);
    blit();
    dye.swap();
  }

  function step(dt: number) {
    const texelX = 1 / simW;
    const texelY = 1 / simH;
    gl.viewport(0, 0, simW, simH);

    bind(programs.curl);
    gl.uniform2f(loc(programs.curl, "uTexel"), texelX, texelY);
    setTex(0, velocity.readTex, loc(programs.curl, "uVelocity"));
    gl.bindFramebuffer(gl.FRAMEBUFFER, curlFbo);
    blit();

    bind(programs.vorticity);
    gl.uniform2f(loc(programs.vorticity, "uTexel"), texelX, texelY);
    gl.uniform1f(loc(programs.vorticity, "uDt"), dt);
    gl.uniform1f(loc(programs.vorticity, "uCurlForce"), AURORA_CONFIG.turbulence);
    setTex(0, velocity.readTex, loc(programs.vorticity, "uVelocity"));
    setTex(1, curlTex, loc(programs.vorticity, "uCurl"));
    gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write);
    blit();
    velocity.swap();

    bind(programs.advect);
    gl.uniform2f(loc(programs.advect, "uTexel"), texelX, texelY);
    gl.uniform1f(loc(programs.advect, "uDt"), dt);
    gl.uniform1f(loc(programs.advect, "uDissipation"), AURORA_CONFIG.viscosity);
    setTex(0, velocity.readTex, loc(programs.advect, "uVelocity"));
    setTex(1, velocity.readTex, loc(programs.advect, "uSource"));
    gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write);
    blit();
    velocity.swap();

    bind(programs.divergence);
    gl.uniform2f(loc(programs.divergence, "uTexel"), texelX, texelY);
    setTex(0, velocity.readTex, loc(programs.divergence, "uVelocity"));
    gl.bindFramebuffer(gl.FRAMEBUFFER, divergenceFbo);
    blit();

    clear(gl, pressure.read);
    bind(programs.pressure);
    gl.uniform2f(loc(programs.pressure, "uTexel"), texelX, texelY);
    setTex(1, divergenceTex, loc(programs.pressure, "uDivergence"));
    const iters = lowPower ? 8 : AURORA_CONFIG.pressureIters;
    for (let i = 0; i < iters; i++) {
      setTex(0, pressure.readTex, loc(programs.pressure, "uPressure"));
      gl.bindFramebuffer(gl.FRAMEBUFFER, pressure.write);
      blit();
      pressure.swap();
    }

    bind(programs.gradient);
    gl.uniform2f(loc(programs.gradient, "uTexel"), texelX, texelY);
    setTex(0, pressure.readTex, loc(programs.gradient, "uPressure"));
    setTex(1, velocity.readTex, loc(programs.gradient, "uVelocity"));
    gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.write);
    blit();
    velocity.swap();

    bind(programs.advect);
    gl.uniform2f(loc(programs.advect, "uTexel"), texelX, texelY);
    gl.uniform1f(loc(programs.advect, "uDt"), dt);
    gl.uniform1f(loc(programs.advect, "uDissipation"), AURORA_CONFIG.decay * AURORA_CONFIG.diffusion);
    setTex(0, velocity.readTex, loc(programs.advect, "uVelocity"));
    setTex(1, dye.readTex, loc(programs.advect, "uSource"));
    gl.bindFramebuffer(gl.FRAMEBUFFER, dye.write);
    blit();
    dye.swap();
  }

  function draw() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    bind(programs.display);
    gl.uniform2f(loc(programs.display, "uTexel"), 1 / simW, 1 / simH);
    gl.uniform1f(loc(programs.display, "uIntensity"), AURORA_CONFIG.intensity);
    setTex(0, dye.readTex, loc(programs.display, "uDye"));
    blit();
  }

  function frame(now: number) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (hidden) return;
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;

    const lerp = AURORA_CONFIG.mouseLerp;
    mouse.px = mouse.x;
    mouse.py = mouse.y;
    mouse.x += (mouse.tx - mouse.x) * lerp;
    mouse.y += (mouse.ty - mouse.y) * lerp;
    mouse.vx = mouse.x - mouse.px;
    mouse.vy = mouse.y - mouse.py;
    const speed = Math.hypot(mouse.vx, mouse.vy);

    if (mouse.inside && speed > 0.00018) {
      splat(mouse.x, mouse.y, mouse.vx, mouse.vy, speed);
      activity = Math.min(3, activity + speed * 18 + 0.08);
    } else {
      activity *= 0.94;
    }

    if (activity < 0.004) {
      if (activity > 0.0004) draw();
      return;
    }

    step(dt * 7.2);
    draw();
  }

  const onMove = (e: PointerEvent) => {
    mouse.tx = e.clientX / Math.max(1, window.innerWidth);
    mouse.ty = 1 - e.clientY / Math.max(1, window.innerHeight);
    if (!primed) {
      mouse.x = mouse.tx;
      mouse.y = mouse.ty;
      mouse.px = mouse.tx;
      mouse.py = mouse.ty;
      primed = true;
    }
    mouse.inside = true;
    activity = Math.max(activity, 0.2);
  };
  const onLeave = () => {
    mouse.inside = false;
  };
  const onResize = () => resize();
  const onVis = () => {
    hidden = document.hidden;
    if (!hidden) last = performance.now();
  };

  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("mouseleave", onLeave);
  window.addEventListener("blur", onLeave);
  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("visibilitychange", onVis);
  raf = requestAnimationFrame(frame);

  return {
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      Object.values(programs).forEach((p) => gl.deleteProgram(p));
      const lose = gl.getExtension("WEBGL_lose_context");
      lose?.loseContext();
    },
  };
}
