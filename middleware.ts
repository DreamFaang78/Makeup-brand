import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Get the session from cookies (set by Supabase)
    const supabaseSession = request.cookies.get('sb-session');
    const mockUser = request.cookies.get('mock-user');

    // Check if user is logged in
    if (!supabaseSession && !mockUser) {
      // Redirect to home page with auth modal
      return NextResponse.redirect(new URL('/?auth=login', request.url));
    }

    // For now, allow all logged-in users to admin (will be restricted per-page)
    // In the future, you can check user roles here and redirect to /account if they're not admin
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
