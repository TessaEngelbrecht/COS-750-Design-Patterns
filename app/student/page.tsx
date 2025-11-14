import { getUser } from "@/lib/auth/get-user";
import StudentDashboard from "@/components/dashboards/student-dashboard";
import { redirect } from "next/navigation";

export default async function StudentDashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  // Destructure user profile
  const { profile } = user;

  // Add a guard to prevent accessing properties of null
  if (!profile) {
    // Optionally, you can return a loading indicator, error message, or redirect
    return <div>Loading profile...</div>;
  }

  return (
    <StudentDashboard
      userName={`${profile.first_name} ${profile.last_name}`}
      userId={profile.id}
      role={profile.role}
    />
  );
}
