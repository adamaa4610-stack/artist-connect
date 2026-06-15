'use client';

import { useSession } from '@/components/auth/SessionProvider';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';

export default function LikeButton({ contentId }: { contentId: number }) {
  const { user } = useSession();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggleLike() {
    if (!user) { router.push('/auth/login'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentId }),
      });
      if (res.ok) { setLiked(!liked); router.refresh(); }
    } catch { toast.error('Error'); }
    finally { setLoading(false); }
  }

  return (
    <Button variant={liked ? 'default' : 'outline'} size="sm" onClick={toggleLike} disabled={loading} className="flex items-center gap-2">
      <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
      {liked ? 'Liked' : 'Like'}
    </Button>
  );
}
