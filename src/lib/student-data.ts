export const DEMO_STUDENT = {
  id: "OPT-2024-1847",
  password: "bhhw10tqdaA1",
  name: "Aarav Kulkarni",
  photoInitials: "AK",
  email: "aarav.k@example.com",
  phone: "+91 98765 44120",
  parentPhone: "+91 98220 11890",
  batch: "PGDCA Evening",
  roll: "PGD-1847",
  validTill: "Jul 2027",
  referralCode: "AARAV1847",
  courses: [
    {
      slug: "pgdca",
      title: "PGDCA",
      progress: 68,
      attendance: 91,
      nextClass: "Mon 5:00 PM · Database Lab",
    },
    {
      slug: "tally-prime",
      title: "Tally Prime",
      progress: 40,
      attendance: 86,
      nextClass: "Wed 11:00 AM · GST Reports",
    },
  ],
} as const;

export type AttendanceStatus = "present" | "late" | "absent";

export type AttendanceRow = {
  date: string;
  course: string;
  status: AttendanceStatus;
};

function padDate(n: number) {
  return String(n).padStart(2, "0");
}

function isoDate(year: number, month: number, day: number) {
  return `${year}-${padDate(month)}-${padDate(day)}`;
}

const ATTENDANCE_OVERRIDES: Record<string, AttendanceStatus> = {
  "2026-06-09": "late",
  "2026-06-16": "absent",
  "2026-06-27": "late",
  "2026-07-04": "absent",
  "2026-07-11": "late",
  "2026-07-21": "absent",
  "2026-08-03": "late",
  "2026-08-08": "absent",
  "2026-08-16": "absent",
  "2026-08-19": "late",
};

function buildAttendanceLog(): AttendanceRow[] {
  const rows: AttendanceRow[] = [];
  const start = new Date(2026, 5, 1);
  const end = new Date(2026, 7, 21);

  for (let time = start.getTime(); time <= end.getTime(); time += 86_400_000) {
    const cursor = new Date(time);
    const dow = cursor.getDay();
    if (dow === 0) continue;

    const date = isoDate(cursor.getFullYear(), cursor.getMonth() + 1, cursor.getDate());
    const course = dow === 2 || dow === 4 || dow === 6 ? "Tally Prime" : "PGDCA";
    rows.push({
      date,
      course,
      status: ATTENDANCE_OVERRIDES[date] ?? "present",
    });
  }

  return rows;
}

export const ATTENDANCE_LOG = buildAttendanceLog();

export const FEE_HISTORY = [
  {
    id: "INV-1042",
    course: "PGDCA",
    amount: 9334,
    status: "paid" as const,
    date: "12 Jul 2026",
    mode: "UPI · Razorpay",
  },
  {
    id: "INV-1098",
    course: "PGDCA",
    amount: 9333,
    status: "due" as const,
    date: "12 Sep 2026",
    mode: "Installment 2/3",
  },
  {
    id: "INV-0881",
    course: "Tally Prime",
    amount: 9000,
    status: "paid" as const,
    date: "03 Jun 2026",
    mode: "Cash · Campus",
  },
];

export const NOTES = [
  {
    id: "note-1",
    course: "PGDCA",
    chapter: "Module 3 — Databases",
    title: "SQL joins cheat sheet",
    type: "PDF",
    views: 214,
  },
  {
    id: "note-2",
    course: "PGDCA",
    chapter: "Module 2 — Programming",
    title: "Python lab workbook",
    type: "DOC",
    views: 188,
  },
  {
    id: "note-3",
    course: "Tally Prime",
    chapter: "Module 2 — Reports",
    title: "GST filing walkthrough",
    type: "PDF",
    views: 96,
  },
  {
    id: "note-4",
    course: "PGDCA",
    chapter: "Module 3 — Web",
    title: "HTML forms lecture (YouTube)",
    type: "Video",
    views: 141,
  },
];

export const QUIZZES = [
  {
    id: "q-pgdca-mid",
    title: "PGDCA Mid-term Mock",
    course: "PGDCA",
    minutes: 20,
    passing: 60,
    negative: true,
    open: true,
    questions: [
      {
        id: "q1",
        type: "mcq" as const,
        q: "PRIMARY KEY in SQL must be:",
        options: ["Nullable and unique", "Unique and not null", "Always a string", "A foreign file"],
        answer: 1,
      },
      {
        id: "q2",
        type: "tf" as const,
        q: "CSS can change the visual presentation of HTML.",
        options: ["True", "False"],
        answer: 0,
      },
      {
        id: "q3",
        type: "blank" as const,
        q: "The expansion of CPU is ______.",
        options: ["Central Processing Unit"],
        answer: 0,
      },
      {
        id: "q4",
        type: "mcq" as const,
        q: "Which protocol is used to browse websites?",
        options: ["SMTP", "HTTP", "FTP only", "SSH"],
        answer: 1,
      },
    ],
  },
  {
    id: "q-tally-gst",
    title: "Tally GST Checkpoint",
    course: "Tally Prime",
    minutes: 10,
    passing: 50,
    negative: false,
    open: false,
    questions: [],
  },
];

export const QUIZ_HISTORY = [
  { id: "h1", title: "Computer Basics Quiz", score: 88, date: "02 Aug 2026", rank: 4 },
  { id: "h2", title: "Excel Formulas Drill", score: 74, date: "19 Jul 2026", rank: 11 },
];

export const TYPING_PASSAGES = {
  english:
    "Optech Computer Institute trains students in practical computing, accounting, and programming so they can work with confidence in offices and studios across Maharashtra.",
  hindi:
    "आप टेक कम्प्यूटर संस्थान देवरी में विद्यार्थी कंप्यूटर, टैली और टाइपिंग का अभ्यास करते हैं। नियमित अभ्यास से गति और शुद्धता दोनों बढ़ती है।",
};

export const TYPING_HISTORY = [
  { date: "20 Aug 2026", lang: "English", wpm: 38, accuracy: 96, errors: 7, minutes: 5 },
  { date: "12 Aug 2026", lang: "Hindi", wpm: 29, accuracy: 91, errors: 14, minutes: 3 },
];

export const CERTIFICATES = [
  { id: "c1", title: "Computer Basics", issued: "18 Mar 2026", kind: "Course" },
  { id: "c2", title: "Typing — 35 WPM English", issued: "20 Aug 2026", kind: "Typing" },
];

export const STUDENT_NOTIFICATIONS = [
  {
    id: "nt1",
    category: "fee due",
    title: "PGDCA installment due 12 Sep",
    body: "₹9,333 remaining. Pay online or at campus cash desk.",
    time: "2h ago",
    unread: true,
  },
  {
    id: "nt2",
    category: "exam scheduled",
    title: "PGDCA mid-term mock is open",
    body: "20 minutes · negative marking on. Auto-submit enabled.",
    time: "1d ago",
    unread: true,
  },
  {
    id: "nt3",
    category: "live class",
    title: "Database lab starts at 5:00 PM",
    body: "Join from the Live Class page after login.",
    time: "3d ago",
    unread: false,
  },
  {
    id: "nt4",
    category: "admission confirmed",
    title: "Admission confirmed — OPT-2024-1847",
    body: "Your student ID is active. Keep your password private.",
    time: "12 Jul 2026",
    unread: false,
  },
];

export const REFERRALS = [
  { name: "Pending invite", status: "pending" as const, reward: "₹500" },
  { name: "Neha Borkar — Tally", status: "successful" as const, reward: "₹500" },
];

export const SESSION_KEY = "optech-student-session";
