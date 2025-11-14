  // /lib/auth/getUser.ts
  import { createServerSupabase } from "@/lib/supabase/server";

  export async function getUser() {
    const supabase = await createServerSupabase();

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.user) return null;

    // also fetch user profile info from your "users" table
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();

    return { authUser: session.user, profile };
  }
