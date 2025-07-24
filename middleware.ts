import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // If trying to access signup page and already has token, redirect to home
  if (pathname === '/signup' && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If trying to access protected routes without token, redirect to signup
  if (pathname !== '/signup' && !token) {
    // First show 404 for a second
    const response = NextResponse.redirect(new URL('/404', request.url));
    
    // Set a timeout to redirect to signup after 1 second
    setTimeout(() => {
      window.location.href = '/signup';
    }, 1000);
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 