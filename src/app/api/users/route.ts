import { auth } from '@/lib/auth';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    const user = await db.query.users.findFirst({ where: eq(schema.users.id, Number(id)) });
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const { passwordHash: _, ...safe } = user;
    return NextResponse.json(safe);
  } catch (e) {
    console.error('Users GET error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { displayName, bio, location, genres, mediums, website, avatarUrl, coverUrl } = await req.json();
  const userId = session.id;

  try {
    await db.update(schema.users).set({
      displayName, bio, location, genres, mediums, website, avatarUrl, coverUrl,
    }).where(eq(schema.users.id, userId));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Users PUT error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
