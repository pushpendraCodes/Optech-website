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
  category: string;
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
  thumbnail?: string;
  syllabus: CourseModule[];
  batches: CourseBatch[];
};

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
