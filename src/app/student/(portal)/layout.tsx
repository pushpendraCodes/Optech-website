import { StudentShell } from "@/components/student/StudentShell";

export default function StudentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentShell>{children}</StudentShell>;
}
