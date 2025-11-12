import {
  getPracticeQuestions,
  getPreQuizResultsForStudent,
  getPracticeQuizResultsForStudent,
  type PracticeQuestion,
} from "@/api/services/PracticeQuiz";

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
  // 1. Get pre-quiz info
  const { experience, strugglingSections } = await getPreQuizInfo(studentId);

  // 2. Analyze past performance if retake
  const pastPerformance = usePreviousResults
    ? await getPastPracticePerformance(studentId, excludeQuestionIds)
    : null;

  // 3. Fetch all active questions (exclude specified)
  let questions = await fetchAllActivePracticeQuestions(excludeQuestionIds);

  // 4. Select one from each section (guaranteed)
  let guaranteed: PracticeQuestion[] = [];

  for (const section of PRACTICE_SECTIONS) {
    let filtered = questions.filter((q) => q.section === section);

    // If retake, prioritize weak bloom levels for this section
    if (pastPerformance && pastPerformance.weakBloomLevels.length > 0) {
      const weakFiltered = filtered.filter((q) =>
        pastPerformance.weakBloomLevels.includes(q.bloom_level as BloomLevel)
      );
      if (weakFiltered.length > 0) {
        filtered = weakFiltered;
      }
    }

    if (filtered.length > 0) {
      const toAdd = randomOne(filtered);
      guaranteed.push(toAdd);
      questions = questions.filter((q) => q.question_id !== toAdd.question_id);
    }
  }

  // 5. Select code implementation extra if inexperienced
  let codeImplCount =
    experience === "novice" || experience === "beginner"
      ? 6
      : experience === "intermediate"
      ? 4
      : 2;

  const alreadyCodeImpl = guaranteed.filter(
    (q) => q.section === "Code Implementation"
  ).length;
  let codeImplNeeded = Math.max(0, codeImplCount - alreadyCodeImpl);

  const codeImplPool = questions.filter(
    (q) => q.section === "Code Implementation"
  );
  const codeImplExtra = chooseRandom(codeImplPool, codeImplNeeded);
  codeImplExtra.forEach((q) => {
    questions = questions.filter((q2) => q2.question_id !== q.question_id);
  });

  // 6. Fill with struggling sections
  const remainingToPick = 15 - guaranteed.length - codeImplExtra.length;
  let strugglingRest: PracticeQuestion[] = [];

  if (remainingToPick > 0) {
    const targetSections =
      usePreviousResults && pastPerformance
        ? [...new Set([...strugglingSections, ...pastPerformance.weakSections])]
        : strugglingSections;

    if (targetSections.length > 0) {
      let pool = questions.filter((q) => targetSections.includes(q.section));

      if (pastPerformance && pastPerformance.weakBloomLevels.length > 0) {
        const bloomFiltered = pool.filter((q) =>
          pastPerformance.weakBloomLevels.includes(q.bloom_level as BloomLevel)
        );
        if (bloomFiltered.length > 0) {
          pool = bloomFiltered;
        }
      }

      strugglingRest = chooseRandom(pool, remainingToPick);
      strugglingRest.forEach((q) => {
        questions = questions.filter((q2) => q2.question_id !== q.question_id);
      });
    }
  }

  // 7. Fill remaining with diverse questions
  let fillRest: PracticeQuestion[] = [];
  const currentQuestions = [...guaranteed, ...codeImplExtra, ...strugglingRest];
  const numNeeded = 15 - currentQuestions.length;

  if (numNeeded > 0) {
    let pool = questions;

    if (pastPerformance) {
      if (pastPerformance.weakBloomLevels.length > 0) {
        const bloomPool = pool.filter((q) =>
          pastPerformance.weakBloomLevels.includes(q.bloom_level as BloomLevel)
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
  // Call service function instead of direct DB call
  const preQuizResults = await getPreQuizResultsForStudent(studentId);

  // Find question 2 (experience) and question 3 (struggling sections)
  const q2Result = preQuizResults.find((r) => r.question_id === 2);
  const q3Result = preQuizResults.find((r) => r.question_id === 3);

  const expVal = q2Result?.student_answer?.answer || "D";

  const experienceMap: Record<string, PreQuizInfo["experience"]> = {
    A: "advanced",
    B: "intermediate",
    C: "beginner",
    D: "novice",
  };

  const sectionMap: Record<string, string> = {
    A: "Theory & Concepts",
    B: "UML Diagrams",
    C: "Code Implementation",
    D: "Pattern Participants/Relationships",
  };

  const selectedIds = q3Result?.student_answer?.answers || [];
  const strugglingSections = selectedIds.map((id: string) => sectionMap[id]);

  return {
    experience: experienceMap[expVal] || "novice",
    strugglingSections,
  };
}

async function fetchAllActivePracticeQuestions(
  excludeIds: number[]
): Promise<PracticeQuestion[]> {
  // Use service function to fetch all questions
  const result = await getPracticeQuestions({
    onlyActive: true,
    limit: 1000, // Get all active questions
  });

  // Filter out excluded IDs on client side
  let questions = result.rows;
  if (excludeIds.length > 0) {
    questions = questions.filter((q) => !excludeIds.includes(q.question_id));
  }

  return questions;
}

async function getPastPracticePerformance(
  studentId: string,
  prevQuizIds: number[]
): Promise<PastPerformance> {
  if (prevQuizIds.length === 0) {
    return {
      weakSections: [],
      weakBloomLevels: [],
      weakDifficulties: [],
      overallScore: 0,
    };
  }

  // Call service function to get past results
  const results = await getPracticeQuizResultsForStudent(
    studentId,
    prevQuizIds
  );

  if (!results || results.length === 0) {
    return {
      weakSections: [],
      weakBloomLevels: [],
      weakDifficulties: [],
      overallScore: 0,
    };
  }

  // Fetch question details for the answered questions
  const questionIds = results.map((r) => r.question_id);
  const questionsResult = await getPracticeQuestions({
    onlyActive: true,
    limit: 1000,
  });

  const questions = questionsResult.rows.filter((q) =>
    questionIds.includes(q.question_id)
  );

  if (!questions.length) {
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

//   console.log(`\n📊 [Quiz Engine] Final Quiz Distribution for ${studentId}`);
//   console.log(`Mode: ${isRetake ? "RETAKE (Adaptive)" : "FIRST ATTEMPT"}`);
//   console.log("\n📚 By Section:");
//   console.table(sectionCounts);
//   console.log("\n🎓 By Bloom Level:");
//   console.table(bloomCounts);
//   console.log("\n⚡ By Difficulty:");
//   console.table(diffCounts);
//   console.log("\n✅ Quiz generation complete!\n");
}
