"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supebase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SelfReflectionPageProps {
  onNext: () => void;
}

export default function SelfReflectionPage({ onNext }: SelfReflectionPageProps) {
  const [cplusplus, setCplusplus] = useState<string>("");
  const [observerPattern, setObserverPattern] = useState<string>("");
  const [classes, setClasses] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const emojiOptions = [
    { value: "very-low", emoji: "😢", label: "Very Low" },
    { value: "low", emoji: "😞", label: "Low" },
    { value: "nervous", emoji: "😟", label: "Nervous" },
    { value: "neutral", emoji: "😐", label: "Neutral" },
    { value: "good", emoji: "🙂", label: "Good" },
    { value: "very-good", emoji: "😄", label: "Very Good" },
  ];

  // Safely fetch user from localStorage
  const getUserFromLocalStorage = (): { id: string } | null => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return null;
      const user = JSON.parse(rawUser);
      if (!user?.id || typeof user.id !== "string") return null;
      return user as { id: string };
    } catch {
      return null;
    }
  };

  // Optionally, show an error immediately if the user data is not present
  useEffect(() => {
    if (!getUserFromLocalStorage()) {
      setError("User not found! Please sign in again.");
    }
  }, []);

  const isComplete = Boolean(cplusplus && observerPattern && classes);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const user = getUserFromLocalStorage();
      if (!user) throw new Error("User not found in localStorage.");

      // Save answers
      const { error: answerError } = await supabase
        .from("self_reflection_answers")
        .insert([
          {
            user_id: user.id,
            cplusplus_answer: cplusplus,
            observer_pattern_answer: observerPattern,
            classes_answer: classes,
          },
        ]);
      if (answerError) throw answerError;

      // Update 'has_seen_self_reflection'
      const { error: supabaseError } = await supabase
        .from("users")
        .update({ has_seen_self_reflection: true })
        .eq("id", user.id);
      if (supabaseError) throw supabaseError;

      // Success
      onNext();
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 border-2 border-teal-200">
          <h1 className="text-4xl font-bold text-teal-900 mb-2">Self-Reflection</h1>
          <p className="text-lg text-teal-700 mb-8">Before we begin, let's understand where you're starting from.</p>
          
          {/* C++ Confidence */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-foreground mb-6">How confident are you with C++ concepts?</h3>
            <div className="grid grid-cols-6 gap-3">
              {emojiOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCplusplus(option.value)}
                  className={`py-4 px-3 rounded-lg border-2 transition-all transform hover:scale-110 ${
                    cplusplus === option.value
                      ? "border-teal-600 bg-teal-100 shadow-lg"
                      : "border-gray-300 bg-white hover:border-teal-400"
                  }`}
                  disabled={loading}
                >
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Observer Pattern Confidence */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-foreground mb-6">How confident are you with the Observer pattern?</h3>
            <div className="grid grid-cols-6 gap-3">
              {emojiOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setObserverPattern(option.value)}
                  className={`py-4 px-3 rounded-lg border-2 transition-all transform hover:scale-110 ${
                    observerPattern === option.value
                      ? "border-teal-600 bg-teal-100 shadow-lg"
                      : "border-gray-300 bg-white hover:border-teal-400"
                  }`}
                  disabled={loading}
                >
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Lecture Attendance */}
          <div className="mb-10">
            <h3 className="text-xl font-bold text-foreground mb-6">How prepared are you from the lectures?</h3>
            <div className="grid grid-cols-6 gap-3">
              {emojiOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setClasses(option.value)}
                  className={`py-4 px-3 rounded-lg border-2 transition-all transform hover:scale-110 ${
                    classes === option.value
                      ? "border-teal-600 bg-teal-100 shadow-lg"
                      : "border-gray-300 bg-white hover:border-teal-400"
                  }`}
                  disabled={loading}
                >
                  <div className="text-4xl mb-2">{option.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {error && <div className="text-red-500 mb-2 text-center">{error}</div>}

          <Button
            onClick={handleSubmit}
            disabled={!isComplete || loading}
            className="w-full py-6 text-lg bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-400 rounded-lg font-bold"
          >
            {loading ? "Saving..." : "Continue"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
