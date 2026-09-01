// @ts-nocheck
import { AURORA_CONFIG, generateAuroraColor, isAuroraMobile } from "./aurora";

type FBO = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  attach: (id: number) => number;
};

type DoubleFBO = {
  width: number;
  height: number;
  read: FBO;
  write: FBO;
  swap: () => void;
};

type Program = {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
  bind: () => void;
};

const VS = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv;
out vec2 vL;
out vec2 vR;
out vec2 vT;
out vec2 vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const SHADERS = {
  copy: `
    precision mediump float;
    in highp vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uTexture;
    void main () { fragColor = texture(uTexture, vUv); }`,
  clear: `
    precision mediump float;
    in highp vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uTexture;
    uniform float value;
    void main () { fragColor = value * texture(uTexture, vUv); }`,
  splat: `
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main () {
      vec2 p = vUv - point.xy;
      p.x *= aspectRatio;
      vec3 splat = exp(-dot(p, p) / radius) * color;
      vec3 base = texture(uTarget, vUv).xyz;
      fragColor = vec4(base + splat, 1.0);
    }`,
  advection: `
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform float dt;
    uniform float dissipation;
    void main () {
      vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
      vec4 result = texture(uSource, coord);
      float decay = 1.0 + dissipation * dt;
      fragColor = result / decay;
    }`,
  divergence: `
    precision mediump float;
    in highp vec2 vUv;
    in highp vec2 vL;
    in highp vec2 vR;
    in highp vec2 vT;
    in highp vec2 vB;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture(uVelocity, vL).x;
      float R = texture(uVelocity, vR).x;
      float T = texture(uVelocity, vT).y;
      float B = texture(uVelocity, vB).y;
      vec2 C = texture(uVelocity, vUv).xy;
      if (vL.x < 0.0) { L = -C.x; }
      if (vR.x > 1.0) { R = -C.x; }
      if (vT.y > 1.0) { T = -C.y; }
      if (vB.y < 0.0) { B = -C.y; }
      float div = 0.5 * (R - L + T - B);
      fragColor = vec4(div, 0.0, 0.0, 1.0);
    }`,
  curl: `
    precision mediump float;
    in highp vec2 vUv;
    in highp vec2 vL;
    in highp vec2 vR;
    in highp vec2 vT;
    in highp vec2 vB;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture(uVelocity, vL).y;
      float R = texture(uVelocity, vR).y;
      float T = texture(uVelocity, vT).x;
      float B = texture(uVelocity, vB).x;
      float vorticity = R - L - T + B;
      fragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }`,
  vorticity: `
    precision highp float;
    in vec2 vUv;
    in vec2 vL;
    in vec2 vR;
    in vec2 vT;
    in vec2 vB;
    out vec4 fragColor;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main () {
      float L = texture(uCurl, vL).x;
      float R = texture(uCurl, vR).x;
      float T = texture(uCurl, vT).x;
      float B = texture(uCurl, vB).x;
      float C = texture(uCurl, vUv).x;
      vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
      force /= length(force) + 0.0001;
      force *= curl * C;
      force.y *= -1.0;
      vec2 vel = texture(uVelocity, vUv).xy;
      fragColor = vec4(vel + force * dt, 0.0, 1.0);
    }`,
  pressure: `
    precision mediump float;
    in highp vec2 vUv;
    in highp vec2 vL;
    in highp vec2 vR;
    in highp vec2 vT;
    in highp vec2 vB;
    out vec4 fragColor;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main () {
      float L = texture(uPressure, vL).x;
      float R = texture(uPressure, vR).x;
      float T = texture(uPressure, vT).x;
      float B = texture(uPressure, vB).x;
      float divergence = texture(uDivergence, vUv).x;
      float pressure = (L + R + B + T - divergence) * 0.25;
      fragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }`,
  gradient: `
    precision mediump float;
    in highp vec2 vUv;
    in highp vec2 vL;
    in highp vec2 vR;
    in highp vec2 vT;
    in highp vec2 vB;
    out vec4 fragColor;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main () {
      float L = texture(uPressure, vL).x;
      float R = texture(uPressure, vR).x;
      float T = texture(uPressure, vT).x;
      float B = texture(uPressure, vB).x;
      vec2 velocity = texture(uVelocity, vUv).xy;
      velocity.xy -= vec2(R - L, T - B);
      fragColor = vec4(velocity, 0.0, 1.0);
    }`,
  display: `
    precision highp float;
    in vec2 vUv;
    out vec4 fragColor;
    uniform sampler2D uTexture;
    void main () {
      vec3 c = texture(uTexture, vUv).rgb;
      float a = max(c.r, max(c.g, c.b));
      fragColor = vec4(c, a);
    }`,
};

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("shader");
  const src = type === gl.FRAGMENT_SHADER ? `#version 300 es\n${source}` : source;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "compile");
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vs: WebGLShader, fsSource: string): Program {
  const program = gl.createProgram();
  if (!program) throw new Error("program");
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSource);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.bindAttribLocation(program, 0, "aPosition");
  gl.linkProgram(program);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || "link");
  }
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i);
    if (!info) continue;
    uniforms[info.name] = gl.getUniformLocation(program, info.name);
  }
  return {
    program,
    uniforms,
    bind() {
      gl.useProgram(program);
    },
  };
}

export function createAuroraFluid(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    depth: false,
    stencil: false,
    antialias: false,
    preserveDrawingBuffer: false,
    premultipliedAlpha: true,
  });
  if (!gl) return null;

  gl.getExtension("EXT_color_buffer_float");
  const linear = gl.getExtension("OES_texture_float_linear");
  gl.clearColor(0, 0, 0, 0);

  const mobile = isAuroraMobile();
  const config = {
    SIM_RESOLUTION: AURORA_CONFIG.SIM_RESOLUTION,
    DYE_RESOLUTION: mobile ? AURORA_CONFIG.DYE_RESOLUTION_MOBILE : AURORA_CONFIG.DYE_RESOLUTION,
    DENSITY_DISSIPATION: AURORA_CONFIG.DENSITY_DISSIPATION,
    VELOCITY_DISSIPATION: AURORA_CONFIG.VELOCITY_DISSIPATION,
    PRESSURE: AURORA_CONFIG.PRESSURE,
    PRESSURE_ITERATIONS: mobile ? 12 : AURORA_CONFIG.PRESSURE_ITERATIONS,
    CURL: AURORA_CONFIG.CURL,
    SPLAT_RADIUS: mobile ? AURORA_CONFIG.SPLAT_RADIUS_MOBILE : AURORA_CONFIG.SPLAT_RADIUS,
    SPLAT_FORCE: AURORA_CONFIG.SPLAT_FORCE,
  };

  const vs = compile(gl, gl.VERTEX_SHADER, VS);
  const copyProgram = createProgram(gl, vs, SHADERS.copy);
  const clearProgram = createProgram(gl, vs, SHADERS.clear);
  const splatProgram = createProgram(gl, vs, SHADERS.splat);
  const advectionProgram = createProgram(gl, vs, SHADERS.advection);
  const divergenceProgram = createProgram(gl, vs, SHADERS.divergence);
  const curlProgram = createProgram(gl, vs, SHADERS.curl);
  const vorticityProgram = createProgram(gl, vs, SHADERS.vorticity);
  const pressureProgram = createProgram(gl, vs, SHADERS.pressure);
  const gradientProgram = createProgram(gl, vs, SHADERS.gradient);
  const displayProgram = createProgram(gl, vs, SHADERS.display);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
  const elementBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);

  const filtering = linear ? gl.LINEAR : gl.NEAREST;
  const texType = gl.HALF_FLOAT;

  function supportFormat(internalFormat: number, format: number, type: number) {
    const texture = gl.createTexture();
    if (!texture) return false;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    if (!fbo) return false;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    gl.deleteFramebuffer(fbo);
    gl.deleteTexture(texture);
    return ok;
  }

  function pickFormat(internalFormat: number, format: number): { internalFormat: number; format: number } {
    if (supportFormat(internalFormat, format, texType)) return { internalFormat, format };
    if (internalFormat === gl.R16F) return pickFormat(gl.RG16F, gl.RG);
    if (internalFormat === gl.RG16F) return pickFormat(gl.RGBA16F, gl.RGBA);
    return { internalFormat: gl.RGBA16F, format: gl.RGBA };
  }

  const formatRGBA = pickFormat(gl.RGBA16F, gl.RGBA);
  const formatRG = pickFormat(gl.RG16F, gl.RG);
  const formatR = pickFormat(gl.R16F, gl.RED);

  function createFBO(w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO {
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    if (!texture) throw new Error("texture");
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);
    const fbo = gl.createFramebuffer();
    if (!fbo) throw new Error("fbo");
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return {
      texture,
      fbo,
      width: w,
      height: h,
      attach(id: number) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  function createDoubleFBO(
    w: number,
    h: number,
    internalFormat: number,
    format: number,
    type: number,
    param: number,
  ): DoubleFBO {
    let fbo1 = createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = createFBO(w, h, internalFormat, format, type, param);
    return {
      width: w,
      height: h,
      get read() {
        return fbo1;
      },
      set read(value) {
        fbo1 = value;
      },
      get write() {
        return fbo2;
      },
      set write(value) {
        fbo2 = value;
      },
      swap() {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      },
    };
  }

  function getResolution(resolution: number) {
    let aspect = gl.drawingBufferWidth / Math.max(1, gl.drawingBufferHeight);
    if (aspect < 1) aspect = 1 / aspect;
    const min = Math.round(resolution);
    const max = Math.round(resolution * aspect);
    return gl.drawingBufferWidth > gl.drawingBufferHeight
      ? { width: max, height: min }
      : { width: min, height: max };
  }

  let dye!: DoubleFBO;
  let velocity!: DoubleFBO;
  let divergence!: FBO;
  let curl!: FBO;
  let pressure!: DoubleFBO;

  function initFramebuffers() {
    const simRes = getResolution(config.SIM_RESOLUTION);
    const dyeRes = getResolution(config.DYE_RESOLUTION);
    gl.disable(gl.BLEND);
    dye = createDoubleFBO(dyeRes.width, dyeRes.height, formatRGBA.internalFormat, formatRGBA.format, texType, filtering);
    velocity = createDoubleFBO(simRes.width, simRes.height, formatRG.internalFormat, formatRG.format, texType, filtering);
    divergence = createFBO(simRes.width, simRes.height, formatR.internalFormat, formatR.format, texType, gl.NEAREST);
    curl = createFBO(simRes.width, simRes.height, formatR.internalFormat, formatR.format, texType, gl.NEAREST);
    pressure = createDoubleFBO(simRes.width, simRes.height, formatR.internalFormat, formatR.format, texType, gl.NEAREST);
  }

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(window.innerWidth * dpr);
    const h = Math.round(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      return true;
    }
    return false;
  }

  function blit(target: FBO | null) {
    if (!target) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    }
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  resizeCanvas();
  initFramebuffers();

  function correctRadius(radius: number) {
    const aspect = canvas.width / canvas.height;
    return aspect > 1 ? radius * aspect : radius;
  }

  function splat(x: number, y: number, dx: number, dy: number, color: { r: number; g: number; b: number }) {
    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(splatProgram.uniforms.point, x, y);
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0);
    gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100));
    blit(velocity.write);
    velocity.swap();

    gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
    gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
    blit(dye.write);
    dye.swap();
  }

  function step(dt: number) {
    gl.disable(gl.BLEND);

    curlProgram.bind();
    gl.uniform2f(curlProgram.uniforms.texelSize, 1 / velocity.width, 1 / velocity.height);
    gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    vorticityProgram.bind();
    gl.uniform2f(vorticityProgram.uniforms.texelSize, 1 / velocity.width, 1 / velocity.height);
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
    gl.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    divergenceProgram.bind();
    gl.uniform2f(divergenceProgram.uniforms.texelSize, 1 / velocity.width, 1 / velocity.height);
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    clearProgram.bind();
    gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    pressureProgram.bind();
    gl.uniform2f(pressureProgram.uniforms.texelSize, 1 / velocity.width, 1 / velocity.height);
    gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
      blit(pressure.write);
      pressure.swap();
    }

    gradientProgram.bind();
    gl.uniform2f(gradientProgram.uniforms.texelSize, 1 / velocity.width, 1 / velocity.height);
    gl.uniform1i(gradientProgram.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(gradientProgram.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    advectionProgram.bind();
    gl.uniform2f(advectionProgram.uniforms.texelSize, 1 / velocity.width, 1 / velocity.height);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(0));
    gl.uniform1f(advectionProgram.uniforms.dt, dt);
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    gl.uniform2f(advectionProgram.uniforms.texelSize, 1 / dye.width, 1 / dye.height);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
    blit(dye.write);
    dye.swap();
  }

  function render() {
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    displayProgram.bind();
    gl.uniform1i(displayProgram.uniforms.uTexture, dye.read.attach(0));
    blit(null);
  }

  const pointer = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    down: false,
    moved: false,
    color: generateAuroraColor(),
  };

  function pointerPos(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / Math.max(1, rect.width)),
      y: (clientY - rect.top) * (canvas.height / Math.max(1, rect.height)),
    };
  }

  function updatePointerDown(x: number, y: number) {
    pointer.down = true;
    pointer.moved = false;
    pointer.x = x / canvas.width;
    pointer.y = 1 - y / canvas.height;
    pointer.dx = 0;
    pointer.dy = 0;
    pointer.color = generateAuroraColor();
  }

  function updatePointerMove(x: number, y: number) {
    pointer.moved = pointer.down;
    const texX = x / canvas.width;
    const texY = 1 - y / canvas.height;
    const aspect = canvas.width / canvas.height > 1 ? canvas.width / canvas.height : 1;
    pointer.dx = (texX - pointer.x) * 5 * aspect;
    pointer.dy = (texY - pointer.y) * 5;
    pointer.x = texX;
    pointer.y = texY;
  }

  const onMouseMove = (e: MouseEvent) => {
    const wasDown = pointer.down;
    pointer.down = true;
    const { x, y } = pointerPos(e.clientX, e.clientY);
    if (!wasDown) updatePointerDown(x, y);
    else updatePointerMove(x, y);
  };

  const onTouchStart = (e: TouchEvent) => {
    const t = e.targetTouches[0];
    if (!t) return;
    const { x, y } = pointerPos(t.clientX, t.clientY);
    updatePointerDown(x, y);
  };

  const onTouchMove = (e: TouchEvent) => {
    const t = e.targetTouches[0];
    if (!t) return;
    const { x, y } = pointerPos(t.clientX, t.clientY);
    updatePointerMove(x, y);
  };

  const onTouchEnd = () => {
    pointer.down = false;
  };

  const onResize = () => {
    if (resizeCanvas()) initFramebuffers();
  };

  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("resize", onResize);

  let lastTime = Date.now();
  let colorTimer = 0;
  let raf = 0;
  let running = true;

  function splatPointer() {
    splat(
      pointer.x,
      pointer.y,
      pointer.dx * config.SPLAT_FORCE,
      pointer.dy * config.SPLAT_FORCE,
      pointer.color,
    );
  }

  function introSplats() {
    for (let i = 0; i < 4; i++) {
      splat(
        0.3 + Math.random() * 0.4,
        0.3 + Math.random() * 0.4,
        (Math.random() - 0.5) * 800,
        (Math.random() - 0.5) * 800,
        generateAuroraColor(),
      );
    }
  }

  function updateFrame() {
    if (!running) return;
    const now = Date.now();
    let dt = (now - lastTime) / 1000;
    dt = Math.min(dt, 0.0166667 * 2);
    lastTime = now;

    if (resizeCanvas()) initFramebuffers();

    colorTimer += dt;
    if (colorTimer > AURORA_CONFIG.COLOR_CYCLE) {
      colorTimer = 0;
      pointer.color = generateAuroraColor();
    }

    if (pointer.moved) {
      pointer.moved = false;
      splatPointer();
    }

    step(dt);
    render();
    raf = requestAnimationFrame(updateFrame);
  }

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    introSplats();
  }
  raf = requestAnimationFrame(updateFrame);

  return {
    destroy() {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", onResize);
      [
        copyProgram,
        clearProgram,
        splatProgram,
        advectionProgram,
        divergenceProgram,
        curlProgram,
        vorticityProgram,
        pressureProgram,
        gradientProgram,
        displayProgram,
      ].forEach((p) => gl.deleteProgram(p.program));
      gl.deleteShader(vs);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
