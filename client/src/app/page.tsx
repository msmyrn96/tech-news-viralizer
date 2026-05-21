import { Nav } from "@/components/Nav"
import { ArticleFeed } from "@/components/ArticleFeed"

export const revalidate = 30

export default async function Home() {
  return (
    <>
      <Nav />
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="mb-8">
          <p className="text-[11px] font-mono text-zinc-600 uppercase tracking-[0.1em] mb-2">
            Intelligence Feed
          </p>
          <h1
            className="font-semibold tracking-tight text-zinc-50 leading-none"
            style={{ fontSize: "clamp(1.875rem, 4vw, 2.25rem)" }}
          >
            What the world
            <br />
            <span className="text-zinc-400">is talking about </span>
            <br />
            <span className="text-zinc-500">right now</span>
          </h1>
        </div>

        <ArticleFeed />
      </main>
    </>
  )
}
