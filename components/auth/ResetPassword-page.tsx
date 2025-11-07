"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supebase"

interface ResetPasswordProps {
  onBackToLogin?: () => void;
}

const ResetPassword = ({ onBackToLogin }: ResetPasswordProps) => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [signedIn, setSignedIn] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Parse access_token and type from the hash
      const hash = window.location.hash
      const params = new URLSearchParams(hash.replace(/^#/, ""))
      const access_token = params.get("access_token")
      const type = params.get("type")
      if (type !== "recovery" || !access_token) {
        setMessage("Invalid or expired recovery link.")
        return
      }
      // Set session with the recovery token
      supabase.auth.setSession({
        access_token: access_token,
        refresh_token: "",
      }).then(({ error }) => {
        if (error) {
          setMessage("Session error: " + error.message)
        } else {
          setSignedIn(true)
        }
      })
    }
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    if (!signedIn) {
      setMessage("Invalid session. Please use the link from your email again.")
      return
    }
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setMessage("Error: " + error.message)
    } else {
      setMessage("Your password has been reset! You can now log in.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left Side - Illustration/Text */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center px-8 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="relative mb-8 h-64 flex justify-center items-center">
            <Image
              src="/images/undraw_educator_re_s3jk.svg"
              alt="Educator Illustration"
              width={350}
              height={350}
              className="object-contain rounded-lg"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            />
          </div>
          <p className="text-black text-base mt-0 mb-1">Software Modeling</p>
          <p className="text-black font-bold text-xl mt-2 mb-4">Welcome to COS 214</p>
          <p className="text-black leading-relaxed mt-0">
            In the following app you as a student will be able to see where you are currently at with your knowledge on the design pattern <b>OBSERVER</b>.
          </p>
          <p className="text-black mt-4">
            You will be able to test yourself with practice quizzes before taking the final exam assessment.
          </p>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="w-full md:w-1/2 bg-[#0f7770] flex flex-col justify-center px-8 py-12">
        <form
          onSubmit={handleReset}
          className="max-w-md mx-auto w-full flex flex-col gap-6 text-white"
        >
          {message && (
            <div className={`mb-4 text-center ${message.toLowerCase().includes("error") || message.toLowerCase().includes("invalid") ? "text-red-300" : "text-green-200"}`}>
              {message}
            </div>
          )}
          <div>
            <label className="block text-white font-semibold mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-md text-black bg-white border border-gray-300 focus:border-[#0f4037] focus:ring-2 focus:ring-[#0f4037] outline-none placeholder:text-gray-400"
                placeholder="Enter new password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-3 text-[#0f7770] cursor-pointer"
                onClick={() => setShowPassword(s => !s)}>
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10C2 6.954 3.377 4.36 7 3.173m13.019.045C20.011 4.64 22 7.233 22 11c0 1.932-.634 3.748-1.734 5.236M9.88 7.775A2.996 2.996 0 0112 7c1.326 0 2.418.858 2.818 2.04M15 12a3 3 0 01-6 0m6 0a3 3 0 01-3 3"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-2.11 0-4.017-.63-5.542-1.711"/></svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-white font-semibold mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-md text-black bg-white border border-gray-300 focus:border-[#0f4037] focus:ring-2 focus:ring-[#0f4037] outline-none placeholder:text-gray-400"
                placeholder="Confirm password"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute right-3 top-3 text-[#0f7770] cursor-pointer"
                onClick={() => setShowConfirmPassword(s => !s)}>
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10C2 6.954 3.377 4.36 7 3.173m13.019.045C20.011 4.64 22 7.233 22 11c0 1.932-.634 3.748-1.734 5.236M9.88 7.775A2.996 2.996 0 0112 7c1.326 0 2.418.858 2.818 2.04M15 12a3 3 0 01-6 0m6 0a3 3 0 01-3 3"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.522 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-2.11 0-4.017-.63-5.542-1.711"/></svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="mt-2 w-full py-3 bg-white text-[#0f7770] font-bold rounded-lg hover:bg-gray-100 hover:shadow focus:outline-none transition cursor-pointer"
            disabled={loading}
          >
            {loading ? "Resetting..." : "RESET PASSWORD"}
          </button>
        </form>
        {onBackToLogin && 
        <button
          type="button"
          onClick={onBackToLogin}
          className="mt-6 w-full text-white underline text-center font-semibold transition hover:text-neutral-200 focus:outline-none cursor-pointer"
        >
          Back to Login
        </button>
        }
      </div>
    </div>
  )
}

export default ResetPassword
