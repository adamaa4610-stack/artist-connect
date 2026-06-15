'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface Conversation {
  id: number; senderId: number; receiverId: number; body: string; createdAt: string;
  sender: { id: number; displayName: string; avatarUrl?: string | null };
  receiver: { id: number; displayName: string; avatarUrl?: string | null };
}

export default function MessagesList({ conversations, userId }: { conversations: Conversation[]; userId: number }) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => { router.refresh(); }, 30000);
    return () => clearInterval(interval);
  }, [router]);

  const selected = conversations.find(c => c.id === selectedId);
  const otherUser = selected ? (selected.senderId === userId ? selected.receiver : selected.sender) : null;

  async function sendReply() {
    if (!selected || !reply.trim() || !otherUser) return;
    setLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: otherUser.id, body: reply }),
      });
      if (res.ok) {
        toast.success('Message sent');
        setReply('');
        router.refresh();
      }
    } catch { toast.error('Error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid md:grid-cols-5 gap-6">
      <div className="md:col-span-2 space-y-2">
        {conversations.map(c => {
          const other = c.senderId === userId ? c.receiver : c.sender;
          return (
            <button key={c.id} onClick={() => setSelectedId(c.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${selectedId === c.id ? 'bg-muted' : 'hover:bg-muted/50'}`}>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={other?.avatarUrl || ''} /><AvatarFallback>{other?.displayName?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{other?.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{c.body}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                </span>
              </div>
            </button>
          );
        })}
        {conversations.length === 0 && <p className="text-sm text-muted-foreground">No conversations yet.</p>}
      </div>

      <div className="md:col-span-3">
        {selected && otherUser ? (
          <div>
            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-muted/50">
              <Avatar className="h-10 w-10">
                <AvatarImage src={otherUser.avatarUrl || ''} /><AvatarFallback>{otherUser.displayName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <Link href={`/artists/${otherUser.id}`} className="font-medium hover:underline">{otherUser.displayName}</Link>
              </div>
            </div>
            <div className="mb-4 p-3 rounded-lg border">
              <p className="text-sm">{selected.body}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(selected.createdAt).toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <Textarea value={reply} onChange={e => setReply(e.target.value)} placeholder="Write a reply..." />
              <Button size="sm" onClick={sendReply} disabled={loading || !reply.trim()}>Send Reply</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
