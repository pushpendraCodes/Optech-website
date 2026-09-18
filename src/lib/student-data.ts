export type AttendanceStatus = "present" | "late" | "absent";

export type AttendanceRow = {
  date: string;
  course: string;
  status: AttendanceStatus;
  loginPhoto?: string;
  logoutPhoto?: string;
  loginAt?: string;
  logoutAt?: string;
};
