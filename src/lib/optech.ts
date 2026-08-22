export const INSTITUTE = {
  name: "Optech Computer Institute",
  shortName: "Optech",
  tagline: "Institute of Technology",
  location: "Deori, Maharashtra",
  established: 1994,
  email: "info@optech-deori.edu.in",
  altEmail: "hello@optechdeori.com",
  phone: "+91 0712 253 4587",
  /** Digits only with country code — used for wa.me link */
  whatsapp: "917122534587",
  address:
    "Ward No. 04, Ganesh Chowk, behind Shitala Mata Mandir, Deori, Maharashtra 441901",
  hours: "Mon — Sat: 9:00 AM – 6:00 PM",
  rating: "4.9 / 5.0",
} as const;

export const ABOUT = {
  mission:
    "To bridge the digital divide by delivering world-class, outcome-based technical education in the heart of Maharashtra — transforming students into career-ready professionals.",
  vision:
    "To be Maharashtra's most trusted computer institute — recognized for practical labs, global certifications, and life-changing placement outcomes since 1994.",
  story:
    "Optech Computer Institute of Technology has been empowering students in Deori and across Vidarbha for over three decades. From foundational computer literacy to advanced programming, networking, and professional certifications, we focus on skills employers actually hire for.",
  highlights: [
    {
      title: "Govt. Recognized",
      body: "Affiliated and certified programs aligned with industry standards.",
    },
    {
      title: "Placement Support",
      body: "100% assistance with a proven 95% placement success rate.",
    },
    {
      title: "Live Labs",
      body: "Industry-grade hardware and software for hands-on learning.",
    },
    {
      title: "Global Certs",
      body: "Internationally valid certifications that strengthen your resume.",
    },
  ],
} as const;

export const STATS = [
  { value: "5000+", label: "Students Trained", note: "Since 1994" },
  { value: "95%", label: "Placement Rate", note: "Industry average: 67%" },
  { value: "50+", label: "Active Courses", note: "Updated annually" },
  { value: "30+", label: "Years of Excellence", note: "Trusted since 1994" },
] as const;

export const PILLARS = [
  {
    title: "State-of-the-Art Labs",
    body: "High-speed computing labs equipped with the latest software and hardware for immersive, hands-on learning.",
  },
  {
    title: "Expert Faculty",
    body: "Learn from industry veterans with decades of experience in software, networking, and systems management.",
  },
  {
    title: "Career Placement Cell",
    body: "Dedicated placement support with partnerships across national and international tech firms. 95% success rate.",
  },
  {
    title: "Global Certifications",
    body: "Internationally recognized programs that give you a competitive edge in the global job market.",
  },
  {
    title: "Fast-Track Programs",
    body: "Accelerated learning paths for working professionals and students who need to upskill quickly.",
  },
  {
    title: "Trusted Since 1994",
    body: "Three decades of credibility, thousands of successful alumni, and a legacy of technical excellence.",
  },
] as const;

export const COURSES = [
  {
    badge: "Most Popular",
    title: "PGDCA",
    duration: "1 Year",
    level: "Professional",
    body: "Post Graduate Diploma in Computer Applications — full-stack fundamentals, databases, and workplace readiness.",
  },
  {
    badge: "High Demand",
    title: "Web Development",
    duration: "12 Weeks",
    level: "Advanced",
    body: "Build modern, responsive websites using HTML5, CSS3, JavaScript, and popular frameworks.",
  },
  {
    badge: "Trending",
    title: "Python & AI",
    duration: "4 Months",
    level: "Intermediate",
    body: "Learn Python programming with practical AI concepts for automation and data-driven projects.",
  },
  {
    badge: "Job Ready",
    title: "Tally Prime",
    duration: "8 Weeks",
    level: "Professional",
    body: "Gain expertise in modern accounting and GST compliance using Tally Prime tools.",
  },
  {
    badge: "Global Cert",
    title: "Networking & CCNA",
    duration: "6 Months",
    level: "Advanced",
    body: "Industry networking skills with routing, switching, and CCNA-oriented lab practice.",
  },
  {
    badge: "Creative",
    title: "Graphic Design",
    duration: "3 Months",
    level: "Beginner+",
    body: "Design visual identities, marketing creatives, and digital assets for real client briefs.",
  },
  {
    badge: "Intermediate",
    title: "Advanced Excel",
    duration: "6 Weeks",
    level: "Intermediate",
    body: "Unlock data power with pivot tables, complex formulas, VBA macros, and automation.",
  },
  {
    badge: "Beginner",
    title: "Computer Basics",
    duration: "4 Weeks",
    level: "Beginner",
    body: "Master fundamental computing skills, from hardware basics to essential software.",
  },
  {
    badge: "Multi-Level",
    title: "Programming (C, Java, Python)",
    duration: "16 Weeks",
    level: "Multi-Level",
    body: "Master core logic and syntax of industry-standard languages across multiple tracks.",
  },
  {
    badge: "Creative",
    title: "Digital Marketing",
    duration: "10 Weeks",
    level: "Creative",
    body: "Master SEO, SEM, social media marketing, and content strategy to drive business growth.",
  },
] as const;

export const STAFF = [
  {
    name: "Dr. Anil Meshram",
    role: "Director & Principal",
    focus: "Academic Leadership",
    bio: "Leading Optech Deori since the early 2000s with a focus on outcome-based technical education across Vidarbha.",
    photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&h=750&q=80",
    linkedin: "#",
    twitter: "#",
    website: "#",
  },
  {
    name: "Prof. Sneha Kale",
    role: "Head of Programming",
    focus: "C · Java · Python",
    bio: "Industry veteran mentoring students through coding foundations, DSA, and project-based learning.",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&h=750&q=80",
    linkedin: "#",
    twitter: "#",
    website: "#",
  },
  {
    name: "Mr. Rohit Bhoyar",
    role: "Web & UI Faculty",
    focus: "HTML · CSS · JavaScript",
    bio: "Builds career-ready frontend skills with modern frameworks and real client-style assignments.",
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&h=750&q=80",
    linkedin: "#",
    twitter: "#",
    website: "#",
  },
  {
    name: "Mrs. Priya Dakhane",
    role: "Accounts & Tally Lead",
    focus: "Tally · GST · Excel",
    bio: "Specializes in practical accounting workflows used by local businesses and CA offices.",
    photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&h=750&q=80",
    linkedin: "#",
    twitter: "#",
    website: "#",
  },
  {
    name: "Mr. Sachin Ghodmare",
    role: "Networking Instructor",
    focus: "CCNA · Hardware",
    bio: "Hands-on lab trainer for networking, hardware troubleshooting, and infrastructure basics.",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&h=750&q=80",
    linkedin: "#",
    twitter: "#",
    website: "#",
  },
  {
    name: "Ms. Komal Raut",
    role: "Placement Coordinator",
    focus: "Career Cell",
    bio: "Connects students with employers and runs interview readiness workshops year-round.",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&h=750&q=80",
    linkedin: "#",
    twitter: "#",
    website: "#",
  },
  {
    name: "Mr. Nikhil Wagh",
    role: "Lab Supervisor",
    focus: "Hardware · Labs",
    bio: "Keeps campus labs exam-ready and coaches students through practical hardware sessions.",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&h=750&q=80",
    linkedin: "#",
    twitter: "#",
    website: "#",
  },
  {
    name: "Ms. Aditi Deshmukh",
    role: "Counselor",
    focus: "Admissions",
    bio: "Guides new students through course selection, scholarships, and batch planning.",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=600&h=750&q=80",
    linkedin: "#",
    twitter: "#",
    website: "#",
  },
] as const;

/** Add a YouTube video ID to publish it on the Videos page. */
export const VIDEOS = [
  {
    id: "vision-2024",
    title: "The Future of Tech Education: Optech 2024 Vision",
    category: "Institute Highlight",
    duration: "12 mins",
    views: "Featured",
    youtubeId: "",
    body: "Explore curriculum updates featuring AI integration, advanced programming, and industry-partnered projects.",
  },
  {
    id: "js-patterns",
    title: "Advanced JavaScript Patterns",
    category: "Programming & Software",
    duration: "15 mins",
    views: "12k views",
    youtubeId: "",
    body: "Modern JS techniques used in professional web development projects.",
  },
  {
    id: "digital-strategy",
    title: "Digital Strategy Foundations",
    category: "Digital Marketing",
    duration: "22 mins",
    views: "8.5k views",
    youtubeId: "",
    body: "Foundations of SEO, content, and growth strategy for local businesses.",
  },
  {
    id: "tally-prime",
    title: "Mastering Tally Prime 2024",
    category: "Accounts",
    duration: "45 mins",
    views: "5.2k views",
    youtubeId: "",
    body: "Walkthrough of GST-ready accounting workflows in Tally Prime.",
  },
  {
    id: "python-backend",
    title: "Python for Backend Development",
    category: "Programming & Software",
    duration: "18 mins",
    views: "Trending",
    youtubeId: "",
    body: "Build robust APIs and server-side logic using modern Python frameworks.",
  },
  {
    id: "react-tailwind",
    title: "Modern UI with React & Tailwind",
    category: "Programming & Software",
    duration: "12 mins",
    views: "Trending",
    youtubeId: "",
    body: "Building responsive interfaces using the latest web technologies.",
  },
] as const;

export const ENQUIRY_COURSES = [
  "PGDCA",
  "DCA",
  "Web Development",
  "Python & AI",
  "Tally Prime",
  "Networking & CCNA",
  "Graphic Design",
  "Advanced Excel",
  "Computer Basics",
  "Programming (C, Java, Python)",
  "Digital Marketing",
  "English + Hindi Typing",
  "General Counseling",
] as const;

export const REVIEWS = [
  {
    quote:
      "Optech completely transformed my career. The faculty is incredibly knowledgeable and always available. I got placed at TCS within 2 months of completing my course!",
    name: "Priya Sharma",
    role: "PGDCA Graduate",
  },
  {
    quote:
      "Best institute in the Vidarbha region without any doubt. Practical labs, real-world projects, and an amazing community. My confidence in coding skyrocketed.",
    name: "Rahul Meshram",
    role: "Web Development",
  },
] as const;

export const ADMISSION_STEPS = [
  {
    step: "01",
    title: "Enquiry",
    body: "Fill out our form or visit the center for a free career counseling session.",
  },
  {
    step: "02",
    title: "Counseling",
    body: "Meet our experts to pick the right course based on your skills and goals.",
  },
  {
    step: "03",
    title: "Registration",
    body: "Complete your application with documents and the registration fee.",
  },
  {
    step: "04",
    title: "Batch Start",
    body: "Receive your ID card and starter kit, then begin your professional journey.",
  },
] as const;
