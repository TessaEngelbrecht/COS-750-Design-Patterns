export interface PracticeQuestion {
  question_id: string;
  question_format: "multiple-choice" | "select-multiple" | "fill-in-blank" | "identify-error";

  // From question_content table
  question_text: string;
  question_data: any;
  correct_answer: any;
  points: number;

  // From joins
  bloom_id: string;
  bloom_level: string;

  difficulty_id: string;
  difficulty: string;

  section_id: string;
  section: string;

  topics: {
    topic_id: string;
    topic: string;
  }[];

  // Engine-generated score
  score: number;
}
