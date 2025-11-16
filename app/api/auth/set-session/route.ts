// POST /api/auth/set-session
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { access_token } = await req.json();
  const supabase = await createServerSupabase();

  const { error } = await supabase.auth.setSession({
    access_token,
    refresh_token: "",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}
