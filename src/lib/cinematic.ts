export const CINE_FRAME_COUNT = 40;

export const cineFramePath = (n: number) =>
  `/frames4/ezgif-frame-${String(n).padStart(3, "0")}.png`;

export type Beat = {
  id: string;
  show: number;
  hide: number;
  label: string;
  quote: string;
  speaker: string;
  film: string;
};

export const BEATS: Beat[] = [
  {
    id: "b1",
    show: 0.1,
    hide: 0.3,
    label: "01 — Enquire",
    quote: "Start with free career counseling and find the right path for your goals.",
    speaker: "Admission Desk",
    film: "STEP ONE",
  },
  {
    id: "b2",
    show: 0.35,
    hide: 0.55,
    label: "02 — Train",
    quote: "Hands-on labs, expert faculty, and industry-grade tools — learn by building.",
    speaker: "Campus Labs",
    film: "STEP TWO",
  },
  {
    id: "b3",
    show: 0.6,
    hide: 0.8,
    label: "03 — Place",
    quote: "Dedicated placement support with a 95% success rate across top tech firms.",
    speaker: "Career Cell",
    film: "STEP THREE",
  },
];

export const CINE_INTRO_FADE_END = 0.08;
