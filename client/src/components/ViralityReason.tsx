'use client'

import { Sparkles } from 'lucide-react'

export function ViralityReason({ reason }: { reason: string }) {
  return (
    <div className="flex gap-2.5 rounded-xl bg-zinc-800/60 border border-zinc-700/40 px-3.5 py-3">
      <Sparkles size={11} className="text-amber-400/70 flex-shrink-0 mt-[3px]" />
      <div className="min-w-0">
        <p className="text-[9px] font-mono font-semibold text-amber-400/70 uppercase tracking-[0.12em] mb-1.5">
          Viralizer says
        </p>
        <p className="text-[12px] text-zinc-400 leading-relaxed">
          {reason}
        </p>
      </div>
    </div>
  )
}
