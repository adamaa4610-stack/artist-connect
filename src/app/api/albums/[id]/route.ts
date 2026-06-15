import { auth } from '@/lib/auth';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const album = await db.query.albums.findFirst({
      where: eq(schema.albums.id, Number(id)),
      with: {
        artist: true,
        albumContent: {
          orderBy: (ac: any) => ac.sortOrder,
          with: { content: true },
        },
      },
    });
    if (!album) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const { passwordHash: _, ...artist } = album.artist;
    const items = album.albumContent.map(ac => ac.content);
    return NextResponse.json({ ...album, artist, items });
  } catch (e) {
    console.error('Album GET error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  try {
    const album = await db.query.albums.findFirst({ where: eq(schema.albums.id, Number(id)) });
    if (!album) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (album.artistId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await db.update(schema.albums).set({
      title: body.title ?? album.title,
      description: body.description ?? album.description,
      coverUrl: body.coverUrl ?? album.coverUrl,
    }).where(eq(schema.albums.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Album PUT error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const album = await db.query.albums.findFirst({ where: eq(schema.albums.id, Number(id)) });
    if (!album) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (album.artistId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await db.delete(schema.albums).where(eq(schema.albums.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Album DELETE error:', e);
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }
}
