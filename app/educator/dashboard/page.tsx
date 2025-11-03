"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import EducatorDashboard from "@/components/educator/dashboard"

export default function EducatorDashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/")
      return
    }
    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "educator") {
      router.push("/")
      return
    }
    setUser(parsedUser)
  }, [router])

  if (!user) return null

  return <EducatorDashboard user={user} router={router} />
}
