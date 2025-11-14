"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SelfReflectionPageProps {
  patternId: string;
  userId: string;
  onNext: () => void;
}

export default function SelfReflectionPage({
  patternId,
  userId,
  onNext,
}: SelfReflectionPageProps) {
  const [formId, setFormId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<
    Array<{
      id: string; // question_instance_id
      text: string;
      scaleOptions: any[];
    }>
  >([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ----------------------------------------------
  // LOAD FORM + QUESTIONS
  // ----------------------------------------------
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

      // Convert API shape → UI shape
      const q = data.questions.map((q: any) => ({
        id: q.id,
        text: q.generated_text,
        scaleOptions: data.scaleOptions,
      }));

      setQuestions(q);
      setLoading(false);
    }

    load();
  }, [patternId]);

  const isComplete =
    questions.length > 0 &&
    Object.keys(answers).length === questions.length;

  // ----------------------------------------------
  // SUBMIT FORM
  // ----------------------------------------------
  async function handleSubmit() {
    if (!formId) return;

    setSubmitting(true);

    const res = await fetch("/api/reflection/submit", {
      method: "POST",
      body: JSON.stringify({
        formId: formId,
        patternId: patternId,
        answers: answers,
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
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-teal-900">Self-Reflection</h1>
        <p className="text-teal-700 text-lg">
          Before starting this pattern, please reflect on your current understanding.
        </p>

        {questions.map((q) => (
          <Card key={q.id} className="p-6 border-teal-200">
            <h3 className="text-lg font-semibold mb-4">{q.text}</h3>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {q.scaleOptions.map((opt: any) => {
                const selected = answers[q.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                    }
                    className={[
                      "py-4 px-3 rounded-lg border-2 transition-all transform",
                      "hover:scale-110",
                      selected
                        ? "border-teal-600 bg-teal-100 shadow-lg"
                        : "border-gray-300 bg-white hover:border-teal-400",
                    ].join(" ")}
                  >
                    <div className="text-3xl mb-2">{opt.emoji}</div>
                    <div className="text-xs font-medium text-gray-700">
                      {opt.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        ))}

        <Button
          onClick={handleSubmit}
          disabled={!isComplete || submitting}
          className="w-full py-6 text-lg bg-teal-700 text-white hover:bg-teal-800 font-bold rounded-lg"
        >
          {submitting ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
