import { SCORE_BUCKETS } from "@/lib/helpers"

type ViralitySectionPillProps = {
  minScore: number | null
  setMinScore: (score: number | null) => void
}

const ViralitySectionPill = ({
  minScore,
  setMinScore,
}: ViralitySectionPillProps) => {
  return (
    <div className="py-3">
      <div className="w-16 flex-shrink-0 text-right text-[12px] font-mono text-zinc-500 uppercase tracking-[0.12em] mb-2">
        virality
      </div>
      <div className="flex items-center gap-2 flex-wrap flex-1">
        {SCORE_BUCKETS.map(({ label, min, Icon }) => {
          const isActive = minScore === min
          return (
            <button
              key={label}
              onClick={() => setMinScore(min)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono uppercase tracking-[0.1em] transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                isActive
                  ? "bg-amber-400 text-zinc-950 font-semibold"
                  : "bg-zinc-800 text-zinc-400 font-medium hover:bg-zinc-700 hover:text-zinc-200"
              }`}
            >
              {Icon && <Icon size={10} />}
              {label}
              {min !== null && (
                <span className={isActive ? "opacity-60" : "opacity-40"}>
                  {min}+
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ViralitySectionPill
