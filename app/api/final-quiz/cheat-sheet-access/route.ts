// app/api/final-quiz/cheatsheet-access/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/get-user";

export async function POST(req: Request) {
  try {
    const { attemptId } = await req.json();
    if (!attemptId) {
      return NextResponse.json(
        { error: "Missing attemptId" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabase();
    const user = await getUser();
    if (!user)
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );

    // Optional: verify attempt belongs to user
    const { data: attempt, error: aErr } = await supabase
      .from("quiz_attempt")
      .select("student_id")
      .eq("id", attemptId)
      .single();

    if (aErr || !attempt || attempt.student_id !== user.profile.id) {
      return NextResponse.json(
        { error: "Attempt not found / not allowed" },
        { status: 403 }
      );
    }

    const { error: insErr } = await supabase
      .from("final_attempt_cheat_sheet_access")
      .insert({ attempt_id: attemptId });

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("cheatsheet-access error:", err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
