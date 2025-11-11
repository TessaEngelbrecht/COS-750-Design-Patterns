import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TIMEOUT_DURATION = 15 * 60 * 1000 // 15 minutes in milliseconds

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res: response })

  // Check auth status
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // URLs that don't require authentication
  const publicUrls = ['/auth/login-page', '/auth/signup-page', '/auth/ForgotPassword-page']
  const isPublicUrl = publicUrls.some(url => request.nextUrl.pathname.startsWith(url))

  // Check session timeout
  if (session) {
    const lastActivity = session.user.last_sign_in_at
    const currentTime = new Date().getTime()
    
    if (lastActivity && (currentTime - new Date(lastActivity).getTime() > TIMEOUT_DURATION)) {
      // Session has expired, sign out the user
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/auth/login-page', request.url))
    }
  }

  // Redirect unauthenticated users to login page
  if (!session && !isPublicUrl) {
    return NextResponse.redirect(new URL('/auth/login-page', request.url))
  }

  // Redirect authenticated users away from auth pages
  if (session && isPublicUrl) {
    // Redirect educators and students to their respective dashboards
    if (session.user.user_metadata.role === 'educator') {
      return NextResponse.redirect(new URL('/educator/dashboard', request.url))
    } else {
      return NextResponse.redirect(new URL('/student', request.url))
    }
  }

  return response
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico).*)',
  ],
}