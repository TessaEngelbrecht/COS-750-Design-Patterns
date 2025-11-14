// hooks/useReflectionForm.ts (CLIENT ONLY)
"use client";

import { useState, useEffect } from "react";

export function useReflectionForm(patternId: string) {
  const [form, setForm] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [scaleOptions, setScaleOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/reflection/form?pattern=${patternId}`);
        if (!res.ok) throw new Error("Failed to load reflection form");

        const data = await res.json();
        setForm(data.form);
        setQuestions(data.questions);
        setScaleOptions(data.scaleOptions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (patternId) load();
  }, [patternId]);

  return { form, questions, scaleOptions, loading, error };
}
