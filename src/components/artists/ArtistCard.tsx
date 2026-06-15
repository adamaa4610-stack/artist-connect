import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { InferSelectModel } from 'drizzle-orm';
import type { schema as schemaType } from '@/lib/db';

type Artist = InferSelectModel<typeof schemaType.users>;

export default function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link href={`/artists/${artist.id}`}>
      <Card className="group hover:shadow-md transition-all duration-200 h-full">
        <CardContent className="p-4 flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 mb-3 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
            <AvatarImage src={artist.avatarUrl || ''} />
            <AvatarFallback className="text-lg">{artist.displayName[0]}</AvatarFallback>
          </Avatar>
          <h3 className="font-semibold truncate w-full">{artist.displayName}</h3>
          {artist.genres && (
            <p className="text-xs text-muted-foreground mt-1 truncate w-full">{artist.genres}</p>
          )}
          {artist.location && (
            <p className="text-xs text-muted-foreground mt-1">{artist.location}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
