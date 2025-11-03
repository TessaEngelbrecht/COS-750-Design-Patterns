"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface LoginPageProps {
  onSwitchToSignup: () => void
}

export default function LoginPage({ onSwitchToSignup }: LoginPageProps) {
  const [email, setEmail] = useState("designwithdesigners@gmail.com")
  const [password, setPassword] = useState("DesignWITHdesigners12345")
  const [role, setRole] = useState<"student" | "educator">("student")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    // Mock authentication
    const user = {
      id: "1",
      email,
      name: email.split("@")[0],
      role,
    }

    localStorage.setItem("user", JSON.stringify(user))

    if (role === "educator") {
      router.push("/educator/dashboard")
    } else {
      router.push("/student")
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
              <svg
                className="absolute right-3 top-3 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
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
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-teal-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                      clipRule="evenodd"
                    />
                    <path d="M15.171 13.576l1.473 1.473A10.016 10.016 0 0019.542 10c-1.274-4.057-5.064-7-9.542-7a9.948 9.948 0 00-4.512 1.074l1.473 1.473C9.591 4.885 9.787 4.88 10 4.88a6 6 0 016 6c0 .213-.005.409-.034 .602z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="mb-6 text-right">
            <button className="text-white text-sm font-semibold hover:underline">Forgot Password?</button>
          </div>

          <button onClick={handleLogin} className="w-full btn-primary bg-white text-teal-600 font-bold mb-4">
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
            <div className="text-center">
              <h2 className="text-2xl font-bold text-teal-600 mb-4">Welcome to COS 214</h2>
              <p className="text-gray-600">Software Modeling</p>
            </div>
          </div>
        </div>

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
