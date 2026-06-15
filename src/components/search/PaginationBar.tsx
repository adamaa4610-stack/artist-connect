'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationBar({ page, hasMore }: { page: number; hasMore: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goTo = useCallback((p: number) => {
    const p2 = new URLSearchParams(searchParams.toString());
    if (p > 1) p2.set('page', String(p)); else p2.delete('page');
    router.push(`/search?${p2.toString()}`);
  }, [router, searchParams]);

  if (page <= 1 && !hasMore) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goTo(page - 1)}>
        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
      </Button>
      <span className="text-sm text-muted-foreground">Page {page}</span>
      <Button variant="outline" size="sm" disabled={!hasMore} onClick={() => goTo(page + 1)}>
        Next <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
