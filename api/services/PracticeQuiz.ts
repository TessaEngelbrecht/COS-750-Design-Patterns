// api/services/PracticeQuiz.ts
import { supabase } from "@/lib/supebase";

export interface PracticeQuestion {
  question_id: number;
  section: string;
  bloom_level: string;
  difficulty_level: string;
  question_format: string;
  question_text: string;
  question_data: any;
  correct_answer: {
    answer?: string; 
    answers?: string[]; 
    blanks?: Array<{
      position: number;
      answers: string[];
    }>;
    reason: string;
  };
  points: number;
  is_active: boolean;
}

export interface GetPracticeQuestionsParams {
  limit?: number;
  onlyActive?: boolean;
  sections?: string[];
  bloomLevels?: string[];
  difficultyLevels?: string[];
  formats?: string[];
}

export async function getPracticeQuestions(
  params: GetPracticeQuestionsParams = {}
) {
  const limit = params.limit || 10;

  // Get total count first for random selection
  let countQuery = supabase
    .from("practice_quiz_questions")
    .select("question_id", { count: "exact", head: true });

  if (params.onlyActive !== false) {
    countQuery = countQuery.eq("is_active", true);
  }

  if (params.sections?.length) {
    countQuery = countQuery.in("section", params.sections);
  }

  if (params.bloomLevels?.length) {
    countQuery = countQuery.in("bloom_level", params.bloomLevels);
  }

  if (params.difficultyLevels?.length) {
    countQuery = countQuery.in("difficulty_level", params.difficultyLevels);
  }

  if (params.formats?.length) {
    countQuery = countQuery.in("question_format", params.formats);
  }

  const { count } = await countQuery;

  // Get random questions by ordering randomly and limiting
  let query = supabase.from("practice_quiz_questions").select("*").limit(limit);

  if (params.onlyActive !== false) {
    query = query.eq("is_active", true);
  }

  if (params.sections?.length) {
    query = query.in("section", params.sections);
  }

  if (params.bloomLevels?.length) {
    query = query.in("bloom_level", params.bloomLevels);
  }

  if (params.difficultyLevels?.length) {
    query = query.in("difficulty_level", params.difficultyLevels);
  }

  if (params.formats?.length) {
    query = query.in("question_format", params.formats);
  }

  // Use a random offset for variety
  if (count && count > limit) {
    const maxOffset = count - limit;
    const randomOffset = Math.floor(Math.random() * maxOffset);
    query = query.range(randomOffset, randomOffset + limit - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ Error fetching questions:", error);
    throw error;
  }

  return {
    rows: (data as PracticeQuestion[]) || [],
    count: count || 0,
  };
}

export interface SavePracticeAnswerParams {
  student_id: string;
  question_id: number;
  student_answer: any;
  is_correct: boolean;
  points_earned: number;
  time_spent_seconds: number;
  attempt_number?: number;
}

export async function savePracticeAnswer(params: SavePracticeAnswerParams) {

  try {
    const { data, error } = await supabase
      .from("practice_quiz_results")
      .insert({
        student_id: params.student_id,
        question_id: params.question_id,
        student_answer: params.student_answer,
        is_correct: params.is_correct,
        points_earned: params.points_earned,
        time_spent_seconds: params.time_spent_seconds,
        attempt_number: params.attempt_number || 1,
        answered_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw error;
    }

    return data;
  } catch (err) {
    console.error("❌ Error in savePracticeAnswer:", err);
    throw err;
  }
}
