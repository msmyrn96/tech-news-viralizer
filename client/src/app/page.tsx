import { fetchArticles } from '@/lib/api';
import { Nav } from '@/components/Nav';
import { ArticleFeed } from '@/components/ArticleFeed';

export const revalidate = 30;

export default async function Home() {
  let articles = await fetchArticles({ sort_by: 'score', limit: 30 }).catch(
    () => []
  );

  return (
    <>
      <Nav articleCount={articles.length} />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <p className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest mb-2">
            Intelligence Feed
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-50 leading-none">
            What the industry<br />
            <span className="text-zinc-500">is talking about.</span>
          </h1>
        </div>

        <ArticleFeed initialArticles={articles} />
      </main>
    </>
  );
}
