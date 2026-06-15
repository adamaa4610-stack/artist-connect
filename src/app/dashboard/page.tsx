import { auth } from '@/lib/auth';
import { db, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ContentCard from '@/components/content/ContentCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Settings, MessageSquare, FolderOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/auth/login');
  const userId = session.id;

  let artist: any = null;
  let myContent: any[] = [];
  let followerCount = 0;

  try {
    const raw = await db.query.users.findFirst({ where: eq(schema.users.id, userId) });
    if (raw) {
      const { passwordHash: _, ...rest } = raw;
      artist = rest;
      [myContent, followerCount] = await Promise.all([
        db.query.content.findMany({ where: eq(schema.content.artistId, userId), orderBy: (c: any, { desc }: any) => desc(c.createdAt) }),
        db.$count(schema.follows, eq(schema.follows.followingId, userId)),
      ]);
    }
  } catch (e) {
    console.error('Dashboard DB error:', e);
  }

  if (!artist) redirect('/auth/login');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {artist.displayName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link href="/upload"><Upload className="h-4 w-4 mr-1" />Upload</Link></Button>
          <Button variant="outline" asChild><Link href="/messages"><MessageSquare className="h-4 w-4 mr-1" />Messages</Link></Button>
          <Button variant="outline" asChild><Link href="/dashboard/albums"><FolderOpen className="h-4 w-4 mr-1" />Albums</Link></Button>
          <Button variant="outline" asChild><Link href="/dashboard/settings"><Settings className="h-4 w-4 mr-1" />Settings</Link></Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border p-4"><p className="text-2xl font-bold">{myContent.length}</p><p className="text-sm text-muted-foreground">Uploads</p></div>
        <div className="rounded-xl border p-4"><p className="text-2xl font-bold">{followerCount}</p><p className="text-sm text-muted-foreground">Followers</p></div>
      </div>

      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">My Content</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="content" className="mt-6">
          {myContent.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No content yet. Start uploading your work!</p>
              <Button asChild><Link href="/upload">Upload Your First Piece</Link></Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {myContent.map(item => <ContentCard key={item.id} item={item} />)}
            </div>
          )}
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
          <div className="max-w-lg space-y-4">
            <div><strong>Display Name:</strong> {artist.displayName}</div>
            <div><strong>Username:</strong> {artist.username}</div>
            <div><strong>Email:</strong> {artist.email}</div>
            <div><strong>Location:</strong> {artist.location || 'Not set'}</div>
            <div><strong>Genres:</strong> {artist.genres || 'Not set'}</div>
            <div><strong>Mediums:</strong> {artist.mediums || 'Not set'}</div>
            <Button asChild variant="outline"><Link href="/dashboard/settings">Edit Profile</Link></Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
