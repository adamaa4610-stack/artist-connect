'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, X } from 'lucide-react';
import { useState, useCallback } from 'react';

const genres = ['Rock', 'Pop', 'Jazz', 'Classical', 'Electronic', 'Hip-Hop', 'R&B', 'Blues', 'Folk', 'Country'];
const mediums = ['Painting', 'Photography', 'Digital Art', 'Sculpture', 'Drawing', 'Printmaking', 'Mixed Media', 'Ceramics'];

export default function SearchFilters({ params }: { params: Record<string, string | undefined> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(params.q || '');

  const update = useCallback((key: string, value: string | null) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    p.set('page', '1');
    router.push(`/search?${p.toString()}`);
  }, [router, searchParams]);

  const clear = useCallback(() => {
    router.push('/search');
    setQ('');
  }, [router]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    update('q', q.trim() || null);
  }

  const tab = params.type || 'all';

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." className="pl-9" />
        </div>
        <Button type="submit">Search</Button>
        {searchParams.toString() && (
          <Button variant="ghost" size="icon" onClick={clear}><X className="h-4 w-4" /></Button>
        )}
      </form>

      <Tabs value={tab} onValueChange={v => update('type', v === 'all' ? null : v)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="artist">Artists</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
          <TabsTrigger value="image">Visual Art</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab !== 'artist' && (
        <div className="flex flex-wrap gap-3">
          <Select value={params.genre || ''} onValueChange={v => update('genre', v || null)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Genre" /></SelectTrigger>
            <SelectContent>{genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
          </Select>
          {tab === 'image' && (
            <Select value={params.medium || ''} onValueChange={v => update('medium', v || null)}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Medium" /></SelectTrigger>
              <SelectContent>{mediums.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <Select value={params.sort || 'newest'} onValueChange={v => update('sort', v === 'newest' ? null : v)}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
