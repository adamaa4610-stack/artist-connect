import { searchAll, searchContent, searchArtists } from '@/lib/search';
import ArtistCard from '@/components/artists/ArtistCard';
import ContentCard from '@/components/content/ContentCard';
import SearchFilters from '@/components/search/SearchFilters';
import PaginationBar from '@/components/search/PaginationBar';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  const tab = params.type || 'all';
  const page = Number(params.page) || 1;
  const limit = tab === 'all' ? 10 : 20;
  let artists: any[] = [];
  let contentResults: any[] = [];

  try {
    if (tab === 'all') {
      const results = await searchAll({ ...params, page, limit });
      artists = results.artists;
      contentResults = results.content;
    } else if (tab === 'artist') {
      artists = await searchArtists({ ...params, page, limit });
    } else {
      contentResults = await searchContent({ ...params, page, limit });
    }
  } catch (e) {
    console.error('Search DB error:', e);
  }

  const hasMore = (tab === 'all' ? contentResults.length : contentResults.length || artists.length) >= limit;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Discover</h1>
      <SearchFilters params={params} />

      <div className="mt-8">
        {tab === 'all' && (
          <>
            {artists.length > 0 && (
              <section className="mb-10">
                <h2 className="text-lg font-semibold mb-4">Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {artists.map(a => <ArtistCard key={a.id} artist={a} />)}
                </div>
              </section>
            )}
            <section>
              <h2 className="text-lg font-semibold mb-4">Content</h2>
              {contentResults.length === 0 ? (
                <p className="text-muted-foreground">No results found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {contentResults.map(c => <ContentCard key={c.id} item={c} />)}
                </div>
              )}
            </section>
          </>
        )}
        {tab === 'artist' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artists.length === 0 ? <p className="text-muted-foreground col-span-full">No artists found.</p> :
              artists.map(a => <ArtistCard key={a.id} artist={a} />)}
          </div>
        )}
        {(tab === 'music' || tab === 'image' || tab === 'video') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {contentResults.length === 0 ? <p className="text-muted-foreground col-span-full">No results found.</p> :
              contentResults.map(c => <ContentCard key={c.id} item={c} />)}
          </div>
        )}
      </div>

      <PaginationBar page={page} hasMore={hasMore} />
    </div>
  );
}
