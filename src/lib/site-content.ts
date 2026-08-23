export const GOOGLE_REVIEW_URL =
  "https://search.google.com/local/writereview?placeid=ChIJkXVOL_OTKzoRjOzwf4HFYPo";

export const MARQUEE_ITEMS = [
  {
    id: "m1",
    text: "New PGDCA & Web Dev batches start September 2026 — seats limited",
    href: "/courses",
  },
  {
    id: "m2",
    text: "Scholarship exam open — score 75%+ and unlock a fee coupon",
    href: "/scholarship",
  },
  {
    id: "m3",
    text: "Admission open at Deori campus · Mon–Sat 9 AM–6 PM",
    href: "/contact",
  },
] as const;

export const HOME_POPUP = {
  eyebrow: "Admission window // Sep 2026",
  title: "Admission open — Scholarship exam live",
  body: "Register for the public scholarship test. Score 75%+ and unlock a 10–20% course coupon you can use at checkout. Seats for PGDCA, Web Dev, and Tally close as batches fill.",
  points: ["Open to everyone — not only enrolled students", "Instant coupon after auto-score", "Use it on any published course"],
  href: "/scholarship",
  cta: "Take scholarship exam",
} as const;

export const SIDE_ADS = [
  {
    id: "ad-typing",
    label: "Sponsored",
    title: "English + Hindi Typing",
    body: "6 weeks · ₹4,000 · morning batch",
    href: "/courses/english-hindi-typing",
    cta: "View course",
  },
  {
    id: "ad-tally",
    label: "Sponsored",
    title: "Tally Prime evening",
    body: "GST labs · 8 weeks · campus + online",
    href: "/courses/tally-prime",
    cta: "View course",
  },
  {
    id: "ad-scholar",
    label: "Institute offer",
    title: "Scholarship exam",
    body: "Score 75%+ and unlock a fee coupon",
    href: "/scholarship",
    cta: "Register now",
  },
] as const;

export const AD_BANNERS = [
  {
    id: "home-refer",
    slot: "home-between",
    title: "Refer a friend. Earn rewards.",
    body: "Enrolled students get a unique code. When a friend joins a paid course, you earn.",
    href: "/student/login",
    cta: "Student login",
  },
  {
    id: "home-pgdca",
    slot: "home-between",
    title: "PGDCA evening batch — seats open",
    body: "One-year professional track with placement cell support. Starts 15 Sep 2026.",
    href: "/courses/pgdca",
    cta: "View PGDCA",
  },
  {
    id: "home-jobs",
    slot: "home-between",
    title: "Placement jobs this week",
    body: "Data entry, DTP, and computer operator roles matched to your course.",
    href: "/jobs",
    cta: "See listings",
  },
] as const;

export const NOTICES = [
  {
    id: "n1",
    category: "urgent" as const,
    pinned: true,
    title: "Independence Day holiday — 15 Aug",
    body: "Institute closed. Regular batches resume 16 Aug.",
    date: "10 Aug 2026",
    audience: "All",
  },
  {
    id: "n2",
    category: "exam" as const,
    pinned: true,
    title: "PGDCA mid-term mock — 28 Aug",
    body: "Timed test opens 9:00 AM. Auto-submit at 10:30 AM.",
    date: "18 Aug 2026",
    audience: "PGDCA",
  },
  {
    id: "n3",
    category: "general" as const,
    pinned: false,
    title: "New Tally Prime evening batch",
    body: "Online Tue–Thu 7:00–8:30 PM. Fee calculator updated.",
    date: "12 Aug 2026",
    audience: "All",
  },
  {
    id: "n4",
    category: "holiday" as const,
    pinned: false,
    title: "Ganesh Chaturthi short break",
    body: "Schedule will be posted on the student notice board.",
    date: "20 Aug 2026",
    audience: "All",
  },
];

export const GALLERY_ALBUMS = [
  {
    id: "annual-2025",
    title: "Annual Function 2025",
    kind: "photo" as const,
    cover:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&h=680&q=80",
    photos: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&h=800&q=80",
    ],
  },
  {
    id: "workshops",
    title: "Workshops & Labs",
    kind: "photo" as const,
    cover:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&h=680&q=80",
    photos: [
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&h=800&q=80",
    ],
  },
  {
    id: "batches",
    title: "Batch Photographs",
    kind: "photo" as const,
    cover:
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&h=680&q=80",
    photos: [
      "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&h=800&q=80",
    ],
  },
  {
    id: "campus",
    title: "Campus & Events",
    kind: "photo" as const,
    cover:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&h=680&q=80",
    photos: [
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1541339908493-71d65c3acc5e?auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=1200&h=800&q=80",
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&h=800&q=80",
    ],
  },
];

export const ALUMNI = [
  {
    name: "Priya Sharma",
    batch: "2023",
    course: "PGDCA",
    role: "Associate — TCS",
    story: "Placed within two months. Labs and interview drills made the difference.",
    featured: true,
  },
  {
    name: "Rahul Meshram",
    batch: "2024",
    course: "Web Development",
    role: "Junior Frontend — Nagpur startup",
    story: "Portfolio projects from class became my interview talking points.",
    featured: true,
  },
  {
    name: "Snehal Wankhede",
    batch: "2022",
    course: "Tally Prime",
    role: "Accounts Executive — Gondia",
    story: "GST practice matched what my CA office uses every day.",
    featured: false,
  },
  {
    name: "Amit Raut",
    batch: "2021",
    course: "Networking & CCNA",
    role: "Network Support — MSP",
    story: "Hardware lab hours were the reason I cleared the first technical round.",
    featured: false,
  },
];

export const JOBS = [
  {
    id: "j1",
    title: "Data Entry Operator",
    employer: "District e-Seva Partner",
    location: "Deori / Gondia",
    course: "Basic Computer",
    type: "Full-time",
    description:
      "Data entry for citizen service forms, document digitization, and daily report maintenance.",
    contact: "Placement Cell: +91 0712 253 4587 · info@optech-deori.edu.in",
    applyUrl: "https://wa.me/917122534587?text=I%20am%20interested%20in%20Data%20Entry%20Operator",
  },
  {
    id: "j2",
    title: "Computer Operator",
    employer: "Local Municipal Contractor",
    location: "Deori",
    course: "DCA",
    type: "Contract",
    description:
      "Office operations role covering typing, Excel updates, print workflows, and basic system handling.",
    contact: "Placement Cell: +91 0712 253 4587 · info@optech-deori.edu.in",
    applyUrl: "https://wa.me/917122534587?text=I%20am%20interested%20in%20Computer%20Operator",
  },
  {
    id: "j3",
    title: "DTP Artist",
    employer: "Print & Flex Studio",
    location: "Gondia",
    course: "Graphic Design",
    type: "Full-time",
    description:
      "Design and pre-press support for pamphlets, banners, and local business branding materials.",
    contact: "Placement Cell: +91 0712 253 4587 · info@optech-deori.edu.in",
    applyUrl: "https://wa.me/917122534587?text=I%20am%20interested%20in%20DTP%20Artist",
  },
  {
    id: "j4",
    title: "Junior Web Intern",
    employer: "Vidarbha Web Lab",
    location: "Remote / Nagpur",
    course: "Web Dev",
    type: "Internship",
    description:
      "Assist in frontend UI updates, responsive fixes, and QA checks for client websites.",
    contact: "Placement Cell: +91 0712 253 4587 · info@optech-deori.edu.in",
    applyUrl: "https://wa.me/917122534587?text=I%20am%20interested%20in%20Junior%20Web%20Intern",
  },
];

export const LIVE_CLASS = {
  title: "PGDCA — Database Lab (Live)",
  course: "PGDCA",
  start: "Today · 5:00 PM",
  youtubeId: "",
  isLive: false,
  joinUrl: "/student/login",
} as const;

export const USEFUL_LINKS = [
  {
    title: "SSC / Govt exam portal",
    description: "Official notifications and applications.",
    href: "https://ssc.gov.in",
  },
  {
    title: "Maharashtra results",
    description: "Board and university result lookup.",
    href: "https://mahresult.nic.in",
  },
  {
    title: "NSDC skill resources",
    description: "National skill development materials.",
    href: "https://www.nsdcindia.org",
  },
];

export const SCHOLARSHIP_SLABS = [
  { min: 90, coupon: "SCHOLAR20", label: "20% off any course" },
  { min: 75, coupon: "SCHOLAR10", label: "10% off any course" },
] as const;

export const SCHOLARSHIP_QUESTIONS = [
  {
    id: "s1",
    q: "Which key combination copies selected text in most editors?",
    options: ["Ctrl + X", "Ctrl + C", "Ctrl + V", "Ctrl + Z"],
    answer: 1,
  },
  {
    id: "s2",
    q: "GST in Tally is primarily used for:",
    options: ["Drawing", "Tax compliance", "Video editing", "Networking"],
    answer: 1,
  },
  {
    id: "s3",
    q: "HTML is used to:",
    options: ["Style pages only", "Structure web pages", "Route packets", "Balance ledgers"],
    answer: 1,
  },
  {
    id: "s4",
    q: "1 KB equals:",
    options: ["10 bytes", "100 bytes", "1024 bytes", "1000 bits"],
    answer: 2,
  },
  {
    id: "s5",
    q: "A strong password should include:",
    options: ["Only your name", "Mixed characters", "123456", "The word password"],
    answer: 1,
  },
];
