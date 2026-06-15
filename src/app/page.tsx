import { db, schema } from '@/lib/db';
import { desc } from 'drizzle-orm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ArtistCard from '@/components/artists/ArtistCard';
import ContentCard from '@/components/content/ContentCard';
import { Hero3DSection, Gallery3DSection } from '@/components/three/Dynamic3D';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let recentArtists: any[] = [];
  let recentContent: any[] = [];
  try {
    const [rawArtists, rawContent] = await Promise.all([
      db.query.users.findMany({ orderBy: desc(schema.users.createdAt), limit: 6 }),
      db.query.content.findMany({ orderBy: desc(schema.content.createdAt), limit: 12, with: { artist: true } }),
    ]);
    recentArtists = rawArtists.map(({ passwordHash: _, ...a }) => a);
    recentContent = rawContent.map(({ artist, ...c }) => {
      const { passwordHash: _p, ...a } = artist;
      return { ...c, artist: a };
    });
  } catch (e) {
    console.error('DB error on home page:', e);
  }

  const galleryPieces = recentContent.slice(0, 8).map(c => ({
    id: c.id, title: c.title, artistName: c.artist?.displayName || 'Unknown',
    fileUrl: c.fileUrl, contentType: c.contentType,
  }));

  return (
    <div>
      <section className="relative py-20 md:py-32 overflow-hidden min-h-[600px] flex items-center">
        <Hero3DSection />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Discover <span className="text-primary">Artists</span> & Their Work
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              A central hub for musicians, visual artists, and performers to showcase their craft
              and connect with the world.
            </p>
            <div className="flex gap-3">
              <Button size="lg" asChild>
                <Link href="/search">Explore Art</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/register">Join as Artist</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">New Artists</h2>
          <Button variant="outline" asChild>
            <Link href="/search">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {recentArtists.map(artist => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      {galleryPieces.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-8">Featured in 3D</h2>
          <Gallery3DSection pieces={galleryPieces} />
        </section>
      )}

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Recent Uploads</h2>
          <Button variant="outline" asChild>
            <Link href="/search">View All</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recentContent.map(item => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
