export const AURORA_CONFIG = {
  enabled: true,
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1024,
  DYE_RESOLUTION_MOBILE: 512,
  DENSITY_DISSIPATION: 2.6,
  VELOCITY_DISSIPATION: 1.6,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 20,
  CURL: 32,
  SPLAT_RADIUS: 0.22,
  SPLAT_RADIUS_MOBILE: 0.32,
  SPLAT_FORCE: 5200,
  COLOR_CYCLE: 0.18,
} as const;

const PALETTE_HUES = [262, 217, 189, 330, 160, 43];

function hsvToRgb(h: number, s: number, v: number) {
  h = ((h % 360) + 360) % 360 / 360;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const table = [
    [v, t, p],
    [q, v, p],
    [p, v, t],
    [p, q, v],
    [t, p, v],
    [v, p, q],
  ][i % 6];
  return { r: table[0], g: table[1], b: table[2] };
}

export function generateAuroraColor() {
  const hue = PALETTE_HUES[Math.floor(Math.random() * PALETTE_HUES.length)] + (Math.random() * 18 - 9);
  const c = hsvToRgb(hue, 0.75, 1);
  return { r: c.r * 0.22, g: c.g * 0.22, b: c.b * 0.22 };
}

export function isAuroraMobile() {
  return /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
}
