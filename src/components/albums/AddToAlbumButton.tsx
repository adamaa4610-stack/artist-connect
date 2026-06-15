'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/components/auth/SessionProvider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export default function AddToAlbumButton({ contentId, artistId }: { contentId: number; artistId: number }) {
  const { user: session } = useSession();
  const [albums, setAlbums] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || !session) return;
    fetch(`/api/albums?artistId=${session.id}`).then(r => r.json()).then(setAlbums).catch(() => {});
  }, [open, session]);

  if (!session || session.id !== artistId) return null;

  async function addToAlbum(albumId: number) {
    try {
      const res = await fetch(`/api/albums/${albumId}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Added to album');
      setOpen(false);
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Error'); }
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)}>
        <Plus className="h-4 w-4 mr-1" /> Add to Album
      </Button>
      {open && (
        <div className="absolute z-10 mt-1 w-56 rounded-lg border bg-popover p-1 shadow-md">
          {albums.length === 0 ? (
            <p className="p-2 text-xs text-muted-foreground">No albums yet</p>
          ) : albums.map(a => (
            <button key={a.id} onClick={() => addToAlbum(a.id)}
              className="w-full text-left p-2 text-sm rounded hover:bg-muted transition-colors">
              {a.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
