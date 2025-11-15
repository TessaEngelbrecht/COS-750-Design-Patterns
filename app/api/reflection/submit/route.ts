import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createServerSupabase();

  try {
    const body = await req.json();

    const { formId, patternId, answers } = body;

    if (!formId || !patternId || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // ------------------------------------------
    // 1) INSERT ATTEMPT
    // ------------------------------------------

    const { data: attempt, error: attemptError } = await supabase
      .from("reflective_attempt")
      .insert({
        form_id: formId,
        student_id: user.id,
      })
      .select()
      .single();

    if (attemptError) {
      return NextResponse.json(
        { error: attemptError.message },
        { status: 500 }
      );
    }

    const attemptId = attempt.id;

    // ------------------------------------------
    // 2) BUILD RESPONSE ROWS
    // ------------------------------------------

    const responseRows = Object.entries(answers).map(
      ([questionInstanceId, scaleOptionId]) => ({
        attempt_id: attemptId,
        question_instance_id: questionInstanceId,
        scale_option_id: scaleOptionId,
      })
    );

    // ------------------------------------------
    // 3) INSERT ALL RESPONSES
    // ------------------------------------------

    const { error: responseError } = await supabase
      .from("reflective_response")
      .insert(responseRows);

    if (responseError) {
      return NextResponse.json(
        { error: responseError.message },
        { status: 500 }
      );
    }

    // ------------------------------------------
    // 4) UPDATE USER FLAG (has_seen_self_reflection)
    // ------------------------------------------

    const { error: userError } = await supabase
      .from("student_pattern_learning_profile")
      .update({ has_completed_reflection: true })
      .eq("student_id", user.id)
      .eq("pattern_id", patternId);

    if (userError) {
      return NextResponse.json(
        { error: userError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, attemptId },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
