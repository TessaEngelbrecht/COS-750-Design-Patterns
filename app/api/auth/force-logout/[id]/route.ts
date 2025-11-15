// /app/api/auth/force-logout/[id]/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req:Request, context: { params: Promise<{ id: string }>}) {
  const supabase = await createServerSupabase();
  const userId = (await context.params).id;

  const { error } = await supabase.auth.admin.signOut(userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
