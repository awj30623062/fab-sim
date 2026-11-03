type GaugeProps = {
  value: number // 0~100(%)
  caption?: string
}

// 원형 진행률 게이지
function Gauge({ value, caption }: GaugeProps) {
  const pct = Math.round(Math.min(100, Math.max(0, value || 0)))
  return (
    <div
      role="progressbar"
      aria-label="진행률"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={caption ? `${pct}% · ${caption}` : `${pct}%`}
      className="grid size-[168px] place-items-center rounded-full shadow-glow-emerald-wide"
      style={{
        background: `conic-gradient(var(--color-emerald) ${pct}%, rgba(255, 255, 255, 0.08) 0)`,
      }}
    >
      <div className="flex size-[136px] flex-col items-center justify-center gap-0.5 rounded-full bg-surface">
        <span className="font-display text-4xl font-bold">
          {pct}
          <span className="text-lg">%</span>
        </span>
        {caption && <span className="text-xs text-muted">{caption}</span>}
      </div>
    </div>
  )
}

export default Gauge
