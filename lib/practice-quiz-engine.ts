import { supabase } from "@/lib/supebase";

const PRACTICE_SECTIONS = [
  "Theory & Concepts",
  "UML Diagrams",
  "Code Implementation",
  "Pattern Participants/Relationships",
];

type BloomLevel =
  | "Remember"
  | "Understand"
  | "Apply"
  | "Analyze"
  | "Evaluate"
  | "Create";

export interface PracticeQuestion {
  question_id: number;
  section: string;
  bloom_level: BloomLevel;
  difficulty_level: "Easy" | "Medium" | "Hard";
  question_format: string;
  question_text: string;
  question_data: any;
  correct_answer: any;
  points: number;
  is_active: boolean;
}

interface PreQuizInfo {
  experience: "advanced" | "intermediate" | "beginner" | "novice";
  strugglingSections: string[];
}

interface PracticeQuizEngineParams {
  studentId: string;
  excludeQuestionIds?: number[];
  usePreviousResults?: boolean;
}

interface PastPerformance {
  weakSections: string[];
  weakBloomLevels: BloomLevel[];
  weakDifficulties: string[];
  overallScore: number;
}

export async function generatePracticeQuizEngine({
  studentId,
  excludeQuestionIds = [],
  usePreviousResults,
}: PracticeQuizEngineParams): Promise<PracticeQuestion[]> {
  console.log("\n🎯 [Quiz Engine] Starting quiz generation...");
  console.log(`Student ID: ${studentId}`);
  console.log(`Retake mode: ${usePreviousResults ? "YES" : "NO"}`);
  console.log(`Excluding ${excludeQuestionIds.length} previous questions`);

  // 1. Get pre-quiz info
  const { experience, strugglingSections } = await getPreQuizInfo(studentId);
  console.log(`📊 Experience level: ${experience}`);
  console.log(
    `📊 Struggling sections: ${
      strugglingSections.join(", ") || "None specified"
    }`
  );

  // 2. Analyze past performance if retake
  const pastPerformance = usePreviousResults
    ? await getPastPracticePerformance(studentId, excludeQuestionIds)
    : null;

  if (pastPerformance) {
    console.log("\n📈 Past Performance Analysis:");
    console.log(`   Overall Score: ${pastPerformance.overallScore}%`);
    console.log(
      `   Weak Sections: ${pastPerformance.weakSections.join(", ") || "None"}`
    );
    console.log(
      `   Weak Bloom Levels: ${
        pastPerformance.weakBloomLevels.join(", ") || "None"
      }`
    );
    console.log(
      `   Weak Difficulties: ${
        pastPerformance.weakDifficulties.join(", ") || "None"
      }`
    );
  }

  // 3. Fetch all active questions (exclude specified)
  let questions = await fetchAllActivePracticeQuestions(excludeQuestionIds);
  console.log(`\n📚 Available question pool: ${questions.length} questions`);

  // 4. Select one from each section (guaranteed)
  let guaranteed: PracticeQuestion[] = [];
  console.log("\n✅ Guaranteeing coverage of all sections:");

  for (const section of PRACTICE_SECTIONS) {
    let filtered = questions.filter((q) => q.section === section);

    // If retake, prioritize weak bloom levels for this section
    if (pastPerformance && pastPerformance.weakBloomLevels.length > 0) {
      const weakFiltered = filtered.filter((q) =>
        pastPerformance.weakBloomLevels.includes(q.bloom_level)
      );
      if (weakFiltered.length > 0) {
        filtered = weakFiltered;
      }
    }

    if (filtered.length > 0) {
      const toAdd = randomOne(filtered);
      guaranteed.push(toAdd);
      questions = questions.filter((q) => q.question_id !== toAdd.question_id);
      console.log(
        `   ✓ ${section}: Question ${toAdd.question_id} (${toAdd.bloom_level}, ${toAdd.difficulty_level})`
      );
    }
  }

  // 5. Select code implementation extra if inexperienced
  let codeImplCount =
    experience === "novice" || experience === "beginner"
      ? 6 // Changed from 8 to 6
      : experience === "intermediate"
      ? 4
      : 2;

  const alreadyCodeImpl = guaranteed.filter(
    (q) => q.section === "Code Implementation"
  ).length;
  let codeImplNeeded = Math.max(0, codeImplCount - alreadyCodeImpl);

  console.log(
    `\n💻 Code Implementation allocation: ${codeImplCount} total (${alreadyCodeImpl} already guaranteed, ${codeImplNeeded} more needed)`
  );

  const codeImplPool = questions.filter(
    (q) => q.section === "Code Implementation"
  );
  const codeImplExtra = chooseRandom(codeImplPool, codeImplNeeded);
  codeImplExtra.forEach((q) => {
    questions = questions.filter((q2) => q2.question_id !== q.question_id);
    console.log(`   ✓ Added Code Implementation: Question ${q.question_id}`);
  });

  // 6. Fill with struggling sections
  const remainingToPick = 15 - guaranteed.length - codeImplExtra.length;
  let strugglingRest: PracticeQuestion[] = [];

  console.log(`\n🎯 Filling ${remainingToPick} remaining slots...`);

  if (remainingToPick > 0) {
    // Combine pre-quiz struggling sections with past performance weak sections
    const targetSections =
      usePreviousResults && pastPerformance
        ? [...new Set([...strugglingSections, ...pastPerformance.weakSections])]
        : strugglingSections;

    if (targetSections.length > 0) {
      let pool = questions.filter((q) => targetSections.includes(q.section));

      // Further filter by weak bloom levels if available
      if (pastPerformance && pastPerformance.weakBloomLevels.length > 0) {
        const bloomFiltered = pool.filter((q) =>
          pastPerformance.weakBloomLevels.includes(q.bloom_level)
        );
        if (bloomFiltered.length > 0) {
          pool = bloomFiltered;
        }
      }

      strugglingRest = chooseRandom(pool, remainingToPick);
      strugglingRest.forEach((q) => {
        questions = questions.filter((q2) => q2.question_id !== q.question_id);
      });
      console.log(
        `   ✓ Added ${strugglingRest.length} from struggling sections`
      );
    }
  }

  // 7. Fill remaining with diverse questions
  let fillRest: PracticeQuestion[] = [];
  const currentQuestions = [...guaranteed, ...codeImplExtra, ...strugglingRest];
  const numNeeded = 15 - currentQuestions.length;

  if (numNeeded > 0) {
    console.log(`   ✓ Filling ${numNeeded} more with diverse questions`);
    let pool = questions;

    // If retake, prioritize weak areas
    if (pastPerformance) {
      if (pastPerformance.weakBloomLevels.length > 0) {
        const bloomPool = pool.filter((q) =>
          pastPerformance.weakBloomLevels.includes(q.bloom_level)
        );
        if (bloomPool.length >= numNeeded) {
          pool = bloomPool;
        }
      }
    }

    fillRest = chooseRandom(pool, numNeeded);
  }

  const selected = [
    ...guaranteed,
    ...codeImplExtra,
    ...strugglingRest,
    ...fillRest,
  ];
  const finalSelection = selected.slice(0, 15);

  // 8. Log final breakdown
  logQuizSelection(finalSelection, studentId, usePreviousResults || false);

  return finalSelection;
}

// ==== Helper Functions ====

async function getPreQuizInfo(studentId: string): Promise<PreQuizInfo> {
  // Get background experience (Q2)
  const expResult = await supabase
    .from("pre_quiz_results")
    .select("student_answer, answered_at")
    .eq("student_id", studentId)
    .eq("question_id", 2)
    .order("answered_at", { ascending: false })
    .limit(1)
    .single();

  const expVal = expResult.data?.student_answer?.answer || "D";

  const experienceMap: any = {
    A: "advanced",
    B: "intermediate",
    C: "beginner",
    D: "novice",
  };

  // Get struggling sections (Q3)
  const secResult = await supabase
    .from("pre_quiz_results")
    .select("student_answer, answered_at")
    .eq("student_id", studentId)
    .eq("question_id", 3)
    .order("answered_at", { ascending: false })
    .limit(1)
    .single();

  const sectionMap: any = {
    A: "Theory & Concepts",
    B: "UML Diagrams",
    C: "Code Implementation",
    D: "Pattern Participants/Relationships",
  };

  const selectedIds = secResult.data?.student_answer?.answers || [];
  const strugglingSections = selectedIds.map((id: string) => sectionMap[id]);

  return {
    experience: experienceMap[expVal] || "novice",
    strugglingSections,
  };
}

async function fetchAllActivePracticeQuestions(
  excludeIds: number[]
): Promise<PracticeQuestion[]> {
  let query = supabase
    .from("practice_quiz_questions")
    .select("*")
    .eq("is_active", true);

  if (excludeIds.length > 0) {
    query = query.not("question_id", "in", `(${excludeIds.join(",")})`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as PracticeQuestion[];
}

async function getPastPracticePerformance(
  studentId: string,
  prevQuizIds: number[]
): Promise<PastPerformance> {
  // Fetch the last quiz results
  const { data: results, error } = await supabase
    .from("practice_quiz_results")
    .select("question_id, is_correct, points_earned")
    .eq("student_id", studentId)
    .in("question_id", prevQuizIds);

  if (error || !results || results.length === 0) {
    return {
      weakSections: [],
      weakBloomLevels: [],
      weakDifficulties: [],
      overallScore: 0,
    };
  }

  // Fetch question details for analysis
  const questionIds = results.map((r) => r.question_id);
  const { data: questions } = await supabase
    .from("practice_quiz_questions")
    .select("question_id, section, bloom_level, difficulty_level")
    .in("question_id", questionIds);

  if (!questions) {
    return {
      weakSections: [],
      weakBloomLevels: [],
      weakDifficulties: [],
      overallScore: 0,
    };
  }

  // Calculate performance by section, bloom, difficulty
  const sectionPerf: Record<string, { correct: number; total: number }> = {};
  const bloomPerf: Record<string, { correct: number; total: number }> = {};
  const diffPerf: Record<string, { correct: number; total: number }> = {};

  let totalCorrect = 0;

  results.forEach((result) => {
    const question = questions.find(
      (q) => q.question_id === result.question_id
    );
    if (!question) return;

    if (result.is_correct) totalCorrect++;

    // Track by section
    if (!sectionPerf[question.section]) {
      sectionPerf[question.section] = { correct: 0, total: 0 };
    }
    sectionPerf[question.section].total++;
    if (result.is_correct) sectionPerf[question.section].correct++;

    // Track by bloom
    if (!bloomPerf[question.bloom_level]) {
      bloomPerf[question.bloom_level] = { correct: 0, total: 0 };
    }
    bloomPerf[question.bloom_level].total++;
    if (result.is_correct) bloomPerf[question.bloom_level].correct++;

    // Track by difficulty
    if (!diffPerf[question.difficulty_level]) {
      diffPerf[question.difficulty_level] = { correct: 0, total: 0 };
    }
    diffPerf[question.difficulty_level].total++;
    if (result.is_correct) diffPerf[question.difficulty_level].correct++;
  });

  // Identify weak areas (< 60% correct)
  const weakSections = Object.entries(sectionPerf)
    .filter(([_, perf]) => perf.correct / perf.total < 0.6)
    .map(([section]) => section);

  const weakBloomLevels = Object.entries(bloomPerf)
    .filter(([_, perf]) => perf.correct / perf.total < 0.6)
    .map(([bloom]) => bloom as BloomLevel);

  const weakDifficulties = Object.entries(diffPerf)
    .filter(([_, perf]) => perf.correct / perf.total < 0.6)
    .map(([diff]) => diff);

  const overallScore = Math.round((totalCorrect / results.length) * 100);

  return {
    weakSections,
    weakBloomLevels,
    weakDifficulties,
    overallScore,
  };
}

function randomOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chooseRandom<T>(arr: T[], n: number): T[] {
  if (n >= arr.length) return [...arr];
  const shuffled = arr.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function logQuizSelection(
  questions: PracticeQuestion[],
  studentId: string,
  isRetake: boolean
) {
  const sectionCounts: Record<string, number> = {};
  const bloomCounts: Record<string, number> = {};
  const diffCounts: Record<string, number> = {};

  questions.forEach((q) => {
    sectionCounts[q.section] = (sectionCounts[q.section] || 0) + 1;
    bloomCounts[q.bloom_level] = (bloomCounts[q.bloom_level] || 0) + 1;
    diffCounts[q.difficulty_level] = (diffCounts[q.difficulty_level] || 0) + 1;
  });

  console.log(`\n📊 [Quiz Engine] Final Quiz Distribution for ${studentId}`);
  console.log(`Mode: ${isRetake ? "RETAKE (Adaptive)" : "FIRST ATTEMPT"}`);
  console.log("\n📚 By Section:");
  console.table(sectionCounts);
  console.log("\n🎓 By Bloom Level:");
  console.table(bloomCounts);
  console.log("\n⚡ By Difficulty:");
  console.table(diffCounts);
  console.log("\n✅ Quiz generation complete!\n");
}
