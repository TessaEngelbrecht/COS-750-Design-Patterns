import { supabase } from "@/lib/supebase";

export async function getStudentIdByEmail(email: string) {
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("email", email.trim())
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}

export async function hasFinalResults(studentId: string) {
  console.log("Checking final results for student ID:", studentId);
  const { count, error } = await supabase
    .from("final_quiz_results")
    .select("result_id", { head: true, count: "exact" })
    .eq("student_id", studentId);

  if (error) throw error;
  return (count ?? 0) > 0;
}
