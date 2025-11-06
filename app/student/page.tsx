"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StudentDashboard } from "@/components/dashboards/student-dashboard";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }
    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== "student") {
      router.push("/");
      return;
    }
    setUser(parsedUser);
  }, [router]);

  if (!user) return null;

  return (
    <StudentDashboard
      userName={user.email}
      onLogout={() => {
        localStorage.removeItem("user");
        router.push("/");
      }}
    />
  );
}
