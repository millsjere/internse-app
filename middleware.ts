import { NextRequest, NextResponse } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/profile', '/favorites', '/applications', '/company'];

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

// Admin routes that require admin_jwt
const adminProtectedRoutes = ['/admin/overview', '/admin/users', '/admin/companies', '/admin/jobs', '/admin/pricing', '/admin/email'];

// Admin auth route — redirect to overview if already signed in as admin
const adminAuthRoutes = ['/admin/login'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ── Admin route guards ────────────────────────────────────
  // admin_jwt is httpOnly and set on the API domain — not accessible here in production.
  // admin_auth is a non-httpOnly presence cookie set by the frontend JS after successful login.
  const adminCookie = request.cookies.get('admin_auth');
  const isAdminAuthenticated = !!adminCookie;

  const isAdminProtected = adminProtectedRoutes.some(r => pathname.startsWith(r));
  const isAdminAuth = adminAuthRoutes.some(r => pathname.startsWith(r));

  if (isAdminProtected && !isAdminAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  if (isAdminAuth && isAdminAuthenticated) {
    return NextResponse.redirect(new URL('/admin/overview', request.url));
  }

  // ── User / company route guards ──────────��────────────────
  const authCookie = request.cookies.get('uid_jwt') || request.cookies.get('cid_jwt');
  const isAuthenticated = !!authCookie;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && isAuthenticated) {
    // For /login specifically, check if this is a mobile user coming from an expired session
    // Let users explicitly access /login even with cookies present - they'll be validated by auth init
    if (pathname === '/login') {
      return NextResponse.next();
    }
    const userType = request.cookies.get('cid_jwt') ? 'company' : 'user';
    const redirectPath = userType === 'company' ? '/employer' : '/profile';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
