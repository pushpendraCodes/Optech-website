export const FRAME_COUNT = 169;

export const framePath = (n: number) =>
  `/frames/frame_${String(n).padStart(4, "0")}.jpg`;

export type Dialogue = {
  id: string;
  show: number;
  hide: number;
  quote: string;
  speaker: string;
  film: string;
};

export const DIALOGUES: Dialogue[] = [
  {
    id: "d1",
    show: 0.1,
    hide: 0.3,
    quote:
      "Optech completely transformed my career. I got placed at TCS within 2 months of completing my course!",
    speaker: "Priya Sharma",
    film: "PGDCA GRADUATE",
  },
  {
    id: "d2",
    show: 0.35,
    hide: 0.55,
    quote:
      "Best institute in the Vidarbha region. Practical labs, real-world projects, and an amazing community.",
    speaker: "Rahul Meshram",
    film: "WEB DEVELOPMENT",
  },
  {
    id: "d3",
    show: 0.6,
    hide: 0.8,
    quote:
      "Three decades of excellence. Industry-recognized certifications that actually open doors.",
    speaker: "Alumni Network",
    film: "EST. 1994 — DEORI",
  },
];

export const HERO_TEXT_FADE_END = 0.08;
