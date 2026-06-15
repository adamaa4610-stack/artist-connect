import { auth } from '@/lib/auth';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let contentId: number, body: string;
  try { const data = await req.json(); contentId = data.contentId; body = data.body; } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!contentId || !body?.trim()) return NextResponse.json({ error: 'contentId and body required' }, { status: 400 });

  try {
    const [comment] = await db.insert(schema.comments).values({ userId: session.id, contentId, body }).returning();
    return NextResponse.json(comment, { status: 201 });
  } catch (e) {
    console.error('Comments POST error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get('contentId');
  if (!contentId) return NextResponse.json({ error: 'contentId required' }, { status: 400 });

  try {
    const comments = await db.query.comments.findMany({
      where: eq(schema.comments.contentId, Number(contentId)),
      orderBy: (c: any, { desc }: any) => desc(c.createdAt),
      with: { user: true },
    });
    const safe = comments.map(({ user, ...c }) => {
      const { passwordHash: _, ...safeUser } = user;
      return { ...c, user: safeUser };
    });
    return NextResponse.json(safe);
  } catch (e) {
    console.error('Comments GET error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
