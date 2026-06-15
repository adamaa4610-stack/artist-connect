import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secretKey = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production';
const encodedKey = new TextEncoder().encode(secretKey);

const protectedPaths = ['/dashboard', '/upload', '/messages'];

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtected = protectedPaths.some(p => path === p || path.startsWith(p + '/'));

  if (isProtected) {
    const sessionCookie = req.cookies.get('artistconnect.session')?.value;
    if (!sessionCookie) return NextResponse.redirect(new URL('/auth/login', req.nextUrl));

    try {
      await jwtVerify(sessionCookie, encodedKey, { algorithms: ['HS256'] });
    } catch {
      return NextResponse.redirect(new URL('/auth/login', req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
