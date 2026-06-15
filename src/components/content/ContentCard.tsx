import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Image as ImageIcon, Video, Eye, Heart } from 'lucide-react';
import type { InferSelectModel } from 'drizzle-orm';
import type { schema as schemaType } from '@/lib/db';

type Content = InferSelectModel<typeof schemaType.content> & { artist?: InferSelectModel<typeof schemaType.users> };

export default function ContentCard({ item }: { item: Content }) {
  const icon = item.contentType === 'audio' ? <Play className="h-4 w-4" /> :
    item.contentType === 'video' ? <Video className="h-4 w-4" /> :
    <ImageIcon className="h-4 w-4" />;

  return (
    <Link href={`/content/${item.id}`}>
      <Card className="group overflow-hidden hover:shadow-md transition-all duration-200">
        <div className="aspect-video bg-muted relative overflow-hidden">
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt={item.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
          ) : item.contentType === 'audio' ? (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary/10 to-primary/5">
              <Play className="h-12 w-12 text-primary/40" />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-muted">
              {icon}
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              {icon}
              {item.contentType}
            </Badge>
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="font-semibold text-sm truncate">{item.title}</h3>
          {item.artist && (
            <p className="text-xs text-muted-foreground truncate">{item.artist.displayName}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{item.viewCount}</span>
            <span className="flex items-center gap-1"><Heart className="h-3 w-3" />{item.likeCount}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
