import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ patternId: string }> }
) {
  try {
    const supabase = await createServerSupabase();

    // ✅ FIX: params is a Promise
    const { patternId } = await context.params;

    console.log("🔍 Reflection Form Request:", patternId);

    if (!patternId || patternId === "undefined") {
      return NextResponse.json(
        { error: "Invalid pattern ID" },
        { status: 400 }
      );
    }

    // 1. Find active form
    const { data: form, error: formError } = await supabase
      .from("reflective_form")
      .select("*")
      .eq("pattern_id", patternId)
      .eq("is_active", true)
      .single();

    if (formError || !form) {
      return NextResponse.json(
        { error: "No active reflection form found." },
        { status: 404 }
      );
    }

    // 2. Load questions
    const { data: questions, error: questionError } = await supabase
      .from("reflective_question_instance")
      .select("id, generated_text, topic_id")
      .eq("form_id", form.id);

    if (questionError) {
      return NextResponse.json(
        { error: questionError.message },
        { status: 500 }
      );
    }

    // 3. Load scale options
    const { data: scaleOptions } = await supabase
      .from("reflective_scale_option")
      .select("*")
      .order("order_index");

    return NextResponse.json({
      form,
      questions,
      scaleOptions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Unknown server error" },
      { status: 500 }
    );
  }
}
