import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import type { RootState } from "./store";
import { clearStudentSession, setStudentSession } from "./studentAuthSlice";
import type {
  ApiSuccess,
  AuthPayload,
  CmsItem,
  PublicCourse,
  PublicNotice,
  PublicStaff,
} from "./api-types";

const rawBase = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api/v1",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).studentAuth.accessToken;
    if (token) headers.set("authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extra,
) => {
  let result = await rawBase(args, api, extra);
  if (result.error && result.error.status === 401) {
    const url = typeof args === "string" ? args : args.url;
    if (url?.includes("/auth/refresh") || url?.includes("/auth/student/login")) {
      api.dispatch(clearStudentSession());
      return result;
    }
    const refreshToken = (api.getState() as RootState).studentAuth.refreshToken;
    const refresh = await rawBase(
      { url: "/auth/refresh", method: "POST", body: refreshToken ? { refreshToken } : undefined },
      api,
      extra,
    );
    if (refresh.data) {
      const body = refresh.data as ApiSuccess<AuthPayload>;
      api.dispatch(
        setStudentSession({
          accessToken: body.data.accessToken,
          refreshToken: body.data.refreshToken ?? null,
          name: body.data.user.name,
          studentCode: body.data.user.studentCode || body.data.user.studentId || null,
        }),
      );
      result = await rawBase(args, api, extra);
    } else {
      api.dispatch(clearStudentSession());
    }
  }
  return result;
};

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Public", "Student"],
  endpoints: (build) => ({
    getCourses: build.query<ApiSuccess<PublicCourse[]>, void>({
      query: () => "/public/courses",
      providesTags: ["Public"],
    }),
    getCourse: build.query<ApiSuccess<PublicCourse>, string>({
      query: (slug) => `/public/courses/${slug}`,
      providesTags: ["Public"],
    }),
    getCategories: build.query<ApiSuccess<{ slug: string; name: unknown }[]>, void>({
      query: () => "/public/categories",
      providesTags: ["Public"],
    }),
    getStaff: build.query<ApiSuccess<PublicStaff[]>, void>({
      query: () => "/public/staff",
      providesTags: ["Public"],
    }),
    getNotices: build.query<ApiSuccess<PublicNotice[]>, void>({
      query: () => "/public/notices",
      providesTags: ["Public"],
    }),
    getGallery: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => "/public/gallery",
      providesTags: ["Public"],
    }),
    getAlumni: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => "/public/alumni",
      providesTags: ["Public"],
    }),
    getJobs: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => "/public/jobs",
      providesTags: ["Public"],
    }),
    getVideos: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => "/public/videos",
      providesTags: ["Public"],
    }),
    getMarquee: build.query<ApiSuccess<CmsItem[]>, void>({
      query: () => "/public/marquee",
      providesTags: ["Public"],
    }),
    getAds: build.query<ApiSuccess<CmsItem[]>, void>({
      query: () => "/public/ads",
      providesTags: ["Public"],
    }),
    getPopups: build.query<ApiSuccess<CmsItem[]>, void>({
      query: () => "/public/popups",
      providesTags: ["Public"],
    }),
    getLinks: build.query<ApiSuccess<CmsItem[]>, void>({
      query: () => "/public/links",
      providesTags: ["Public"],
    }),
    getLive: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => "/public/live",
      providesTags: ["Public"],
    }),
    getScholarship: build.query<ApiSuccess<Record<string, unknown>>, void>({
      query: () => "/public/scholarship",
      providesTags: ["Public"],
    }),
    submitEnquiry: build.mutation<
      ApiSuccess<Record<string, unknown>>,
      { name: string; email: string; phone: string; course: string; message?: string }
    >({
      query: (body) => ({ url: "/public/enquiry", method: "POST", body }),
    }),
    quoteFee: build.mutation<
      ApiSuccess<{
        fee: number;
        discount: number;
        total: number;
        coupon?: { code?: string; label?: string } | null;
        plan?: { parts: number; perInstallment: number; allowed: boolean };
      }>,
      { courseId: string; coupon?: string; parts?: number; phone?: string; email?: string }
    >({
      query: (body) => ({ url: "/public/calculator", method: "POST", body }),
    }),
    validateEnrollmentCode: build.mutation<
      ApiSuccess<{
        kind: "coupon" | "scholarship" | "referral";
        code: string;
        fee: number;
        discount: number;
        total: number;
        coupon?: { code?: string; label?: string } | null;
        referrerName?: string;
        message: string;
      }>,
      { courseId: string; code: string; phone?: string; email?: string }
    >({
      query: (body) => ({ url: "/public/enroll/validate-code", method: "POST", body }),
    }),
    studentLogin: build.mutation<ApiSuccess<AuthPayload>, { studentId: string; password: string; pushToken?: string }>({
      query: (body) => ({ url: "/auth/student/login", method: "POST", body }),
    }),
    studentLogout: build.mutation<ApiSuccess<unknown>, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["Student"],
    }),
    getStudentDashboard: build.query<ApiSuccess<Record<string, unknown>>, void>({
      query: () => "/student/dashboard",
      providesTags: ["Student"],
    }),
    getStudentProfile: build.query<ApiSuccess<Record<string, unknown>>, void>({
      query: () => "/student/profile",
      providesTags: ["Student"],
    }),
    getStudentFees: build.query<ApiSuccess<Record<string, unknown>>, void>({
      query: () => "/student/fees",
      providesTags: ["Student"],
    }),
    getStudentAttendance: build.query<ApiSuccess<Record<string, unknown>[]>, string | void>({
      query: (month) => (month ? `/student/attendance?month=${month}` : "/student/attendance"),
      providesTags: ["Student"],
    }),
    getStudentNotes: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => "/student/notes",
      providesTags: ["Student"],
    }),
    viewStudentNote: build.mutation<ApiSuccess<Record<string, unknown>>, string>({
      query: (id) => ({ url: `/student/notes/${id}/view`, method: "POST" }),
      invalidatesTags: ["Student"],
    }),
    getStudentQuizzes: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => "/student/quizzes",
      providesTags: ["Student"],
    }),
    getStudentQuizAttempts: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => "/student/quiz-attempts",
      providesTags: ["Student"],
    }),
    startQuiz: build.mutation<ApiSuccess<Record<string, unknown>>, string>({
      query: (id) => ({ url: `/student/quizzes/${id}/start`, method: "POST" }),
    }),
    submitQuiz: build.mutation<
      ApiSuccess<Record<string, unknown>>,
      { id: string; answers: { index: number; value: string | number }[] }
    >({
      query: ({ id, answers }) => ({ url: `/student/quizzes/attempts/${id}/submit`, method: "POST", body: { answers } }),
      invalidatesTags: ["Student"],
    }),
    getStudentTypingParagraphs: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => "/student/typing/paragraphs",
      providesTags: ["Student"],
    }),
    getStudentTypingAttempts: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => "/student/typing/attempts",
      providesTags: ["Student"],
    }),
    startTyping: build.mutation<
      ApiSuccess<{ paragraph: { _id?: string; text: string }; minutes: number }>,
      { language: "en" | "hi"; minutes: number; paragraphId?: string }
    >({
      query: (body) => ({ url: "/student/typing/start", method: "POST", body }),
    }),
    submitTyping: build.mutation<
      ApiSuccess<Record<string, unknown>>,
      { language: "en" | "hi"; minutes: number; source: string; typed: string }
    >({
      query: (body) => ({ url: "/student/typing/submit", method: "POST", body }),
      invalidatesTags: ["Student"],
    }),
    getStudentIdCard: build.query<ApiSuccess<Record<string, unknown>>, void>({
      query: () => "/student/id-card",
      providesTags: ["Student"],
    }),
    getStudentCertificates: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => "/student/certificates",
      providesTags: ["Student"],
    }),
    getStudentCertificatePdf: build.query<ApiSuccess<Record<string, unknown>>, string>({
      query: (enrollmentId) => `/student/certificates/${enrollmentId}/pdf`,
    }),
    markStudentNotificationRead: build.mutation<ApiSuccess<{ read: boolean }>, string>({
      query: (id) => ({ url: `/student/notifications/${id}/read`, method: "PATCH" }),
      invalidatesTags: ["Student"],
    }),
    markAllStudentNotificationsRead: build.mutation<ApiSuccess<{ read: boolean }>, void>({
      query: () => ({ url: "/student/notifications/read-all", method: "PATCH" }),
      invalidatesTags: ["Student"],
    }),
    getStudentReferrals: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => "/student/referrals",
      providesTags: ["Student"],
    }),
    createReferral: build.mutation<ApiSuccess<Record<string, unknown>>, { refereePhone: string }>({
      query: (body) => ({ url: "/student/referrals", method: "POST", body }),
      invalidatesTags: ["Student"],
    }),
    getStudentNotices: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => "/student/notices",
      providesTags: ["Student"],
    }),
    getStudentNotifications: build.query<
      ApiSuccess<Record<string, unknown>[]>,
      { page?: number; limit?: number } | void
    >({
      query: (arg) => {
        if (!arg) return "/student/notifications";
        const params = new URLSearchParams();
        if (arg.page) params.set("page", String(arg.page));
        if (arg.limit) params.set("limit", String(arg.limit));
        const q = params.toString();
        return q ? `/student/notifications?${q}` : "/student/notifications";
      },
      providesTags: ["Student"],
    }),
    getStudentLive: build.query<ApiSuccess<Record<string, unknown>[]>, void>({
      query: () => "/student/live",
      providesTags: ["Student"],
    }),
    savePushToken: build.mutation<ApiSuccess<{ saved: boolean }>, { token: string }>({
      query: (body) => ({ url: "/student/push-token", method: "POST", body }),
    }),
    getPublicConfig: build.query<ApiSuccess<{ razorpayKeyId?: string }>, void>({
      query: () => "/public/config",
    }),
    getWebsiteSettings: build.query<
      ApiSuccess<{
        name: string;
        email: string;
        mobile: string;
        address: string;
        logo?: Record<string, unknown> | null;
      }>,
      void
    >({
      query: () => "/public/settings/website",
      providesTags: ["Public"],
    }),
    startCheckout: build.mutation<
      ApiSuccess<{ order: { id: string; amount: number; currency: string }; paymentId: string; quote: unknown }>,
      {
        name: string;
        email: string;
        phone: string;
        courseId: string;
        batchId?: string;
        coupon?: string;
        parts: number;
        referralCode?: string;
      }
    >({
      query: (body) => ({ url: "/public/enroll/checkout", method: "POST", body }),
    }),
    verifyCheckout: build.mutation<
      ApiSuccess<Record<string, unknown>>,
      { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }
    >({
      query: (body) => ({ url: "/public/enroll/verify", method: "POST", body }),
    }),
    submitScholarship: build.mutation<
      ApiSuccess<{
        correct: number;
        total: number;
        percent: number;
        passed: boolean;
        couponCode?: string;
        discountPercent?: number;
        name: string;
        phone: string;
        email?: string;
        studentCode?: string;
        timeTakenSeconds?: number;
      }>,
      {
        examId?: string;
        name: string;
        phone: string;
        email?: string;
        studentCode?: string;
        timeTakenSeconds?: number;
        answers: { index: number; value: string | number }[];
      }
    >({
      query: (body) => ({ url: "/public/scholarship/submit", method: "POST", body }),
    }),
  }),
});

export const {
  useGetCoursesQuery,
  useGetCourseQuery,
  useGetCategoriesQuery,
  useGetStaffQuery,
  useGetNoticesQuery,
  useGetGalleryQuery,
  useGetAlumniQuery,
  useGetJobsQuery,
  useGetVideosQuery,
  useGetMarqueeQuery,
  useGetAdsQuery,
  useGetPopupsQuery,
  useGetLinksQuery,
  useGetLiveQuery,
  useGetScholarshipQuery,
  useSubmitEnquiryMutation,
  useQuoteFeeMutation,
  useValidateEnrollmentCodeMutation,
  useStudentLoginMutation,
  useStudentLogoutMutation,
  useGetStudentDashboardQuery,
  useGetStudentProfileQuery,
  useGetStudentFeesQuery,
  useGetStudentAttendanceQuery,
  useGetStudentNotesQuery,
  useViewStudentNoteMutation,
  useGetStudentQuizzesQuery,
  useGetStudentQuizAttemptsQuery,
  useStartQuizMutation,
  useSubmitQuizMutation,
  useStartTypingMutation,
  useSubmitTypingMutation,
  useGetStudentTypingParagraphsQuery,
  useGetStudentTypingAttemptsQuery,
  useGetStudentIdCardQuery,
  useGetStudentCertificatesQuery,
  useLazyGetStudentCertificatePdfQuery,
  useMarkStudentNotificationReadMutation,
  useMarkAllStudentNotificationsReadMutation,
  useGetStudentReferralsQuery,
  useCreateReferralMutation,
  useGetStudentNoticesQuery,
  useGetStudentNotificationsQuery,
  useGetStudentLiveQuery,
  useSavePushTokenMutation,
  useGetPublicConfigQuery,
  useGetWebsiteSettingsQuery,
  useStartCheckoutMutation,
  useVerifyCheckoutMutation,
  useSubmitScholarshipMutation,
} = api;
