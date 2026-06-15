import { auth } from '@/lib/auth';
import { db, schema } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const artistId = searchParams.get('artistId');
  if (!artistId) return NextResponse.json({ error: 'artistId required' }, { status: 400 });

  try {
    const albums = await db.query.albums.findMany({
      where: eq(schema.albums.artistId, Number(artistId)),
      orderBy: desc(schema.albums.createdAt),
      with: { albumContent: { with: { content: true } } },
    });
    return NextResponse.json(albums);
  } catch (e) {
    console.error('Albums GET error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { title, description, coverUrl } = body;
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  try {
    const [album] = await db.insert(schema.albums).values({
      artistId: session.id, title, description, coverUrl,
    }).returning();
    return NextResponse.json(album, { status: 201 });
  } catch (e) {
    console.error('Albums POST error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
