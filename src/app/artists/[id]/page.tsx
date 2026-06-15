import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import ContentCard from '@/components/content/ContentCard';
import AlbumCard from '@/components/albums/AlbumCard';
import FollowButton from '@/components/artists/FollowButton';
import { MapPin, Globe, ExternalLink } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ArtistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let artist: any = null;
  let artistContent: any[] = [];
  let albums: any[] = [];
  let followerCount = 0;
  let followingCount = 0;

  try {
    const raw = await db.query.users.findFirst({ where: eq(schema.users.id, Number(id)) });
    if (raw) {
      const { passwordHash: _, ...rest } = raw;
      artist = rest;
      [artistContent, albums, followerCount, followingCount] = await Promise.all([
        db.query.content.findMany({ where: eq(schema.content.artistId, Number(id)), orderBy: (c: any, { desc }: any) => desc(c.createdAt), limit: 20 }),
        db.query.albums.findMany({ where: eq(schema.albums.artistId, Number(id)), orderBy: (a: any, { desc }: any) => desc(a.createdAt) }),
        db.$count(schema.follows, eq(schema.follows.followingId, Number(id))),
        db.$count(schema.follows, eq(schema.follows.followerId, Number(id))),
      ]);
    }
  } catch (e) {
    console.error('Artist profile DB error:', e);
  }

  if (!artist) notFound();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative">
        <div className="h-48 md:h-64 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 overflow-hidden">
          {artist.coverUrl && (
            <img src={artist.coverUrl} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 px-4 -mt-16 relative">
          <Avatar className="h-32 w-32 ring-4 ring-background">
            <AvatarImage src={artist.avatarUrl || ''} />
            <AvatarFallback className="text-3xl">{artist.displayName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 pt-4 md:pt-0">
            <h1 className="text-2xl md:text-3xl font-bold">{artist.displayName}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mt-1">
              {artist.location && (
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{artist.location}</span>
              )}
              {artist.website && (
                <a href={artist.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Globe className="h-3.5 w-3.5" />Website <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span><strong>{followerCount}</strong> followers</span>
              <span><strong>{followingCount}</strong> following</span>
            </div>
          </div>
          <div className="pt-2 md:pt-0">
            <FollowButton artistId={Number(id)} />
          </div>
        </div>
      </div>

      {artist.bio && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">{artist.bio}</p>
        </section>
      )}

      {artist.genres && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Genres & Mediums</h2>
          <div className="flex flex-wrap gap-2">
            {(artist.genres || '').split(',').map((g: string) => g.trim()).filter(Boolean).map((g: string) => (
              <Badge key={g} variant="secondary">{g}</Badge>
            ))}
            {(artist.mediums || '').split(',').map((m: string) => m.trim()).filter(Boolean).map((m: string) => (
              <Badge key={m} variant="outline">{m}</Badge>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Portfolio ({artistContent.length})</h2>
        {artistContent.length === 0 ? (
          <p className="text-muted-foreground">No content uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {artistContent.map(item => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      {albums.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Albums ({albums.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {albums.map(album => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
