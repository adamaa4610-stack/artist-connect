'use client';

import { useSession } from '@/components/auth/SessionProvider';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Heart } from 'lucide-react';

export default function FollowButton({ artistId }: { artistId: number }) {
  const { user } = useSession();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function toggleFollow() {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/follows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artistId }),
      });
      if (res.ok) {
        setFollowing(!following);
        toast.success(following ? 'Unfollowed' : 'Following');
        router.refresh();
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant={following ? 'outline' : 'default'}
      size="sm"
      onClick={toggleFollow}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <Heart className={`h-4 w-4 ${following ? 'fill-current text-red-500' : ''}`} />
      {following ? 'Following' : 'Follow'}
    </Button>
  );
}
