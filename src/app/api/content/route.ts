import { auth } from '@/lib/auth';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { title, description, contentType, genre, medium, fileUrl } = body;
  if (!title || !fileUrl) return NextResponse.json({ error: 'Title and fileUrl are required' }, { status: 400 });

  try {
    const [content] = await db.insert(schema.content).values({
      artistId: session.id,
      title, description, contentType, genre, medium, fileUrl,
      viewCount: 0, likeCount: 0,
    }).returning();
    return NextResponse.json(content, { status: 201 });
  } catch (e) {
    console.error('Content POST error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    const content = await db.query.content.findFirst({
      where: eq(schema.content.id, Number(id)),
      with: { artist: true },
    });
    if (!content) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const { passwordHash: _, ...artist } = content.artist;
    return NextResponse.json({ ...content, artist });
  } catch (e) {
    console.error('Content GET error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
