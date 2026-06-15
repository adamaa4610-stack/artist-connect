'use client';

import { useSession } from '@/components/auth/SessionProvider';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Comment {
  id: number; userId: number; body: string; createdAt: string;
  user?: { displayName: string; avatarUrl?: string };
}

export default function CommentSection({ contentId, initialComments = [] }: { contentId: number; initialComments?: Comment[] }) {
  const { user } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!user) { router.push('/auth/login'); return; }
    if (!body.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId, body }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => [newComment, ...prev]);
        setBody('');
        toast.success('Comment added');
      }
    } catch { toast.error('Error'); }
    finally { setLoading(false); }
  }

  return (
    <section className="mt-12">
      <h2 className="text-lg font-semibold mb-4">Comments ({comments.length})</h2>
          {user && (
        <form onSubmit={submitComment} className="flex gap-3 mb-6">
          <Avatar className="h-9 w-9 mt-1">
            <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Add a comment..." className="min-h-[80px]" />
            <Button type="submit" size="sm" disabled={loading || !body.trim()}>Post Comment</Button>
          </div>
        </form>
      )}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{comment.user?.displayName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{comment.user?.displayName || 'Anonymous'}</span>
                <span className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm mt-1">{comment.body}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet.</p>}
      </div>
    </section>
  );
}
