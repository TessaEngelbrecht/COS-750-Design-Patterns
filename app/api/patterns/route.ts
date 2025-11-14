import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabase();

  try {
    // Fetch all design patterns
    const { data, error } = await supabase
      .from("design_patterns")
      .select("id, design_pattern, description")
      .order("design_pattern", { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { patterns: data ?? [] },
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
