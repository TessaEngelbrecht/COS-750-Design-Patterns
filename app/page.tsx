"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import LoginPage from "@/components/auth/login-page"
import SignupPage from "@/components/auth/signup-page"

export default function Home() {
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter()

  // Check if user is already logged in
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user")
    if (user) {
      const userData = JSON.parse(user)
      if (userData.role === "educator") {
        router.push("/educator/dashboard")
      } else if (userData.role === "student") {
        router.push("/student")
      }
    }
  }

  return (
    <div className="min-h-screen">
      {isLogin ? (
        <LoginPage onSwitchToSignup={() => setIsLogin(false)} />
      ) : (
        <SignupPage onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  )
}
