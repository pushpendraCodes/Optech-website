"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useStudentLoginMutation, useStudentLogoutMutation } from "@/lib/api";
import { clearStudentSession, setStudentSession } from "@/lib/studentAuthSlice";
import type { RootState } from "@/lib/store";
import type { ApiSuccess, AuthPayload } from "@/lib/api-types";

type AuthContextValue = {
  ready: boolean;
  studentId: string | null;
  name: string | null;
  login: (id: string, password: string) => Promise<string | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const session = useSelector((s: RootState) => s.studentAuth);
  const [loginApi] = useStudentLoginMutation();
  const [logoutApi] = useStudentLogoutMutation();
  const prevToken = useRef<string | null>(session.accessToken);

  useEffect(() => {
    if (!session.hydrated) return;
    if (prevToken.current && !session.accessToken && pathname.startsWith("/student") && pathname !== "/student/login") {
      router.replace("/student/login");
    }
    prevToken.current = session.accessToken;
  }, [session.hydrated, session.accessToken, pathname, router]);

  const login = useCallback(
    async (id: string, password: string) => {
      try {
        const body = await loginApi({ studentId: id.trim(), password }).unwrap();
        const payload = (body as ApiSuccess<AuthPayload>).data;
        dispatch(
          setStudentSession({
            accessToken: payload.accessToken,
            name: payload.user.name,
            studentCode: payload.user.studentCode || payload.user.studentId || id.trim(),
          }),
        );
        return null;
      } catch (err) {
        const message =
          err && typeof err === "object" && "data" in err
            ? String((err as { data?: { message?: string } }).data?.message || "")
            : "";
        return message || "Student ID or password is incorrect. Credentials are issued only after admission.";
      }
    },
    [dispatch, loginApi],
  );

  const logout = useCallback(() => {
    void logoutApi();
    dispatch(clearStudentSession());
  }, [dispatch, logoutApi]);

  const value = useMemo(
    () => ({
      ready: session.hydrated,
      studentId: session.studentCode,
      name: session.name,
      login,
      logout,
    }),
    [session.hydrated, session.studentCode, session.name, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useStudentAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useStudentAuth must be used within StudentAuthProvider");
  }
  return ctx;
}
