export type FinalQuizQuestion = {
  question_id: number
  pattern_type: string
  section: 'Theory & Concepts' | 'UML Diagrams' | 'Code Implementation' | 'Pattern Participants/Relationships'
  bloom_level: 'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create'
  difficulty_level: 'Easy' | 'Medium' | 'Hard'
  question_format: 'multiple-choice' | 'select-multiple' | 'fill-in-blank' | 'identify-error' | 'uml-interactive' | 'drag-drop'
  question_text: string
  question_data: any
  correct_answer: any
  points: number | null
  created_at: string | null
  updated_at: string | null
  is_active: boolean | null
}
