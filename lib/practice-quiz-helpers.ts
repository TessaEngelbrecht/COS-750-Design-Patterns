export type NormalizedOption = { id: string; text: string };

export const toStringSafe = (v: unknown): string => {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "text" in (v as any))
    return String((v as any).text);
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
};

export const normalizeOptions = (opts: unknown): NormalizedOption[] => {
  if (!Array.isArray(opts)) return [];
  return opts.map((o, i) => {
    if (typeof o === "string")
      return { id: String.fromCharCode(65 + i), text: o };
    if (o && typeof o === "object") {
      const id = String((o as any).id ?? String.fromCharCode(65 + i));
      const text = toStringSafe((o as any).text ?? (o as any).label ?? "");
      return { id, text };
    }
    return { id: String.fromCharCode(65 + i), text: String(o ?? "") };
  });
};

export const getCurrentUserId = (): string | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    const { id } = JSON.parse(userStr);
    return id;
  } catch {
    return null;
  }
};

export const checkFillInBlankAnswer = (
  userBlanks: Record<number, string>,
  correctAnswer: any
): boolean => {
  if (!correctAnswer?.blanks) return false;

  return correctAnswer.blanks.every((blank: any) => {
    const position = blank.position;
    const userAnswer = userBlanks[position]?.trim().toLowerCase();
    const acceptableAnswers = blank.answers.map((a: string) => a.toLowerCase());
    return acceptableAnswers.includes(userAnswer);
  });
};

export const checkSelectMultipleAnswer = (
  userAnswers: string[],
  correctAnswer: any
): boolean => {
  if (!correctAnswer?.answers || !userAnswers) return false;
  const userSorted = [...userAnswers].sort();
  const correctSorted = [...correctAnswer.answers].sort();
  return (
    userSorted.length === correctSorted.length &&
    userSorted.every((ans, idx) => ans === correctSorted[idx])
  );
};
