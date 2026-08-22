import { STAFF } from "@/lib/optech";

export const COURSE_CATEGORIES = [
  "Basic Computer",
  "Tally",
  "Web Dev",
  "Graphic Design",
  "DCA",
  "PGDCA",
  "Typing",
  "Programming",
  "Digital Marketing",
  "Networking",
] as const;

export type CourseCategory = (typeof COURSE_CATEGORIES)[number];
export type CourseMode = "offline" | "online";
export type CourseTag = "Popular" | "New" | "Trending";

export type CourseModule = {
  title: string;
  topics: string[];
};

export type CourseBatch = {
  id: string;
  label: string;
  timing: string;
  seats: number;
  start: string;
};

export type CourseRecord = {
  slug: string;
  title: string;
  badge: string;
  tags: CourseTag[];
  category: CourseCategory;
  duration: string;
  durationMonths: number;
  level: string;
  mode: CourseMode;
  fee: number;
  rating: number;
  reviewCount: number;
  body: string;
  certificate: string;
  demoVideo: string;
  staffIds: string[];
  syllabus: CourseModule[];
  batches: CourseBatch[];
};

export const COURSES: CourseRecord[] = [
  {
    slug: "pgdca",
    title: "PGDCA",
    badge: "Most Popular",
    tags: ["Popular", "Trending"],
    category: "PGDCA",
    duration: "1 Year",
    durationMonths: 12,
    level: "Professional",
    mode: "offline",
    fee: 28000,
    rating: 4.9,
    reviewCount: 186,
    body: "Post Graduate Diploma in Computer Applications — full-stack fundamentals, databases, and workplace readiness.",
    certificate: "Optech PGDCA Certificate — industry recognized, valid nationwide.",
    demoVideo: "",
    staffIds: ["Dr. Anil Meshram", "Prof. Sneha Kale"],
    syllabus: [
      {
        title: "Module 1 — Computing Foundations",
        topics: ["OS & office suite", "Internet & cyber safety", "File systems"],
      },
      {
        title: "Module 2 — Programming",
        topics: ["C & logic", "Python basics", "Mini projects"],
      },
      {
        title: "Module 3 — Databases & Web",
        topics: ["SQL", "HTML/CSS/JS", "Report generation"],
      },
      {
        title: "Module 4 — Workplace Capstone",
        topics: ["Internship brief", "Viva", "Placement prep"],
      },
    ],
    batches: [
      { id: "pgdca-m", label: "Morning", timing: "Mon–Sat · 9:00–11:00 AM", seats: 8, start: "08 Sep 2026" },
      { id: "pgdca-e", label: "Evening", timing: "Mon–Sat · 4:00–6:00 PM", seats: 12, start: "15 Sep 2026" },
    ],
  },
  {
    slug: "dca",
    title: "DCA",
    badge: "New",
    tags: ["New"],
    category: "DCA",
    duration: "6 Months",
    durationMonths: 6,
    level: "Beginner+",
    mode: "offline",
    fee: 14000,
    rating: 4.7,
    reviewCount: 94,
    body: "Diploma in Computer Applications — essential computing, office automation, and entry-level job skills.",
    certificate: "Optech DCA Certificate with grade sheet.",
    demoVideo: "",
    staffIds: ["Mrs. Priya Dakhane"],
    syllabus: [
      { title: "Module 1 — Computer Basics", topics: ["Hardware", "Windows", "Typing intro"] },
      { title: "Module 2 — MS Office", topics: ["Word", "Excel", "PowerPoint"] },
      { title: "Module 3 — Internet & Accounts intro", topics: ["Email", "Tally overview"] },
    ],
    batches: [
      { id: "dca-m", label: "Morning", timing: "Mon–Sat · 10:00–12:00 PM", seats: 10, start: "01 Sep 2026" },
    ],
  },
  {
    slug: "web-development",
    title: "Web Development",
    badge: "High Demand",
    tags: ["Popular", "Trending"],
    category: "Web Dev",
    duration: "12 Weeks",
    durationMonths: 3,
    level: "Advanced",
    mode: "offline",
    fee: 18000,
    rating: 4.8,
    reviewCount: 142,
    body: "Build modern, responsive websites using HTML5, CSS3, JavaScript, and popular frameworks.",
    certificate: "Optech Web Development Certificate + project portfolio review.",
    demoVideo: "",
    staffIds: ["Mr. Rohit Bhoyar"],
    syllabus: [
      { title: "Module 1 — Markup & Style", topics: ["HTML5", "CSS3", "Responsive layouts"] },
      { title: "Module 2 — JavaScript", topics: ["DOM", "Fetch", "ES modules"] },
      { title: "Module 3 — Frameworks", topics: ["React basics", "Tailwind", "Deploy"] },
    ],
    batches: [
      { id: "web-w", label: "Weekend", timing: "Sat–Sun · 10:00 AM–1:00 PM", seats: 6, start: "06 Sep 2026" },
      { id: "web-e", label: "Evening", timing: "Mon–Fri · 5:00–7:00 PM", seats: 9, start: "14 Sep 2026" },
    ],
  },
  {
    slug: "python-ai",
    title: "Python & AI",
    badge: "Trending",
    tags: ["Trending", "New"],
    category: "Programming",
    duration: "4 Months",
    durationMonths: 4,
    level: "Intermediate",
    mode: "offline",
    fee: 22000,
    rating: 4.8,
    reviewCount: 77,
    body: "Learn Python programming with practical AI concepts for automation and data-driven projects.",
    certificate: "Optech Python & AI Certificate.",
    demoVideo: "",
    staffIds: ["Prof. Sneha Kale"],
    syllabus: [
      { title: "Module 1 — Python Core", topics: ["Syntax", "OOP", "Files"] },
      { title: "Module 2 — Data", topics: ["Pandas", "Charts", "APIs"] },
      { title: "Module 3 — AI Intro", topics: ["Prompting", "Simple models", "Capstone"] },
    ],
    batches: [
      { id: "py-m", label: "Morning", timing: "Mon–Sat · 8:00–10:00 AM", seats: 11, start: "10 Sep 2026" },
    ],
  },
  {
    slug: "tally-prime",
    title: "Tally Prime",
    badge: "Job Ready",
    tags: ["Popular"],
    category: "Tally",
    duration: "8 Weeks",
    durationMonths: 2,
    level: "Professional",
    mode: "offline",
    fee: 9000,
    rating: 4.9,
    reviewCount: 210,
    body: "Gain expertise in modern accounting and GST compliance using Tally Prime tools.",
    certificate: "Optech Tally Prime Certificate.",
    demoVideo: "",
    staffIds: ["Mrs. Priya Dakhane"],
    syllabus: [
      { title: "Module 1 — Company setup", topics: ["Ledgers", "Vouchers", "GST"] },
      { title: "Module 2 — Reports", topics: ["P&L", "Balance sheet", "Filing workflow"] },
    ],
    batches: [
      { id: "tally-m", label: "Morning", timing: "Mon–Sat · 11:00 AM–1:00 PM", seats: 14, start: "02 Sep 2026" },
      { id: "tally-o", label: "Online", timing: "Tue–Thu · 7:00–8:30 PM", seats: 20, start: "08 Sep 2026" },
    ],
  },
  {
    slug: "networking-ccna",
    title: "Networking & CCNA",
    badge: "Global Cert",
    tags: ["Popular"],
    category: "Networking",
    duration: "6 Months",
    durationMonths: 6,
    level: "Advanced",
    mode: "offline",
    fee: 32000,
    rating: 4.6,
    reviewCount: 58,
    body: "Industry networking skills with routing, switching, and CCNA-oriented lab practice.",
    certificate: "Optech Networking Certificate + CCNA exam guidance.",
    demoVideo: "",
    staffIds: ["Mr. Sachin Ghodmare"],
    syllabus: [
      { title: "Module 1 — Networks", topics: ["OSI", "IP", "Cabling"] },
      { title: "Module 2 — Routing & Switching", topics: ["VLANs", "OSPF", "Labs"] },
    ],
    batches: [
      { id: "net-e", label: "Evening", timing: "Mon–Sat · 3:00–5:00 PM", seats: 7, start: "21 Sep 2026" },
    ],
  },
  {
    slug: "graphic-design",
    title: "Graphic Design",
    badge: "Creative",
    tags: ["New"],
    category: "Graphic Design",
    duration: "3 Months",
    durationMonths: 3,
    level: "Beginner+",
    mode: "offline",
    fee: 15000,
    rating: 4.7,
    reviewCount: 63,
    body: "Design visual identities, marketing creatives, and digital assets for real client briefs.",
    certificate: "Optech Graphic Design Certificate + portfolio review.",
    demoVideo: "",
    staffIds: ["Mr. Rohit Bhoyar"],
    syllabus: [
      { title: "Module 1 — Tools", topics: ["Photoshop", "Illustrator", "Canva pro"] },
      { title: "Module 2 — Brand", topics: ["Logo", "Print", "Social kits"] },
    ],
    batches: [
      { id: "gd-w", label: "Weekend", timing: "Sat–Sun · 2:00–5:00 PM", seats: 10, start: "05 Sep 2026" },
    ],
  },
  {
    slug: "advanced-excel",
    title: "Advanced Excel",
    badge: "Intermediate",
    tags: ["Popular"],
    category: "Basic Computer",
    duration: "6 Weeks",
    durationMonths: 2,
    level: "Intermediate",
    mode: "offline",
    fee: 6000,
    rating: 4.8,
    reviewCount: 119,
    body: "Unlock data power with pivot tables, complex formulas, VBA macros, and automation.",
    certificate: "Optech Advanced Excel Certificate.",
    demoVideo: "",
    staffIds: ["Mrs. Priya Dakhane"],
    syllabus: [
      { title: "Module 1 — Formulas", topics: ["Lookups", "Logic", "Named ranges"] },
      { title: "Module 2 — Analysis", topics: ["Pivots", "Dashboards", "VBA intro"] },
    ],
    batches: [
      { id: "xl-m", label: "Morning", timing: "Mon–Fri · 9:00–10:30 AM", seats: 16, start: "03 Sep 2026" },
    ],
  },
  {
    slug: "computer-basics",
    title: "Computer Basics",
    badge: "Beginner",
    tags: ["Popular"],
    category: "Basic Computer",
    duration: "4 Weeks",
    durationMonths: 1,
    level: "Beginner",
    mode: "offline",
    fee: 3500,
    rating: 4.9,
    reviewCount: 240,
    body: "Master fundamental computing skills, from hardware basics to essential software.",
    certificate: "Optech Computer Literacy Certificate.",
    demoVideo: "",
    staffIds: ["Mrs. Priya Dakhane"],
    syllabus: [
      { title: "Module 1 — Hardware & Windows", topics: ["Parts", "Files", "Settings"] },
      { title: "Module 2 — Daily tools", topics: ["Word", "Browser", "Email"] },
    ],
    batches: [
      { id: "cb-m", label: "Morning", timing: "Mon–Sat · 9:00–10:00 AM", seats: 18, start: "01 Sep 2026" },
    ],
  },
  {
    slug: "programming",
    title: "Programming (C, Java, Python)",
    badge: "Multi-Level",
    tags: ["Trending"],
    category: "Programming",
    duration: "16 Weeks",
    durationMonths: 4,
    level: "Multi-Level",
    mode: "offline",
    fee: 20000,
    rating: 4.7,
    reviewCount: 88,
    body: "Master core logic and syntax of industry-standard languages across multiple tracks.",
    certificate: "Optech Programming Certificate (language tracks listed).",
    demoVideo: "",
    staffIds: ["Prof. Sneha Kale"],
    syllabus: [
      { title: "Module 1 — C", topics: ["Pointers", "Arrays", "Functions"] },
      { title: "Module 2 — Java", topics: ["OOP", "Collections", "Mini app"] },
      { title: "Module 3 — Python", topics: ["Scripts", "Files", "Projects"] },
    ],
    batches: [
      { id: "prog-e", label: "Evening", timing: "Mon–Sat · 5:30–7:30 PM", seats: 9, start: "16 Sep 2026" },
    ],
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    badge: "Creative",
    tags: ["New", "Trending"],
    category: "Digital Marketing",
    duration: "10 Weeks",
    durationMonths: 3,
    level: "Creative",
    mode: "online",
    fee: 12000,
    rating: 4.6,
    reviewCount: 51,
    body: "Master SEO, SEM, social media marketing, and content strategy to drive business growth.",
    certificate: "Optech Digital Marketing Certificate.",
    demoVideo: "",
    staffIds: ["Ms. Komal Raut"],
    syllabus: [
      { title: "Module 1 — Discovery", topics: ["SEO", "Keywords", "Analytics"] },
      { title: "Module 2 — Growth", topics: ["Ads", "Social", "Content calendar"] },
    ],
    batches: [
      { id: "dm-o", label: "Online", timing: "Tue–Thu · 7:00–8:30 PM", seats: 22, start: "09 Sep 2026" },
    ],
  },
  {
    slug: "english-hindi-typing",
    title: "English + Hindi Typing",
    badge: "New",
    tags: ["New"],
    category: "Typing",
    duration: "6 Weeks",
    durationMonths: 2,
    level: "Beginner",
    mode: "offline",
    fee: 4000,
    rating: 4.8,
    reviewCount: 73,
    body: "Build speed and accuracy for government and office exams — English and Hindi (Kruti Dev / Inscript).",
    certificate: "Optech Typing Speed Certificate (WPM + accuracy).",
    demoVideo: "",
    staffIds: ["Ms. Komal Raut"],
    syllabus: [
      { title: "Module 1 — English", topics: ["Home row", "Accuracy", "Timed drills"] },
      { title: "Module 2 — Hindi", topics: ["Inscript", "Kruti Dev intro", "Exam format"] },
    ],
    batches: [
      { id: "type-m", label: "Morning", timing: "Mon–Sat · 8:00–9:00 AM", seats: 20, start: "01 Sep 2026" },
    ],
  },
];

export const FEE_RANGES = [
  { id: "any", label: "Any fee", min: 0, max: Infinity },
  { id: "lt5", label: "Under ₹5,000", min: 0, max: 4999 },
  { id: "5to15", label: "₹5,000 – ₹15,000", min: 5000, max: 15000 },
  { id: "15to30", label: "₹15,000 – ₹30,000", min: 15000, max: 30000 },
  { id: "gt30", label: "Above ₹30,000", min: 30001, max: Infinity },
] as const;

export const INSTALLMENT_RULES = {
  minFeeForEmi: 8000,
  parts: 3,
} as const;

export const COUPONS: Record<string, { label: string; percent: number }> = {
  SCHOLAR20: { label: "Scholarship 90%+", percent: 20 },
  SCHOLAR10: { label: "Scholarship 75–89%", percent: 10 },
  REFER500: { label: "Referral", percent: 8 },
  OPTECH10: { label: "Institute offer", percent: 10 },
};

export function formatInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getCourse(slug: string) {
  return COURSES.find((course) => course.slug === slug);
}

export function staffForCourse(course: CourseRecord) {
  return STAFF.filter((member) => course.staffIds.includes(member.name));
}

export function calcPayable(fee: number, coupon?: string) {
  const rule = coupon ? COUPONS[coupon.toUpperCase()] : undefined;
  const discount = rule ? Math.round((fee * rule.percent) / 100) : 0;
  return {
    fee,
    discount,
    total: Math.max(0, fee - discount),
    rule,
  };
}
