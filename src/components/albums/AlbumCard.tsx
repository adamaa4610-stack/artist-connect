import Link from 'next/link';
import { FolderOpen } from 'lucide-react';

export default function AlbumCard({ album }: { album: { id: number; title: string; description?: string | null; coverUrl?: string | null; createdAt: string } }) {
  return (
    <Link href={`/albums/${album.id}`} className="group block">
      <div className="rounded-xl aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden flex items-center justify-center">
        {album.coverUrl ? (
          <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
        )}
      </div>
      <div className="mt-2">
        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{album.title}</p>
        {album.description && <p className="text-xs text-muted-foreground truncate">{album.description}</p>}
      </div>
    </Link>
  );
}
