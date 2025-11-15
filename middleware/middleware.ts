import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // ✅ Correct destructuring
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  const AUTH_ROUTES = [
    "/", 
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/reset-password",
  ];

  const isAuthPage = AUTH_ROUTES.includes(pathname);

  // 🚫 If not logged in AND not on auth page → go to /
  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 🎯 Logged in AND on auth page → redirect by role
  if (session && isAuthPage) {
    const role = session.user.user_metadata?.role;

    if (!role) {
      return NextResponse.redirect(new URL("/student", request.url));
    }

    if (role === "educator") {
      return NextResponse.redirect(new URL("/educator/dashboard", request.url));
    }

    return NextResponse.redirect(new URL("/student", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
