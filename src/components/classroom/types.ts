import {
  formatIndiaWallClock,
  indiaNowParts,
  isTimingActiveNow,
  parseBatchTiming,
  progressForWindow,
  hhmmToMinutes,
} from "@/lib/batch-timing";

export interface ClassroomStudent {
  id: string;
  name: string;
  photo: string;
  course: string;
  batch: string;
  joinedDate: string;
  status: "active" | "absent";
}

export interface ClassroomBatch {
  id: string;
  name: string;
  course: string;
  instructor: string;
  instructorPhoto: string;
  startTime: string;
  endTime: string;
  room: string;
  color: string;
  accentColor: string;
  students: ClassroomStudent[];
  isLive?: boolean;
  title?: string;
  startsAt?: string;
  timing?: string;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${Number(m || 0).toString().padStart(2, "0")} ${period}`;
}

export function getProgress(startTime: string, endTime: string): number {
  return progressForWindow(startTime, endTime);
}

function resolvedTiming(batch: ClassroomBatch) {
  if (batch.timing) {
    const parsed = parseBatchTiming(batch.timing);
    if (parsed) return parsed;
  }
  // Fallback: use API start/end; assume every day if timing string missing
  const start = hhmmToMinutes(batch.startTime);
  let end = hhmmToMinutes(batch.endTime);
  if (end <= start) end += 24 * 60;
  return {
    days: [0, 1, 2, 3, 4, 5, 6],
    startMinutes: start,
    endMinutes: end,
    startTime: batch.startTime,
    endTime: batch.endTime,
  };
}

export function isBatchLiveNow(batch: ClassroomBatch): boolean {
  return isTimingActiveNow(resolvedTiming(batch), indiaNowParts());
}

export function getActiveBatches(batches: ClassroomBatch[]): ClassroomBatch[] {
  return batches
    .filter((b) => isBatchLiveNow(b))
    .map((b) => ({ ...b, isLive: true }))
    .sort((a, b) => hhmmToMinutes(a.startTime) - hhmmToMinutes(b.startTime));
}

/** Prefer currently live; else next upcoming today; else last finished today. */
export function pickPrimaryBatch(batches: ClassroomBatch[]): ClassroomBatch | null {
  if (!batches.length) return null;
  const now = indiaNowParts();
  const live = getActiveBatches(batches);
  if (live[0]) return live[0];

  const today = batches
    .filter((b) => resolvedTiming(b).days.includes(now.day))
    .sort((a, b) => hhmmToMinutes(a.startTime) - hhmmToMinutes(b.startTime));

  const upcoming = today.find((b) => {
    const t = resolvedTiming(b);
    return t.startMinutes > now.minutes;
  });
  if (upcoming) return { ...upcoming, isLive: false };

  const last = today[today.length - 1];
  return last ? { ...last, isLive: false } : { ...batches[0], isLive: false };
}

export function getNextBatch(batches: ClassroomBatch[]): ClassroomBatch | null {
  const now = indiaNowParts();
  const upcoming = batches
    .filter((b) => {
      if (isBatchLiveNow(b)) return false;
      const parsed = resolvedTiming(b);
      if (!parsed.days.includes(now.day)) return false;
      return parsed.startMinutes > now.minutes;
    })
    .sort((a, b) => hhmmToMinutes(a.startTime) - hhmmToMinutes(b.startTime));
  return upcoming[0] ?? null;
}

/** Today's weekday batches only, sorted by start time. */
export function getTodaysBatches(batches: ClassroomBatch[]): ClassroomBatch[] {
  const now = indiaNowParts();
  return batches
    .filter((b) => resolvedTiming(b).days.includes(now.day))
    .map((b) => ({ ...b, isLive: isBatchLiveNow(b) }))
    .sort((a, b) => hhmmToMinutes(a.startTime) - hhmmToMinutes(b.startTime));
}

export { formatIndiaWallClock };

const FALLBACK_COLORS = [
  { color: "#D4A22F", accentColor: "#E8C35A" },
  { color: "#3B82F6", accentColor: "#60A5FA" },
  { color: "#8B5CF6", accentColor: "#A78BFA" },
  { color: "#10B981", accentColor: "#34D399" },
];

export function mapApiToBatches(rows: Record<string, unknown>[]): ClassroomBatch[] {
  return rows.map((row, index): ClassroomBatch => {
    const palette = FALLBACK_COLORS[index % FALLBACK_COLORS.length];
    const studentsRaw = Array.isArray(row.students) ? row.students : [];
    const course = String(row.course ?? "Course");
    const batchName = String(row.name ?? "Batch");
    const timing = row.timing ? String(row.timing) : undefined;
    const parsed = timing ? parseBatchTiming(timing) : null;
    const batch: ClassroomBatch = {
      id: String(row.id ?? index),
      name: batchName,
      course,
      instructor: String(row.instructor ?? "Faculty"),
      instructorPhoto: String(row.instructorPhoto ?? ""),
      startTime: parsed?.startTime ?? String(row.startTime ?? "00:00"),
      endTime: parsed?.endTime ?? String(row.endTime ?? "23:59"),
      room: String(row.room ?? "Campus lab"),
      color: String(row.color ?? palette.color),
      accentColor: String(row.accentColor ?? palette.accentColor),
      isLive: Boolean(row.isLive),
      title: row.title ? String(row.title) : undefined,
      startsAt: row.startsAt ? String(row.startsAt) : undefined,
      timing,
      students: studentsRaw.map((s, i): ClassroomStudent => {
        const student = (s ?? {}) as Record<string, unknown>;
        const name = String(student.name ?? "Student");
        return {
          id: String(student.id ?? `${row.id}-s${i}`),
          name,
          photo: String(
            student.photo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1a2e&color=d4a22f&size=128`,
          ),
          course: String(student.course ?? course),
          batch: String(student.batch ?? batchName),
          joinedDate: String(student.joinedDate ?? ""),
          status: student.status === "absent" ? "absent" : "active",
        };
      }),
    };
    batch.isLive = isBatchLiveNow(batch);
    return batch;
  });
}

export interface DeskSlot {
  id: string;
  defaultName: string;
  x: number; // percentage from left
  y: number; // percentage from top
  cardSide: "left" | "right";
  role?: string;
  currentTask?: string;
}

export const CLASSROOM_DESK_SLOTS: DeskSlot[] = [
  { id: "desk-1", defaultName: "Aarav", x: 16.5, y: 44.5, cardSide: "right", currentTask: "Building REST API" },
  { id: "desk-2", defaultName: "Sahin", x: 21.0, y: 58.5, cardSide: "right", currentTask: "Database Migrations" },
  { id: "desk-3", defaultName: "Priya", x: 29.5, y: 34.5, cardSide: "right", currentTask: "State Management" },
  { id: "desk-4", defaultName: "Neha", x: 33.5, y: 48.0, cardSide: "right", currentTask: "Tailwind UI Components" },
  { id: "desk-5", defaultName: "Rohan", x: 43.5, y: 37.0, cardSide: "right", currentTask: "Authentication Middleware" },
  { id: "desk-6", defaultName: "Ishita", x: 40.0, y: 68.5, cardSide: "right", currentTask: "React Hook Form" },
  { id: "desk-7", defaultName: "Vikash", x: 50.5, y: 57.0, cardSide: "right", currentTask: "Full-Stack Project Practice" },
  { id: "desk-8", defaultName: "Sneha", x: 59.0, y: 45.0, cardSide: "left", currentTask: "Responsive Dashboard" },
  { id: "desk-9", defaultName: "Muskan", x: 67.5, y: 63.5, cardSide: "left", currentTask: "Next.js Server Actions" },
  { id: "desk-10", defaultName: "Aditya", x: 60.5, y: 79.5, cardSide: "left", currentTask: "TypeScript Generics" },
];

export const DEFAULT_LIVE_BATCHES: ClassroomBatch[] = [
  {
    id: "batch-web-dev",
    name: "Batch A",
    course: "Web Development",
    instructor: "Ankit Sharma",
    instructorPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    startTime: "17:00",
    endTime: "19:00",
    room: "Coding Lab 01",
    color: "#3B82F6",
    accentColor: "#60A5FA",
    isLive: true,
    title: "Web Development — Batch A",
    students: [
      {
        id: "student-vikash",
        name: "Vikash Kumar",
        photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "student-aarav",
        name: "Aarav Sharma",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "student-priya",
        name: "Priya Patel",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "student-rohan",
        name: "Rohan Gupta",
        photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "student-sneha",
        name: "Sneha Reddy",
        photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Feb 2026",
        status: "active",
      },
      {
        id: "student-sahin",
        name: "Sahin Ali",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "student-neha",
        name: "Neha Chawla",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Feb 2026",
        status: "active",
      },
      {
        id: "student-ishita",
        name: "Ishita Sen",
        photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "student-muskan",
        name: "Muskan Khan",
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Feb 2026",
        status: "active",
      },
      {
        id: "student-aditya",
        name: "Aditya Menon",
        photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "student-amit",
        name: "Amit Kumar",
        photo: "https://ui-avatars.com/api/?name=Amit+Kumar&background=1a2240&color=fff&size=128",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "student-anjali",
        name: "Anjali Mehta",
        photo: "https://ui-avatars.com/api/?name=Anjali+Mehta&background=243056&color=fff&size=128",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "student-aryan",
        name: "Aryan Shah",
        photo: "https://ui-avatars.com/api/?name=Aryan+Shah&background=1a3040&color=fff&size=128",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "student-pooja",
        name: "Pooja Verma",
        photo: "https://ui-avatars.com/api/?name=Pooja+Verma&background=2a1a40&color=fff&size=128",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Feb 2026",
        status: "active",
      },
      {
        id: "student-nikhil",
        name: "Nikhil Rao",
        photo: "https://ui-avatars.com/api/?name=Nikhil+Rao&background=1a2240&color=fff&size=128",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "student-karan",
        name: "Karan Pillai",
        photo: "https://ui-avatars.com/api/?name=Karan+Pillai&background=243056&color=fff&size=128",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "student-divya",
        name: "Divya Agarwal",
        photo: "https://ui-avatars.com/api/?name=Divya+Agarwal&background=1a3040&color=fff&size=128",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Feb 2026",
        status: "active",
      },
      {
        id: "student-ravi",
        name: "Ravi Thakur",
        photo: "https://ui-avatars.com/api/?name=Ravi+Thakur&background=2a1a40&color=fff&size=128",
        course: "Web Development",
        batch: "Batch A",
        joinedDate: "Jan 2026",
        status: "active",
      },
    ],
  },
  {
    id: "batch-graphic-design",
    name: "Batch B",
    course: "Graphic Design",
    instructor: "Rahul Verma",
    instructorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    startTime: "15:00",
    endTime: "17:00",
    room: "Design Studio 02",
    color: "#8B5CF6",
    accentColor: "#A78BFA",
    isLive: false,
    title: "Graphic Design — Batch B",
    students: [
      {
        id: "gd-1",
        name: "Kavya Nair",
        photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
        course: "Graphic Design",
        batch: "Batch B",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "gd-2",
        name: "Deepak Joshi",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
        course: "Graphic Design",
        batch: "Batch B",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "gd-3",
        name: "Meera Iyer",
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        course: "Graphic Design",
        batch: "Batch B",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "gd-4",
        name: "Tanya Bose",
        photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
        course: "Graphic Design",
        batch: "Batch B",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "gd-5",
        name: "Yash Malhotra",
        photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
        course: "Graphic Design",
        batch: "Batch B",
        joinedDate: "Jan 2026",
        status: "active",
      },
    ],
  },
  {
    id: "batch-tally",
    name: "Batch C",
    course: "Tally",
    instructor: "Sanjay Gupta",
    instructorPhoto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80",
    startTime: "11:00",
    endTime: "13:00",
    room: "Finance Wing 03",
    color: "#10B981",
    accentColor: "#34D399",
    isLive: false,
    title: "Tally Prime — Batch C",
    students: [
      {
        id: "tally-1",
        name: "Harsh Trivedi",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
        course: "Tally",
        batch: "Batch C",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "tally-2",
        name: "Ananya Roy",
        photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80",
        course: "Tally",
        batch: "Batch C",
        joinedDate: "Jan 2026",
        status: "active",
      },
      {
        id: "tally-3",
        name: "Manish Tiwari",
        photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
        course: "Tally",
        batch: "Batch C",
        joinedDate: "Jan 2026",
        status: "active",
      },
    ],
  },
];

const DEMO_FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
  "Shaurya", "Atharv", "Advik", "Pranav", "Rudra", "Ananya", "Aadhya", "Diya", "Myra", "Sara",
  "Anika", "Aarohi", "Pari", "Navya", "Kiara", "Ira", "Riya", "Saanvi", "Meera", "Isha",
];

const DEMO_LAST_NAMES = [
  "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Verma", "Joshi", "Reddy", "Nair", "Mehta",
  "Chopra", "Malhotra", "Kapoor", "Desai", "Iyer",
];

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function minutesToHhmmLocal(total: number) {
  const h = Math.floor(((total % (24 * 60)) + 24 * 60) % (24 * 60) / 60);
  const m = ((total % (24 * 60)) + 24 * 60) % (24 * 60) % 60;
  return `${pad2(h)}:${pad2(m)}`;
}

/** Dummy 30-student live batch for layout preview only. */
export function createDemoBatch30(): ClassroomBatch {
  const now = indiaNowParts();
  const startMinutes = Math.max(0, now.minutes - 40);
  const endMinutes = Math.min(24 * 60 - 1, now.minutes + 80);
  const startTime = minutesToHhmmLocal(startMinutes);
  const endTime = minutesToHhmmLocal(endMinutes);

  const students: ClassroomStudent[] = Array.from({ length: 30 }, (_, i) => {
    const first = DEMO_FIRST_NAMES[i % DEMO_FIRST_NAMES.length];
    const last = DEMO_LAST_NAMES[i % DEMO_LAST_NAMES.length];
    const name = `${first} ${last}`;
    return {
      id: `demo-student-${i + 1}`,
      name,
      photo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${["1a2240", "1e293b", "312e81", "134e4a", "4c1d95"][i % 5]}&color=fff&size=128`,
      course: "Full Stack Demo",
      batch: "Demo 30",
      joinedDate: "Jan 2026",
      status: "active" as const,
    };
  });

  return {
    id: "demo-batch-30",
    name: "Demo 30",
    course: "Full Stack Demo",
    instructor: "Demo Instructor",
    instructorPhoto: "",
    startTime,
    endTime,
    room: "Demo Lab · 30 desks",
    color: "#3B82F6",
    accentColor: "#60A5FA",
    isLive: true,
    title: "Full Stack Demo — 30 Students",
    timing: `Sun-Sat · ${startTime}-${endTime}`,
    students,
  };
}

