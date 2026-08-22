"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEMO_STUDENT, SESSION_KEY } from "@/lib/student-data";

type AuthContextValue = {
  ready: boolean;
  studentId: string | null;
  login: (id: string, password: string) => string | null;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    setStudentId(window.localStorage.getItem(SESSION_KEY));
    setReady(true);
  }, []);

  const login = useCallback((id: string, password: string) => {
    const cleanId = id.trim().toUpperCase();
    if (cleanId !== DEMO_STUDENT.id || password !== DEMO_STUDENT.password) {
      return "Student ID or password is incorrect. Credentials are issued only after admission.";
    }
    window.localStorage.setItem(SESSION_KEY, cleanId);
    setStudentId(cleanId);
    return null;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setStudentId(null);
  }, []);

  const value = useMemo(
    () => ({ ready, studentId, login, logout }),
    [ready, studentId, login, logout],
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
