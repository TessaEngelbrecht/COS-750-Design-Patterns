import { supabase } from "@/lib/supebase";

// Fetch dropdown options
export async function getQuestionMetadata() {
  try {
    const [bloomLevels, difficultyLevels, sections, formats, quizTypes, topics] = await Promise.all([
      supabase.from("bloom_level").select("id, level").order("level"),
      supabase.from("difficulty_level").select("id, difficulty_level").order("difficulty_level"),
      supabase.from("sections").select("id, section").order("section"),
      supabase.from("question_format").select("id, format, description").order("format"),
      supabase.from("quiz_type").select("id, quiz_type").order("quiz_type"),
      supabase.from("learning_topic").select("id, topic").order("topic"),
    ]);

    if (bloomLevels.error) throw bloomLevels.error;
    if (difficultyLevels.error) throw difficultyLevels.error;
    if (sections.error) throw sections.error;
    if (formats.error) throw formats.error;
    if (quizTypes.error) throw quizTypes.error;
    if (topics.error) throw topics.error;

    return {
      bloomLevels: bloomLevels.data || [],
      difficultyLevels: difficultyLevels.data || [],
      sections: sections.data || [],
      formats: formats.data || [],
      quizTypes: quizTypes.data || [],
      topics: topics.data || [],
    };
  } catch (error: any) {
    console.error("❌ Error fetching question metadata:", error);
    throw new Error("Failed to load question metadata: " + (error.message || error));
  }
}

export interface CreateQuestionParams {
  format_id: string;
  difficulty_id: string;
  bloom_id: string;
  section_id: string;
  author_id: string;
  question_text: string;
  question_data: any;
  correct_answer: any;
  points: number;
  quiz_type_ids: string[]; // Can be practice, final, or both
  topic_ids: string[];
}

export async function createQuestion(params: CreateQuestionParams) {
  try {
    // 1. Insert into question table
    const { data: questionData, error: questionError } = await supabase
      .from("question")
      .insert({
        format_id: params.format_id,
        difficulty_id: params.difficulty_id,
        bloom_id: params.bloom_id,
        section_id: params.section_id,
        author_id: params.author_id,
        is_active: true,
      })
      .select()
      .single();

    if (questionError) {
      console.error("❌ Error creating question:", questionError);
      throw new Error("Failed to create question: " + questionError.message);
    }

    const questionId = questionData.id;

    // 2. Insert into question_content
    const { error: contentError } = await supabase
      .from("question_content")
      .insert({
        question_id: questionId,
        question_text: params.question_text,
        question_data: params.question_data,
        correct_answer: params.correct_answer,
        points: params.points,
      });

    if (contentError) {
      console.error("❌ Error creating question content:", contentError);
      throw new Error("Failed to create question content: " + contentError.message);
    }

    // 3. Insert into question_quiz_type (practice/final)
    if (params.quiz_type_ids.length > 0) {
      const quizTypeInserts = params.quiz_type_ids.map((quizTypeId) => ({
        question_id: questionId,
        quiz_type_id: quizTypeId,
      }));

      const { error: quizTypeError } = await supabase
        .from("question_quiz_type")
        .insert(quizTypeInserts);

      if (quizTypeError) {
        console.error("❌ Error linking quiz types:", quizTypeError);
        throw new Error("Failed to link quiz types: " + quizTypeError.message);
      }
    }

    // 4. Insert into question_topic
    if (params.topic_ids.length > 0) {
      const topicInserts = params.topic_ids.map((topicId) => ({
        question_id: questionId,
        topic_id: topicId,
      }));

      const { error: topicError } = await supabase
        .from("question_topic")
        .insert(topicInserts);

      if (topicError) {
        console.error("❌ Error linking topics:", topicError);
        throw new Error("Failed to link topics: " + topicError.message);
      }
    }

    return { success: true, questionId };
  } catch (error: any) {
    console.error("❌ Error in createQuestion:", error);
    throw error;
  }
}

// Fetch all questions with full details
export async function getAllQuestions() {
  try {
    const { data, error } = await supabase
      .from("question")
      .select(`
        id,
        is_active,
        created_at,
        format:question_format(id, format),
        difficulty:difficulty_level(id, difficulty_level),
        bloom:bloom_level(id, level),
        section:sections(id, section),
        content:question_content(question_text, question_data, correct_answer, points),
        quiz_types:question_quiz_type(quiz_type:quiz_type(id, quiz_type)),
        topics:question_topic(topic:learning_topic(id, topic))
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching questions:", error);
      throw new Error("Failed to fetch questions: " + error.message);
    }

    return data || [];
  } catch (error: any) {
    console.error("❌ Error in getAllQuestions:", error);
    throw error;
  }
}