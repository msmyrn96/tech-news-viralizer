function scoreStyle(score: number): string {
  if (score >= 9) return 'text-red-400 bg-red-950/60 border-red-800/60';
  if (score >= 7) return 'text-orange-400 bg-orange-950/60 border-orange-800/60';
  if (score >= 5) return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
  return 'text-zinc-400 bg-zinc-800/60 border-zinc-700/60';
}

function scoreLabel(score: number): string {
  if (score >= 9) return 'FIRE';
  if (score >= 7) return 'HOT';
  if (score >= 5) return 'TRENDING';
  return 'SIGNAL';
}

export function ViralityBadge({ score }: { score: number }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono font-semibold tracking-wider ${scoreStyle(score)}`}
    >
      <span className="font-bold">{score}</span>
      <span className="opacity-50">·</span>
      <span>{scoreLabel(score)}</span>
    </span>
  );
}
