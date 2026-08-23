export const AURORA_CONFIG = {
  enabled: true,
  intensity: 0.68,
  viscosity: 0.918,
  diffusion: 0.965,
  decay: 0.986,
  turbulence: 0.38,
  cursorInfluence: 1,
  colorSpeed: 0.14,
  maxDpr: 1.35,
  simScale: 0.4,
  pressureIters: 14,
  splatForce: 42,
  splatRadius: 0.00028,
  mouseLerp: 0.11,
} as const;

export type AuroraConfig = typeof AURORA_CONFIG;

export function auroraColor(time: number): [number, number, number] {
  const t = ((time * AURORA_CONFIG.colorSpeed) % 1 + 1) % 1;
  const stops: [number, number, number][] = [
    [0.08, 0.72, 0.38],
    [0.12, 0.88, 0.74],
    [0.22, 0.78, 0.96],
    [0.28, 0.42, 0.98],
    [0.52, 0.28, 0.92],
    [0.78, 0.22, 0.62],
    [0.55, 0.78, 0.28],
  ];
  const scaled = t * (stops.length - 1);
  const i = Math.floor(scaled);
  const f = scaled - i;
  const a = stops[i];
  const b = stops[Math.min(i + 1, stops.length - 1)];
  return [
    a[0] + (b[0] - a[0]) * f,
    a[1] + (b[1] - a[1]) * f,
    a[2] + (b[2] - a[2]) * f,
  ];
}
