"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PatternSelectionPageProps {
  onSelect: (patternId: string) => void;
}

export default function PatternSelectionPage({ onSelect }: PatternSelectionPageProps) {
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatterns() {
      const res = await fetch("/api/patterns");
      const data = await res.json();
      setPatterns(data.patterns || []);
      setLoading(false);
    }
    loadPatterns();
  }, []);

  if (loading) return <div className="p-6">Loading patterns…</div>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {patterns.map((p) => (
        <Card 
          key={p.id} 
          className="p-6 hover:shadow-xl cursor-pointer"
          onClick={() => onSelect(p.id)}
        >
          <h2 className="text-xl font-bold mb-2">{p.design_pattern}</h2>
          <p className="text-sm text-gray-600">{p.description}</p>
        </Card>
      ))}
    </div>
  );
}
