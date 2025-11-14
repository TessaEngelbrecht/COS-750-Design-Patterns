"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Card } from "@/components/ui/card";
import {
  ArrowOutward,
  AllInclusive,
  AutoAwesome,
  Psychology,
  Visibility,
} from "@mui/icons-material";
import LessonHeader from "./lesson/LessonHeader";
import { Spinner } from "../ui/spinner";

interface ApiPattern {
  id: string;
  design_pattern: string;
  description: string;
  active: boolean;
  icon?: string;
}

interface Pattern {
  id: string;
  design_pattern: string;
  description: string;
  active: boolean;
  icon?: ComponentType<{ className?: string }>;
}

interface PatternSelectionPageProps {
  onSelect: (patternId: string) => void;
}

const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Adapter: AllInclusive,
  Decorator: AutoAwesome,
  Strategy: Psychology,
  Observer: Visibility,
};

export default function PatternSelectionPage({
  onSelect,
}: PatternSelectionPageProps) {
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatterns() {
      const res = await fetch("/api/patterns");
      const data = await res.json();

      const apiPatterns: ApiPattern[] = data.patterns || [];

      const mappedPatterns: Pattern[] = apiPatterns.map((p) => ({
        ...p,
        icon: iconMap[p.design_pattern] ?? AllInclusive, // default icon if none found
      }));

      setPatterns(mappedPatterns);
      setLoading(false);
    }
    loadPatterns();
  }, []);

  if (loading) return <Spinner />;

  const sortedPatterns = [...patterns].sort((a, b) => {
    if (a.active && !b.active) return -1;
    if (!a.active && b.active) return 1;
    return a.design_pattern.localeCompare(b.design_pattern);
  });

  return (
    <>
      <LessonHeader />
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedPatterns.map((p) => {
          const isActive = p.active;
          const Icon = p.icon;

          return (
            <Card
              key={p.id}
              className={`p-6 transition ${
                isActive
                  ? "hover:shadow-xl cursor-pointer"
                  : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              }`}
              onClick={() => {
                if (isActive) onSelect(p.id);
              }}
            >
              <h2 className="text-xl font-bold mb-2">
                {Icon && (
                  <Icon
                    className={`w-10 h-10 mr-3 ${
                      isActive ? "text-primary" : "text-gray-400"
                    }`}
                  />
                )}

                {p.design_pattern}
              </h2>
              <p className="text-sm">{p.description}</p>

              {isActive ? (
                <div className="mt-4 flex items-center gap-2 text-primary group-hover:gap-3 transition-all font-semibold text-sm">
                  Learn more
                  <ArrowOutward className="w-4 h-4" />
                </div>
              ) : (
                <div className="mt-4 text-xs font-semibold text-gray-400">
                  Future work
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
