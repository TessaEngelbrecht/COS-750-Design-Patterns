// /app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data?.user) {
      return NextResponse.json(
        { error: error?.message || "Invalid credentials" },
        { status: 400 }
      );
    }

    // 🔹 Fetch role (and optional names) from your users table
    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("id, first_name, last_name, role, email")
      .eq("id", data.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 500 }
      );
    }

    // Build response payload
    const res = NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        email: profile.email ?? data.user.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: profile.role,
      },
    });

    // 🔥 Forward Supabase auth cookies (new @supabase/ssr pattern)
    const supabaseCookies = (supabase as any)._cookies;
    if (supabaseCookies?.length) {
      supabaseCookies.forEach((cookie: any) => {
        res.cookies.set(cookie.name, cookie.value, cookie.options);
      });
    }

    return res;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
