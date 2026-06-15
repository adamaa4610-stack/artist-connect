import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import LikeButton from '@/components/content/LikeButton';
import CommentSection from '@/components/content/CommentSection';
import { Eye, Heart, Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item: any = null;
  try {
    const raw = await db.query.content.findFirst({
      where: eq(schema.content.id, Number(id)),
      with: { artist: true },
    });
    if (raw) {
      const { passwordHash: _, ...artist } = raw.artist;
      item = { ...raw, artist };
      await db.update(schema.content).set({ viewCount: (item.viewCount || 0) + 1 }).where(eq(schema.content.id, Number(id)));
    }
  } catch (e) {
    console.error('Content page DB error:', e);
  }
  if (!item) notFound();

  const artist = item.artist;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid md:grid-cols-5 gap-8">
        <div className="md:col-span-3">
          {item.contentType === 'audio' && (
            <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 flex items-center justify-center min-h-[200px]">
              <audio src={item.fileUrl} controls className="w-full" />
            </div>
          )}
          {item.contentType === 'image' && (
            <img src={item.fileUrl} alt={item.title} className="rounded-xl w-full" />
          )}
          {item.contentType === 'video' && (
            <div className="aspect-video rounded-xl overflow-hidden">
              {item.fileUrl.includes('youtube') || item.fileUrl.includes('youtu.be') ? (
                <iframe src={item.fileUrl.replace('watch?v=', 'embed/').split('&')[0]} className="w-full h-full" allowFullScreen />
              ) : item.fileUrl.includes('vimeo') ? (
                <iframe src={item.fileUrl.replace('vimeo.com', 'player.vimeo.com/video')} className="w-full h-full" allowFullScreen />
              ) : (
                <video src={item.fileUrl} controls className="w-full h-full" />
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="flex items-start gap-1 mb-2">
            <Badge variant="secondary">{item.contentType}</Badge>
            {item.genre && <Badge variant="outline">{item.genre}</Badge>}
          </div>
          <h1 className="text-2xl font-bold mb-2">{item.title}</h1>
          {item.description && <p className="text-muted-foreground mb-4">{item.description}</p>}

          {artist && (
            <Link href={`/artists/${artist.id}`} className="flex items-center gap-3 mb-4 p-3 rounded-lg hover:bg-muted transition-colors">
              <Avatar>
                <AvatarImage src={artist.avatarUrl || ''} />
                <AvatarFallback>{artist.displayName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{artist.displayName}</p>
                {artist.location && <p className="text-xs text-muted-foreground">{artist.location}</p>}
              </div>
            </Link>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{item.viewCount} views</span>
            <span className="flex items-center gap-1"><Heart className="h-4 w-4" />{item.likeCount} likes</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{new Date(item.createdAt).toLocaleDateString()}</span>
          </div>

          <LikeButton contentId={Number(id)} />
        </div>
      </div>

      <CommentSection contentId={Number(id)} />
    </div>
  );
}
