// /lib/auth/getUser.ts
import { createServerSupabase } from "@/lib/supabase/server";

export async function getUser() {
  const supabase = await createServerSupabase();

  // ✔️ This validates the JWT with Supabase Auth
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  // ✔️ Database profile lookup (trusted RLS-protected table)
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", user.id) // Important: use auth_id field
    .single();

  if (profileError) return null;

  return { authUser: user, profile };
}
