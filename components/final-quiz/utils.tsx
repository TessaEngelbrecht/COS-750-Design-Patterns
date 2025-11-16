// components/final-quiz/utils.tsx
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

export const normalizeWord = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\(\s*\)$/, "");

export function coerceMultiline(s: string): string {
  if (!s) return "";
  let t = s;

  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    try {
      if (t.startsWith('"') && t.endsWith('"')) return JSON.parse(t);
    } catch {}
    t = t.slice(1, -1);
  }

  if (!t.includes("\n") && /\\n/.test(t)) {
    t = t.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
  }
  t = t.replace(/\\t/g, "\t");
  return t;
}

export function CodeBlock({ code }: { code: string }) {
  const raw = typeof code === "string" ? code : "";
  const text = coerceMultiline(raw).replace(/\r/g, "");
  const lines = text.split("\n");
  const digits = String(lines.length).length;
  const numbered = lines
    .map((ln, i) => `${String(i + 1).padStart(digits, " ")}. ${ln ?? ""}`)
    .join("\n");
  return (
    <pre className="m-0 whitespace-pre rounded-lg bg-teal-700 p-3 font-mono text-sm leading-5 text-white overflow-x-auto">
      <code>{numbered}</code>
    </pre>
  );
}
