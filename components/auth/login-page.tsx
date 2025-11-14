"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth/login";
import type { FormEvent, ChangeEvent } from "react";

interface LoginPageProps {
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
}

export default function LoginPage({
  onSwitchToSignup,
  onSwitchToForgotPassword,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await loginUser(email, password);

    if (result.error) {
      const errorMsg =
        typeof result.error === "string"
          ? result.error
          : result.error.message || "Login failed";

      if (
        errorMsg.toLowerCase().includes("email") ||
        errorMsg.toLowerCase().includes("user not found") ||
        errorMsg.toLowerCase().includes("invalid email")
      ) {
        setError(
          "Email address not found. Please check your email or sign up."
        );
      } else if (
        errorMsg.toLowerCase().includes("password") ||
        errorMsg.toLowerCase().includes("invalid login credentials")
      ) {
        setError(
          "Incorrect password. Please try again or use 'Forgot Password'."
        );
      } else {
        setError(`Login failed: ${errorMsg}`);
      }
      return;
    }

    const user = result.user;

    if (!user?.role) {
      setError("Login error: User account not properly configured");
      return;
    }

    if (user.role === "educator") {
      router.push("/educator/dashboard");
    } else {
      router.push("/student");
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 bg-teal-600 flex flex-col justify-center px-8 py-12">
        <div className="max-w-md mx-auto w-full">
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
                type="email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                className="input-field bg-white w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="mb-2">
            <label
              htmlFor="password"
              className="block text-white font-semibold mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                className="input-field bg-white w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-500 pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

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
            className="w-full btn-primary bg-white text-teal-600 font-bold py-3 px-4 mb-4 rounded-lg hover:bg-gray-100 hover:shadow focus:outline-none transition cursor-pointer"
            aria-label="Log in"
          >
            LOG IN
          </button>

          <p className="text-center text-white text-sm">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignup}
              className="font-bold hover:underline"
            >
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
            In the following app you as a student will be able to see where you are currently at with your knowledge on the design pattern{" "}
            <strong>OBSERVER</strong>.
          </p>
          <p className="text-gray-700 font-medium">
            You will be able to test yourself with practice quizzes before taking the final exam assessment.
          </p>
        </div>
      </div>
    </div>
  );
}
