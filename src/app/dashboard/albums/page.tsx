'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/auth/SessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Trash2, FolderOpen } from 'lucide-react';
import Link from 'next/link';

interface Album { id: number; title: string; description: string | null; coverUrl: string | null; createdAt: string; albumContent: { contentId: number }[]; }

export default function DashboardAlbumsPage() {
  const { user: session } = useSession();
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!session) { router.push('/auth/login'); return null; }
  const userId = session.id;

  useEffect(() => {
    fetch(`/api/albums?artistId=${userId}`).then(r => r.json()).then(setAlbums).catch(() => {});
  }, [userId]);

  async function createAlbum(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/albums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Album created');
      setTitle('');
      setDescription('');
      setShowForm(false);
      router.refresh();
      const updated = await fetch(`/api/albums?artistId=${userId}`).then(r => r.json());
      setAlbums(updated);
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Error'); }
    finally { setLoading(false); }
  }

  async function deleteAlbum(id: number) {
    if (!confirm('Delete this album?')) return;
    try {
      const res = await fetch(`/api/albums/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success('Album deleted');
      setAlbums(albums.filter(a => a.id !== id));
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : 'Error'); }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Albums</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> New Album
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader><CardTitle className="text-lg">Create Album</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={createAlbum} className="space-y-3">
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Album title" required />
              <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" />
              <Button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create'}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {albums.length === 0 ? (
        <p className="text-muted-foreground">No albums yet.</p>
      ) : (
        <div className="grid gap-4">
          {albums.map(album => (
            <Card key={album.id}>
              <CardContent className="flex items-center justify-between p-4">
                <Link href={`/albums/${album.id}`} className="flex items-center gap-3 hover:underline flex-1">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{album.title}</p>
                    <p className="text-xs text-muted-foreground">{album.albumContent.length} items</p>
                  </div>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => deleteAlbum(album.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
