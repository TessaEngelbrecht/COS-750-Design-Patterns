"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SelfReflectionPageProps {
  patternId: string;
  userId: string;
  onNext: () => void;
}

// UUIDs for emojis
const EMOJI_SCALE_OPTIONS = [
  { id: "6ca7ac4a-5619-443c-9c5b-556f23046593", emoji: "😢", label: "Very Low" },
  { id: "aa461edd-300d-4fc6-aecc-90bd3f8e9776", emoji: "😞", label: "Low" },
  { id: "de0f6d52-8d89-4a09-84c5-d82a1e15cb8a", emoji: "😐", label: "Neutral" },
  { id: "c94f097d-d13c-43e8-98fc-02143a2e4462", emoji: "🙂", label: "Good" },
  { id: "95cf0db6-e939-476c-939f-e7de43f0790c", emoji: "😄", label: "Very Good" }
];

export default function SelfReflectionPage({
  patternId,
  userId,
  onNext,
}: SelfReflectionPageProps) {
  const [formId, setFormId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<
    Array<{
      id: string;
      text: string;
      scaleOptions: typeof EMOJI_SCALE_OPTIONS;
    }>
  >([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch(`/api/reflection/form/${patternId}/`);
      const data = await res.json();

      if (!data || data.error) {
        console.error("Reflection form error:", data.error);
        setLoading(false);
        return;
      }

      setFormId(data.form.id);

      // Use the correct scale options (with UUIDs and emojis)
      const q = data.questions.map((q: any) => ({
        id: q.id,
        text: q.generated_text,
        scaleOptions: EMOJI_SCALE_OPTIONS,
      }));

      setQuestions(q);
      setLoading(false);
    }

    load();
  }, [patternId]);

  const isComplete =
    questions.length > 0 &&
    Object.keys(answers).length === questions.length;

  async function handleSubmit() {
    if (!formId) return;
    setSubmitting(true);

    const res = await fetch("/api/reflection/submit", {
      method: "POST",
      body: JSON.stringify({
        formId: formId,
        patternId: patternId,
        answers: answers,
        userId: userId,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!data.success) {
      alert("Error submitting reflection: " + data.error);
      return;
    }

    onNext();
  }

  if (loading) {
    return <div className="p-10 text-center">Loading self-reflection…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 border-2 border-teal-200">
          <h1 className="text-4xl font-bold text-teal-900 mb-2">Self-Reflection</h1>
          <p className="text-lg text-teal-700 mb-8">
            Before we begin, let's understand where you're starting from.
          </p>

          {questions.map((q) => (
            <div key={q.id} className="mb-10">
              <h3 className="text-xl font-bold text-foreground mb-6">{q.text}</h3>
              <div className="grid grid-cols-5 gap-3">
                {q.scaleOptions.map((option) => {
                  const selected = answers[q.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: option.id }))
                      }
                      className={`py-4 px-3 rounded-lg border-2 transition-all transform hover:scale-110 ${
                        selected
                          ? "border-teal-600 bg-teal-100 shadow-lg"
                          : "border-gray-300 bg-white hover:border-teal-400"
                      }`}
                    >
                      <div className="text-4xl mb-2">{option.emoji}</div>
                      <div className="text-xs font-medium text-gray-700">{option.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <Button
            onClick={handleSubmit}
            disabled={!isComplete || submitting}
            className="w-full py-6 text-lg bg-teal-600 text-white hover:bg-teal-700 disabled:bg-gray-400 rounded-lg font-bold"
          >
            {submitting ? "Saving..." : "Continue"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
