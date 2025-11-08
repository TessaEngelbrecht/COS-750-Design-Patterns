"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import LoginPage from "@/components/auth/login-page"
import SignupPage from "@/components/auth/signup-page"
import ForgotPassword from "@/components/auth/ForgotPassword-page"
import ResetPassword from "@/components/auth/ResetPassword-page"

type AuthView = 'login' | 'signup' | 'forgot-password' | 'reset-password'

export default function Home() {
  const [currentView, setCurrentView] = useState<AuthView>('login')
  const [resetMode, setResetMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check for a Supabase recovery token in the URL
    if (typeof window !== "undefined") {
      const hash = window.location.hash
      const type = hash.match(/type=([^&]+)/)?.[1]
      if (type === "recovery") {
        setResetMode(true)
        setCurrentView('reset-password')
        return
      }

      // Usual logic for auto-redirect if logged in
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
  }, [router])

  const renderAuthComponent = () => {
    if (resetMode || currentView === 'reset-password') {
      return (
        <ResetPassword
          onBackToLogin={() => setCurrentView('login')}
        />
      )
    }
    switch (currentView) {
      case 'login':
        return (
          <LoginPage 
            onSwitchToSignup={() => setCurrentView('signup')}
            onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
          />
        )
      case 'signup':
        return (
          <SignupPage 
            onSwitchToLogin={() => setCurrentView('login')} 
          />
        )
      case 'forgot-password':
        return (
          <ForgotPassword 
            onBackToLogin={() => setCurrentView('login')}
          />
        )
    }
  }

  return (
    <div className="min-h-screen">
      {renderAuthComponent()}
    </div>
  )
}
