import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const STORAGE_KEY = "optech-student-auth";

export type StudentSession = {
  accessToken: string | null;
  refreshToken: string | null;
  name: string | null;
  studentCode: string | null;
  hydrated: boolean;
};

function readSession(): StudentSession {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null, name: null, studentCode: null, hydrated: false };
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { accessToken: null, refreshToken: null, name: null, studentCode: null, hydrated: true };
    const parsed = JSON.parse(raw) as StudentSession;
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      name: parsed.name ?? null,
      studentCode: parsed.studentCode ?? null,
      hydrated: true,
    };
  } catch {
    return { accessToken: null, refreshToken: null, name: null, studentCode: null, hydrated: true };
  }
}

function persist(state: StudentSession) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const initialState: StudentSession = {
  accessToken: null,
  refreshToken: null,
  name: null,
  studentCode: null,
  hydrated: false,
};

const slice = createSlice({
  name: "studentAuth",
  initialState,
  reducers: {
    hydrate(state) {
      const next = readSession();
      state.accessToken = next.accessToken;
      state.name = next.name;
      state.studentCode = next.studentCode;
      state.hydrated = true;
    },
    setStudentSession(_state, action: PayloadAction<Omit<StudentSession, "hydrated">>) {
      const next = { ...action.payload, hydrated: true };
      persist(next);
      return next;
    },
    clearStudentSession() {
      if (typeof window !== "undefined") window.sessionStorage.removeItem(STORAGE_KEY);
      return { accessToken: null, refreshToken: null, name: null, studentCode: null, hydrated: true };
    },
  },
});

export const { hydrate, setStudentSession, clearStudentSession } = slice.actions;
export const studentAuthReducer = slice.reducer;
