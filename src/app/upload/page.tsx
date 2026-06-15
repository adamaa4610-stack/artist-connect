'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/auth/SessionProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { UploadCloud } from 'lucide-react';

const genres = ['Rock', 'Pop', 'Jazz', 'Classical', 'Electronic', 'Hip-Hop', 'R&B', 'Blues', 'Folk', 'Country'];
const mediums = ['Painting', 'Photography', 'Digital Art', 'Sculpture', 'Drawing', 'Printmaking', 'Mixed Media', 'Ceramics'];

export default function UploadPage() {
  const { user: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', contentType: 'music', genre: '', medium: '', fileUrl: '',
  });

  if (!session) { router.push('/auth/login'); return null; }

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [field]: e.target.value });
  }

  function selectUpdate(field: string) {
    return (value: string | null) => setForm({ ...form, [field]: value || '' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fileUrl) { toast.error('Please provide a file URL'); return; }
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Upload failed'); }
      toast.success('Content uploaded!');
      router.push('/dashboard');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error uploading');
    } finally { setLoading(false); }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UploadCloud className="h-5 w-5" />Upload New Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Content Type</label>
              <Select value={form.contentType} onValueChange={selectUpdate('contentType')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="music">Music / Audio</SelectItem>
                  <SelectItem value="image">Visual Art / Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Title *</label>
              <Input value={form.title} onChange={update('title')} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea value={form.description} onChange={update('description')} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">File URL *</label>
              <Input value={form.fileUrl} onChange={update('fileUrl')} placeholder="Enter URL or upload via Cloudinary..." required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Genre</label>
                <Select value={form.genre} onValueChange={selectUpdate('genre')}>
                  <SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger>
                  <SelectContent>{genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Medium</label>
                <Select value={form.medium} onValueChange={selectUpdate('medium')}>
                  <SelectTrigger><SelectValue placeholder="Select medium" /></SelectTrigger>
                  <SelectContent>{mediums.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
