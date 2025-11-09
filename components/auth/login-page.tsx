"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "../../lib/supebase"

// Utility to switch to a destination route using the Next.js router
function switchOnTo(destination: string, router: ReturnType<typeof useRouter>) {
  router.push(destination)
}

interface LoginPageProps {
  onSwitchToSignup: () => void
  onSwitchToForgotPassword: () => void
}

export default function LoginPage({ onSwitchToSignup, onSwitchToForgotPassword }: LoginPageProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<"student" | "educator">("student")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  // Redirects are handled inside this event handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      console.error("Failed to sign in:", error.message)
      return
    }

    if (!data.user) {
      console.error("No user returned from sign-in")
      return
    }

    // Fetch user profile info including has_seen_self_reflection and role
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("has_seen_self_reflection, role")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      console.error("Failed to get user profile:", profileError.message)
      return
    }

    // Store user in localStorage if needed
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: data.user.id,
        email: data.user.email,
        role: profile.role,
        has_seen_self_reflection: profile.has_seen_self_reflection
      })
    )

    // Redirect logic
    console.log("User profile:", profile)
    if (profile.role === "student") {
      switchOnTo("/student", router)
    } 
    else if (profile.role === "educator") {
      switchOnTo("/educator/dashboard", router)
    } else {
      switchOnTo("/student", router)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 bg-teal-600 flex flex-col justify-center px-8 py-12">
        <div className="max-w-md mx-auto w-full">
          <div className="mb-8">
            <label className="block text-white text-sm font-semibold mb-3">Role</label>
            <div className="flex gap-4">
              <button
                onClick={() => setRole("student")}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  role === "student" ? "bg-white text-teal-600" : "bg-teal-700 text-white hover:bg-teal-800"
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setRole("educator")}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  role === "educator" ? "bg-white text-teal-600" : "bg-teal-700 text-white hover:bg-teal-800"
                }`}
              >
                Educator
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-white font-semibold mb-2">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field bg-white"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="mb-2">
            <label htmlFor="password" className="block text-white font-semibold mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field bg-white"
                placeholder="••••••••"
              />
              {/* Button for show/hide password */}
            </div>
          </div>

          <div className="mb-6 text-right">
            <button
              type="button"
              onClick={onSwitchToForgotPassword}
              className="text-white text-sm font-semibold hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="w-full btn-primary bg-white text-teal-600 font-bold mb-4 rounded-lg hover:bg-gray-100 hover:shadow focus:outline-none transition cursor-pointer"
            aria-label="Log in"
          >
            LOG IN
          </button>

          <p className="text-center text-white text-sm">
            Don't have an account?{" "}
            <button onClick={onSwitchToSignup} className="font-bold hover:underline">
              Sign up now
            </button>
          </p>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden md:flex w-1/2 bg-white flex-col justify-center px-8">
        <div className="relative mb-8 h-64">
          <div className="bg-gray-200 rounded-3xl p-8 h-full flex items-center justify-center">
            <img
              src="/images/undraw_educator_re_s3jk.svg"
              alt="Educator Illustration"
              className="w-full h-full object-contain rounded-lg"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          </div>
        </div>
        <p className="text-gray-600 text-center mb-4">Software Modeling</p>
        <div className="space-y-4">
          <p className="text-gray-700 font-medium">
            In the following app you as a student will be able to see where you are currently at with your knowledge on
            the design pattern <strong>OBSERVER</strong>.
          </p>
          <p className="text-gray-700 font-medium">
            You will be able to test yourself with practice quizzes before taking the final exam assessment.
          </p>
        </div>
      </div>
    </div>
  )
}
