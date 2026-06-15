import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { db, schema } from './db';
import { eq } from 'drizzle-orm';

const SESSION_COOKIE = 'artistconnect.session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

const secretKey = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production';
const encodedKey = new TextEncoder().encode(secretKey);

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  image?: string | null;
}

interface SessionPayload {
  user: SessionUser;
  expiresAt: Date;
}

async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ user: payload.user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

async function decrypt(session: string | undefined = ''): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, { algorithms: ['HS256'] });
    return payload as unknown as SessionPayload;
  } catch { return null; }
}

export async function createSession(user: SessionUser) {
  const expiresAt = new Date(Date.now() + COOKIE_MAX_AGE * 1000);
  const session = await encrypt({ user, expiresAt });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true, secure: true, expires: expiresAt, sameSite: 'lax', path: '/',
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function signIn(email: string, password: string): Promise<{ ok: boolean; error?: string; user?: SessionUser }> {
  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  if (!user) return { ok: false, error: 'Invalid email or password' };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { ok: false, error: 'Invalid email or password' };

  const sessionUser: SessionUser = { id: user.id, name: user.displayName, email: user.email, image: user.avatarUrl };
  await createSession(sessionUser);
  return { ok: true, user: sessionUser };
}

export async function signOut() {
  await deleteSession();
  redirect('/');
}

export const auth = cache(async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE)?.value;
  const payload = await decrypt(sessionCookie);
  return payload?.user ?? null;
});
