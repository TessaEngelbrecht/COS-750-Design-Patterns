import { getUser } from "@/lib/auth/get-user";
import StudentDashboard from "@/components/dashboards/student-dashboard";
import { redirect } from "next/navigation";

export default async function StudentDashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  const { profile } = user;

  return (
    <StudentDashboard
      userName={`${profile.first_name} ${profile.last_name}`}
      userId={profile.id}
      role={profile.role}
    />
  );
} 
