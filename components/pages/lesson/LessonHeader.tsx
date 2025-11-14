"use client";

export default function LessonHeader() {
  return (
    <main className="container px-6 pt-8">
      <div>
        <h1 className="text-3xl font-bold text-balance text-foreground mb-2">
          Master Design Patterns
        </h1>
        <p className="text-md text-muted-foreground">
          Learn industry-standard design patterns to write better, more
          maintainable code. Explore observer, creational, structural, and
          behavioral patterns with practical examples.
        </p>
      </div>
    </main>
  );
}
