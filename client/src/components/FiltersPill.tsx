"use client"

import * as Popover from "@radix-ui/react-popover"
import { AnimatePresence, motion } from "framer-motion"
import { SlidersHorizontal } from "lucide-react"
import { useState } from "react"
import SourcesSectionPill from "./SourcesSectionPill"
import TagsSectionPill from "./TagsSectionPill"
import ViralitySectionPill from "./ViralitySectionPill"

type FiltersPillProps = {
  activeSource: string | null
  setActiveSource: (source: string | null) => void
  activeTag: string | null
  setActiveTag: (tag: string | null) => void
  minScore: number | null
  setMinScore: (score: number | null) => void
}

const FiltersPill = ({
  activeSource,
  setActiveSource,
  activeTag,
  setActiveTag,
  minScore,
  setMinScore,
}: FiltersPillProps) => {
  const [open, setOpen] = useState(false)

  const activeCount =
    Number(activeSource !== null) +
    Number(activeTag !== null) +
    Number(minScore !== null)

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={`relative flex items-center gap-1.5 px-3 py-2.5 rounded-full text-[11px] font-mono uppercase tracking-[0.1em] transition-all duration-150 cursor-pointer border flex-shrink-0 ${
            open || activeCount > 0
              ? "bg-zinc-700 border-zinc-600 text-zinc-100"
              : "bg-zinc-800/80 border-zinc-700/50 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
          }`}
        >
          <SlidersHorizontal size={11} />
          Filters
          {activeCount > 0 && (
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-bold leading-none">
              {activeCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          forceMount
          align="end"
          sideOffset={8}
          collisionPadding={16}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-50 outline-none"
        >
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="w-[calc(100vw-2rem)] sm:w-96 lg:w-[420px] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden"
              >
                <div className="divide-y divide-zinc-800/60">
                  <div className="px-4">
                    <SourcesSectionPill
                      activeSource={activeSource}
                      setActiveSource={setActiveSource}
                    />
                  </div>
                  <div className="px-4">
                    <TagsSectionPill
                      activeTag={activeTag}
                      setActiveTag={setActiveTag}
                    />
                  </div>
                  <div className="px-4">
                    <ViralitySectionPill
                      minScore={minScore}
                      setMinScore={setMinScore}
                    />
                  </div>
                </div>

                {activeCount > 0 && (
                  <div className="px-4 py-3 border-t border-zinc-800/60">
                    <button
                      onClick={() => {
                        setActiveSource(null)
                        setActiveTag(null)
                        setMinScore(null)
                      }}
                      className="w-full text-center text-[11px] font-mono uppercase tracking-[0.1em] text-zinc-500 hover:text-zinc-300 transition-colors duration-150 cursor-pointer py-1"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

export default FiltersPill
