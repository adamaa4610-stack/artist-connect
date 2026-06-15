import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ContentCard from '@/components/content/ContentCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let album: any = null;

  try {
    const raw = await db.query.albums.findFirst({
      where: eq(schema.albums.id, Number(id)),
      with: {
        artist: true,
        albumContent: {
          orderBy: (ac: any) => ac.sortOrder,
          with: { content: true },
        },
      },
    });
    if (raw) {
      const { passwordHash: _, ...artist } = raw.artist;
      album = { ...raw, artist, items: raw.albumContent.map(ac => ac.content) };
    }
  } catch (e) {
    console.error('Album page DB error:', e);
  }

  if (!album) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="h-48 md:h-64 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 overflow-hidden mb-4">
          {album.coverUrl && <img src={album.coverUrl} alt="" className="w-full h-full object-cover" />}
        </div>
        <h1 className="text-3xl font-bold">{album.title}</h1>
        {album.description && <p className="text-muted-foreground mt-2">{album.description}</p>}
        <div className="flex items-center gap-3 mt-4">
          <Link href={`/artists/${album.artist.id}`} className="flex items-center gap-2 hover:underline">
            <Avatar className="h-8 w-8">
              <AvatarImage src={album.artist.avatarUrl || ''} />
              <AvatarFallback>{album.artist.displayName[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{album.artist.displayName}</span>
          </Link>
          <span className="text-sm text-muted-foreground">{album.items.length} items</span>
        </div>
      </div>

      <section>
        {album.items.length === 0 ? (
          <p className="text-muted-foreground">This album is empty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {album.items.map((item: any) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
