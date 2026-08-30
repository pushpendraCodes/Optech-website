export type ApiSuccess<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown>;
};

export type Localized = { en: string; hi?: string; mr?: string };

export type PublicCourse = {
  _id: string;
  slug: string;
  title: Localized | string;
  description?: Localized | string;
  category?: { name?: Localized | string; slug?: string };
  duration?: string;
  durationMonths?: number;
  mode?: "offline" | "online";
  fee: number;
  tags?: string[];
  popular?: boolean;
  new?: boolean;
  trending?: boolean;
  certificate?: string;
  demoVideo?: string;
  thumbnail?: { url?: string };
  syllabus?: { title: string; topics: string[] }[];
  instructors?: { name: string; role?: string; bio?: string; photo?: { url?: string } }[];
  batches?: { _id: string; label: string; timing: string; seats: number; start?: string }[];
};

export type PublicStaff = {
  _id: string;
  name: string;
  role?: string;
  focus?: string;
  bio?: string;
  photo?: { url?: string };
  linkedin?: string;
  twitter?: string;
  website?: string;
};

export type PublicNotice = {
  _id: string;
  title: Localized | string;
  body: Localized | string;
  category: string;
  pinned: boolean;
  audience?: string;
  createdAt?: string;
};

export type CmsItem = {
  _id: string;
  kind: string;
  title: string;
  body?: string;
  href?: string;
  cta?: string;
  slot?: string;
  sortOrder?: number;
  image?: { url?: string };
};

export type AuthPayload = {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    name: string;
    email?: string;
    studentId?: string;
    studentCode?: string;
  };
};
