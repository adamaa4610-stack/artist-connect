import { auth } from '@/lib/auth';
import { db, schema } from '@/lib/db';
import { eq, and, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let contentId: number;
  try { const body = await req.json(); contentId = body.contentId; } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!contentId) return NextResponse.json({ error: 'contentId required' }, { status: 400 });

  const userId = session.id;
  try {
    const existing = await db.query.likes.findFirst({
      where: and(eq(schema.likes.userId, userId), eq(schema.likes.contentId, contentId)),
    });

    if (existing) {
      await db.delete(schema.likes).where(and(eq(schema.likes.userId, userId), eq(schema.likes.contentId, contentId)));
      await db.update(schema.content).set({ likeCount: sql`${schema.content.likeCount} - 1` }).where(eq(schema.content.id, contentId));
      return NextResponse.json({ liked: false });
    }

    await db.insert(schema.likes).values({ userId, contentId });
    await db.update(schema.content).set({ likeCount: sql`${schema.content.likeCount} + 1` }).where(eq(schema.content.id, contentId));
    return NextResponse.json({ liked: true });
  } catch (e) {
    console.error('Likes error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
