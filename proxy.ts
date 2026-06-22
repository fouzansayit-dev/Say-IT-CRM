import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('sayit_auth_token')?.value
  const role = request.cookies.get('sayit_user_role')?.value
  const { pathname } = request.nextUrl

  // 1. If not logged in and trying to access app pages (excluding login)
  if (!token && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. If logged in and trying to access /login
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. Enforce Server-Side Role-Based Redirects (Authorization)
  if (token && role) {
    if (role === 'client') {
      // Clients can ONLY access /client paths
      if (pathname !== '/client' && !pathname.startsWith('/client/')) {
        return NextResponse.redirect(new URL('/client', request.url))
      }
    } else {
      // Non-clients cannot access /client paths
      if (pathname.startsWith('/client')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      
      if (role === 'hr_admin') {
        // HR cannot access projects or problems
        if (pathname.startsWith('/projects') || pathname.startsWith('/problems')) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      } else if (role !== 'super_admin') {
        // Employees/Managers cannot access employees directory or reports
        if (pathname.startsWith('/employees') || pathname.startsWith('/reports')) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }
  }

  return NextResponse.next()
}

// Matching Paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, icons, etc (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.webp|.*\\.png|.*\\.jpg|.*\\.svg).*)',
  ],
}
