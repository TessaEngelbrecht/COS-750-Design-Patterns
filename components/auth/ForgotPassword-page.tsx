"use client";

import Image from "next/image";
import { useState } from "react";

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export default function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (data.error) {
      setMessage("Error: " + data.error);
    } else {
      setMessage("Password reset link sent! Check your email.");
    }

    setLoading(false);
  };

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
            In the following app you as a student will be able to see where you are currently at with your knowledge on design patterns.
          </p>
          <p className="text-black mt-4">
            You will be able to test your self with practice quizzes before taking the final exam assessment.
          </p>
        </div>
      </div>

      {/* Right Side - Reset Form */}
      <div className="w-full md:w-1/2 bg-[#0f7770] flex flex-col justify-center px-8 py-12">
        <form
          onSubmit={handleReset}
          className="max-w-md mx-auto w-full flex flex-col gap-6 text-white"
        >
          <div>
            <label className="block text-white font-semibold mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-0 h-full flex items-center pointer-events-none">
                {/* Mail icon using SVG */}
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-md text-black bg-white border border-gray-300 focus:border-[#0f4037] focus:ring-2 focus:ring-[#0f4037] outline-none placeholder:text-gray-400"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 bg-white text-[#0f7770] font-bold rounded-lg hover:bg-gray-100 hover:shadow focus:outline-none transition cursor-pointer"
          >
            {loading ? "Sending..." : "RESET PASSWORD"}
          </button>
          {message && (
            <div className={`mt-2 text-center ${message.startsWith("Error") ? "text-red-300" : "text-green-200"}`}>{message}</div>
          )}
        </form>
        <button
          type="button"
          onClick={onBackToLogin}
          className="mt-6 w-full text-white underline text-center font-semibold transition hover:text-neutral-200 focus:outline-none cursor-pointer"
        >
          Back to Login
        </button>
      </div>
    </div>
  )
}
