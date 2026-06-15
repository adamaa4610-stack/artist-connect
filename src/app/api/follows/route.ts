import { auth } from '@/lib/auth';
import { db, schema } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let artistId: number;
  try { const body = await req.json(); artistId = body.artistId; } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!artistId) return NextResponse.json({ error: 'artistId required' }, { status: 400 });

  const followerId = session.id;
  try {
    const existing = await db.query.follows.findFirst({
      where: and(eq(schema.follows.followerId, followerId), eq(schema.follows.followingId, artistId)),
    });

    if (existing) {
      await db.delete(schema.follows).where(and(eq(schema.follows.followerId, followerId), eq(schema.follows.followingId, artistId)));
      return NextResponse.json({ following: false });
    }

    await db.insert(schema.follows).values({ followerId, followingId: artistId });
    return NextResponse.json({ following: true });
  } catch (e) {
    console.error('Follows error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
