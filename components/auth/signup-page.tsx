"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupUser } from "@/lib/auth/signup";
import type { FormEvent, ChangeEvent } from "react";

interface SignupPageProps {
  onSwitchToLogin: () => void;
}

export default function SignupPage({ onSwitchToLogin }: SignupPageProps) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const router = useRouter();

  // FIX: type annotation for e
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // FIX: type annotation for e
  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const result = await signupUser(formData);

    if (result.error) {
      setError(result.error);
      return;
    }

    router.push("/student");
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="flex min-h-screen flex-col-reverse md:flex-row">
      {/* Illustration side... */}
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center px-8 py-12">
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
            In the following app you as a student will be able to see where you are currently at with your knowledge on design patterns.
          </p>
          <p className="text-gray-700 font-medium">
            You will be able to test yourself with practice quizzes before taking the final exam assessment.
          </p>
        </div>
      </div>

      {/* Signup form side... */}
      <div className="w-full md:w-1/2 bg-teal-600 flex flex-col justify-center px-8 py-12">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-white text-3xl font-bold mb-8">Sign Up</h1>
          {/* First Name */}
          <div className="mb-4">
            <label htmlFor="first_name" className="block text-white font-semibold mb-2">First Name</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              value={formData.first_name}
              onChange={handleChange}
              className="input-field bg-white"
              placeholder="Your first name"
            />
          </div>
          {/* Last Name */}
          <div className="mb-4">
            <label htmlFor="last_name" className="block text-white font-semibold mb-2">Last Name</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              value={formData.last_name}
              onChange={handleChange}
              className="input-field bg-white"
              placeholder="Your last name"
            />
          </div>
          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-white font-semibold mb-2">Email Address</label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field bg-white"
                placeholder="your@email.com"
              />
              <svg className="absolute right-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          {/* Password */}
          <div className="mb-4">
            <label htmlFor="password" className="block text-white font-semibold mb-2">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className="input-field bg-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-teal-600"
              >
                {/* SVGs for show/hide */}
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          {/* Confirm Password */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-white font-semibold mb-2">Confirm Password</label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field bg-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-teal-600"
              >
                {/* SVGs for show/hide */}
                {showConfirmPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleSignup}
            className="w-full btn-primary bg-white text-teal-600 font-bold mb-4 rounded-lg hover:bg-gray-100 hover:shadow focus:outline-none transition cursor-pointer"
            disabled={loading}
          >
            {loading ? "Signing up..." : "SIGN UP"}
          </button>

          <p className="text-center text-white text-sm">
            Have an account already?{" "}
            <button
              onClick={onSwitchToLogin}
              className="font-bold hover:underline rounded hover:text-teal-200 focus:outline-none cursor-pointer px-1"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}