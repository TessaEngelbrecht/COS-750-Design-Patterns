import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json();

  const { first_name, last_name, email, password } = body;

  if (!first_name || !last_name || !email || !password) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

   const supabase = await createServerSupabase();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Insert into public.users
  const { error: insertError } = await supabase.from("users").insert({
    id: data.user!.id,
    auth_id: data.user!.id,
    email,
    first_name,
    last_name,
    role: "student",
  });

  if (insertError) {
    console.error(insertError);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }
  await supabase.auth.getSession();

  return NextResponse.json({ success: true });
}
