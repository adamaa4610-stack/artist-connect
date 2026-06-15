'use client';

import { useSession } from '@/components/auth/SessionProvider';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user: session, refresh: updateSession } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    displayName: '', bio: '', location: '', genres: '', mediums: '', website: '',
    avatarUrl: '', coverUrl: '',
  });

  useEffect(() => {
    async function load() {
      if (!session) return;
      try {
        const res = await fetch(`/api/users?id=${session.id}`);
        if (res.ok) {
          const user = await res.json();
          setForm({
            displayName: user.displayName || '',
            bio: user.bio || '', location: user.location || '',
            genres: user.genres || '', mediums: user.mediums || '',
            website: user.website || '', avatarUrl: user.avatarUrl || '',
            coverUrl: user.coverUrl || '',
          });
        }
      } catch { /* ignore */ }
    }
    load();
  }, [session]);

  if (!session) { router.push('/auth/login'); return null; }

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Update failed');
      toast.success('Profile updated!');
      updateSession();
      router.refresh();
    } catch {
      toast.error('Error updating profile');
    } finally { setLoading(false); }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader><CardTitle>Profile Settings</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Display Name</label>
              <Input value={form.displayName} onChange={update('displayName')} required />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Bio</label>
              <Textarea value={form.bio} onChange={update('bio')} rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Location</label>
              <Input value={form.location} onChange={update('location')} placeholder="City, Country" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Genres (comma-separated)</label>
              <Input value={form.genres} onChange={update('genres')} placeholder="Rock, Pop, Jazz" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Mediums (comma-separated)</label>
              <Input value={form.mediums} onChange={update('mediums')} placeholder="Painting, Photography" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Website</label>
              <Input value={form.website} onChange={update('website')} placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Avatar URL</label>
              <Input value={form.avatarUrl} onChange={update('avatarUrl')} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Cover Image URL</label>
              <Input value={form.coverUrl} onChange={update('coverUrl')} />
            </div>
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
