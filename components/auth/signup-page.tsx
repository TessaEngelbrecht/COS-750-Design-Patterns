"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supebase";
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Sign up function with Supabase
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);

    //  User creation in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      alert(`Sign up error: ${error.message}`);
      setLoading(false);
      return;
    }

    // User insertion in the user table
    if (data?.user) {
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          auth_id: data.user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: "student",
          has_seen_self_reflection: false,
        },
      ]);

      if (dbError) {
        alert(`Database error: ${dbError.message}`);
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: "student",
        })
      );

      setLoading(false);
      router.push("/student");
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col-reverse md:flex-row">
      {/* Left Side - Illustration */}
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
            In the following app you as a student will be able to see where you
            are currently at with your knowledge on the design pattern{" "}
            <strong>OBSERVER</strong>.
          </p>
          <p className="text-gray-700 font-medium">
            You will be able to test yourself with practice quizzes before
            taking the final exam assessment.
          </p>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full md:w-1/2 bg-teal-600 flex flex-col justify-center px-8 py-12">
        <div className="max-w-md mx-auto w-full">
          <h1 className="text-white text-3xl font-bold mb-8">Sign Up</h1>

          <div className="mb-4">
            <label
              htmlFor="first_name"
              className="block text-white font-semibold mb-2"
            >
              First Name
            </label>
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
          <div className="mb-4">
            <label
              htmlFor="last_name"
              className="block text-white font-semibold mb-2"
            >
              Last Name
            </label>
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

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-white font-semibold mb-2"
            >
              Email Address
            </label>
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

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-white font-semibold mb-2"
            >
              Password
            </label>
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
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
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

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-white font-semibold mb-2"
            >
              Confirm Password
            </label>
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
                {showConfirmPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fillRule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
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
