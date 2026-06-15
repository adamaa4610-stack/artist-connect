import { auth } from '@/lib/auth';
import { db, schema } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const albumId = Number((await params).id);
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { contentId } = body;
  if (!contentId) return NextResponse.json({ error: 'contentId required' }, { status: 400 });

  try {
    const album = await db.query.albums.findFirst({ where: eq(schema.albums.id, albumId) });
    if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    if (album.artistId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const existing = await db.query.albumContent.findFirst({
      where: and(eq(schema.albumContent.albumId, albumId), eq(schema.albumContent.contentId, contentId)),
    });
    if (existing) return NextResponse.json({ error: 'Already in album' }, { status: 409 });

    const last = await db.query.albumContent.findFirst({
      where: eq(schema.albumContent.albumId, albumId),
      orderBy: [desc(schema.albumContent.sortOrder)],
    });
    const sortOrder = (last?.sortOrder ?? 0) + 1;

    await db.insert(schema.albumContent).values({ albumId, contentId, sortOrder });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    console.error('Album content POST error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const albumId = Number((await params).id);
  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get('contentId');
  if (!contentId) return NextResponse.json({ error: 'contentId required' }, { status: 400 });

  try {
    const album = await db.query.albums.findFirst({ where: eq(schema.albums.id, albumId) });
    if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 });
    if (album.artistId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await db.delete(schema.albumContent).where(
      and(eq(schema.albumContent.albumId, albumId), eq(schema.albumContent.contentId, Number(contentId)))
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Album content DELETE error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
