import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth, signIn, signOut, createSession } from '@/lib/auth';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function handleLogin(req: Request) {
  let email, password;
  try {
    ({ email, password } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  try {
    const result = await signIn(email, password);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: 401 });

    const headersList = await headers();
    const proto = headersList.get('x-forwarded-proto') || 'http';
    const host = headersList.get('host') || 'localhost:3000';
    const redirectUrl = new URL('/dashboard', `${proto}://${host}`).toString();

    return NextResponse.json({ user: result.user, redirect: redirectUrl });
  } catch (e) {
    console.error('Login DB error:', e);
    return NextResponse.json({ error: 'Database unavailable. Make sure Turso is connected.' }, { status: 503 });
  }
}

async function handleLogout() {
  await signOut();
  return NextResponse.json({ ok: true });
}

async function handleSession() {
  const user = await auth();
  return NextResponse.json(user ? { user } : { user: null });
}

async function handleRegister(req: Request) {
  const { username, email, password, displayName } = await req.json();
  if (!username || !email || !password) {
    return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 });
  }

  try {
    const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
    if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 });

    const existingUsername = await db.query.users.findFirst({ where: eq(schema.users.username, username) });
    if (existingUsername) return NextResponse.json({ error: 'Username taken' }, { status: 400 });

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(schema.users).values({
      username, email, passwordHash, displayName: displayName || username,
    }).returning();

    await createSession({ id: user.id, name: user.displayName, email: user.email, image: user.avatarUrl });

    return NextResponse.json({ user: { id: user.id, name: user.displayName, email: user.email } }, { status: 201 });
  } catch (e) {
    console.error('Register DB error:', e);
    return NextResponse.json({ error: 'Database unavailable. Make sure Turso is connected.' }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');
  if (action === 'login') return handleLogin(req);
  if (action === 'register') return handleRegister(req);
  if (action === 'logout') return handleLogout();
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function GET() {
  return handleSession();
}
