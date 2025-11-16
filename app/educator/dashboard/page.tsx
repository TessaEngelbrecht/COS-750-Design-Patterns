"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import EducatorDashboard from "@/components/educator/dashboard"
import { createServerSupabase } from "@/lib/supabase/server"; 

export default function EducatorDashboardPage() {
  const router = useRouter()
  const user = null;
  return <EducatorDashboard user={user} router={router} />
}
