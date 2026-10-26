import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Auth Middleware - Role-based route protection.
 * 
 * CRITICAL: Workers must ONLY be redirected to /worker/login.
 * Each role is redirected exclusively to its own login page.
 * No cross-role redirects are permitted.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authSession = request.cookies.get('authSession')?.value;
  const isAuthed = request.cookies.get('isAuthed')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  const hasValidSession = authSession === 'active' || isAuthed === 'true' || !!userRole;

  // Determine which role's login page to redirect to based on the requested URL
  const getLoginRoute = (path: string): string => {
    if (path.startsWith('/admin'))      return '/admin/login';
    if (path.startsWith('/client'))     return '/client/login';
    if (path.startsWith('/engineer'))   return '/engineer/login';
    if (path.startsWith('/contractor')) return '/contractor/login';
    if (path.startsWith('/worker'))     return '/worker/login'; // ← Workers ALWAYS go here
    return '/login';
  };

  // Protect all dashboard and Worker sub-pages
  const isProtected = (
    pathname === '/dashboard' ||
    pathname.startsWith('/admin/dashboard') ||
    pathname.startsWith('/client/dashboard') ||
    pathname.startsWith('/engineer/dashboard') ||
    pathname.startsWith('/contractor/dashboard') ||
    // Worker dashboard and ALL sub-pages
    pathname.startsWith('/worker/dashboard') ||
    pathname.startsWith('/worker/tasks') ||
    pathname.startsWith('/worker/attendance') ||
    pathname.startsWith('/worker/salary') ||
    pathname.startsWith('/worker/leave') ||
    pathname.startsWith('/worker/safety') ||
    pathname.startsWith('/worker/profile')
  );

  if (isProtected && !hasValidSession) {
    const loginRoute = getLoginRoute(pathname);
    const response = NextResponse.redirect(new URL(loginRoute, request.url));
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }

  // Cache-control for protected pages
  const response = NextResponse.next();
  if (isProtected) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard',
    '/admin/dashboard/:path*',
    '/client/dashboard/:path*',
    '/engineer/dashboard/:path*',
    '/contractor/dashboard/:path*',
    // Worker dashboard + all sub-pages
    '/worker/dashboard/:path*',
    '/worker/tasks/:path*',
    '/worker/attendance/:path*',
    '/worker/salary/:path*',
    '/worker/leave/:path*',
    '/worker/safety/:path*',
    '/worker/profile/:path*'
  ],
};
