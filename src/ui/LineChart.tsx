import { useId, useLayoutEffect, useRef, useState } from 'react'

const seriesColors = {
  emerald: 'text-emerald',
  cyan: 'text-cyan',
  amber: 'text-amber',
  violet: 'text-violet',
}

type Series = {
  name: string
  unit: string
  color: keyof typeof seriesColors
  values: number[] // x 순서대로
  min: number // 축 범위. 눈금은 min~max를 똑같이 나눈다
  max: number
}

type LineChartProps = {
  title: string // 화면 낭독기가 읽는 차트 이름
  x: { label: string; sub?: string }[]
  xTitle: string
  left: Series // 왼쪽 축 · 실선
  right: Series // 오른쪽 축 · 점선
  ticks?: number // 눈금 개수. 양쪽 축이 같은 격자선을 쓴다
}

const H = 260
const M = { top: 28, right: 40, bottom: 64, left: 48 }

const fmt = (v: number) => v.toLocaleString('ko-KR', { maximumFractionDigits: 2 })

// 점 사이를 부드럽게 잇되, 점과 점 사이에서 값이 튀어 오르거나 꺼지지 않게 한다
// (Steffen 방식 단조 3차 곡선: 접선 기울기를 이웃 기울기의 2배 이하로 묶는다)
function curve(pts: [number, number][]) {
  let d = `M${pts[0][0]},${pts[0][1]}`
  const n = pts.length
  if (n < 2) return d
  const h = (i: number) => pts[i + 1][0] - pts[i][0]
  const s = (i: number) => (pts[i + 1][1] - pts[i][1]) / h(i)
  const m = pts.map((_, i) => {
    if (i === 0) return s(0)
    if (i === n - 1) return s(n - 2)
    const a = s(i - 1)
    const b = s(i)
    const p = (a * h(i) + b * h(i - 1)) / (h(i - 1) + h(i))
    return (Math.sign(a) + Math.sign(b)) * Math.min(Math.abs(a), Math.abs(b), Math.abs(p) / 2)
  })
  for (let i = 0; i < n - 1; i++) {
    const t = h(i) / 3
    const [x0, y0] = pts[i]
    const [x1, y1] = pts[i + 1]
    d += ` C${x0 + t},${y0 + m[i] * t} ${x1 - t},${y1 - m[i + 1] * t} ${x1},${y1}`
  }
  return d
}

function LineKey({ color, dashed }: { color: Series['color']; dashed: boolean }) {
  return (
    <svg width="18" height="4" aria-hidden="true" className={`shrink-0 ${seriesColors[color]}`}>
      <line
        x1="1"
        x2="17"
        y1="2"
        y2="2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={dashed ? '4 3' : undefined}
      />
    </svg>
  )
}

// 빛나는 곡선 그래프. 선 두 개, 축은 왼쪽·오른쪽 따로
function LineChart({ title, x, xTitle, left, right, ticks = 6 }: LineChartProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const [active, setActive] = useState<number | null>(null)
  const id = useId().replace(/[^\w-]/g, '')

  // 실제 폭으로 다시 그려서, 휴대폰에서도 글자가 작아지지 않게 한다
  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const series = [left, right]
  const plotW = Math.max(0, width - M.left - M.right)
  const base = H - M.bottom
  const step = plotW / x.length
  const px = (i: number) => M.left + (i + 0.5) * step
  const py = (s: Series, v: number) => base - ((v - s.min) / (s.max - s.min)) * (base - M.top)
  const grid = Array.from({ length: ticks }, (_, k) => k / (ticks - 1))
  const last = x.length - 1
  const tipW = 168

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {series.map((s, k) => (
          <li key={s.name} className="flex items-center gap-1.5">
            <LineKey color={s.color} dashed={k === 1} />
            <span className="text-body">{s.name}</span>
            {s.unit} · {k === 0 ? '왼쪽' : '오른쪽'} 축
          </li>
        ))}
      </ul>

      <div ref={boxRef} className="relative" style={{ height: H }}>
        {width > 0 && (
          <svg width={width} height={H} role="group" aria-label={title} className="block overflow-visible">
            <defs>
              <filter id={`${id}glow`} x="-20%" y="-50%" width="140%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {grid.map((t) => {
              const y = Math.round(base - t * (base - M.top)) + 0.5
              return (
                <g key={t} className="font-display text-xs tabular-nums">
                  <line x1={M.left} x2={M.left + plotW} y1={y} y2={y} className="stroke-white/10" />
                  <text x={M.left - 8} y={y} dy="0.32em" textAnchor="end" className="fill-muted">
                    {fmt(left.min + t * (left.max - left.min))}
                  </text>
                  <text x={M.left + plotW + 8} y={y} dy="0.32em" className="fill-muted">
                    {fmt(right.min + t * (right.max - right.min))}
                  </text>
                </g>
              )
            })}

            {active !== null && (
              <line x1={px(active)} x2={px(active)} y1={M.top} y2={base} className="stroke-white/30" />
            )}

            {series.map((s, k) => {
              const pts = s.values.map((v, i) => [px(i), py(s, v)] as [number, number])
              const d = curve(pts)
              return (
                <g key={s.name} className={seriesColors[s.color]}>
                  {k === 0 && (
                    <>
                      <linearGradient id={`${id}area`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0" stopColor="currentColor" stopOpacity="0.18" />
                        <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                      </linearGradient>
                      <path
                        d={`${d} L${pts[last][0]},${base} L${pts[0][0]},${base} Z`}
                        fill={`url(#${id}area)`}
                      />
                    </>
                  )}
                  <path
                    d={d}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={k === 1 ? '6 5' : undefined}
                    filter={`url(#${id}glow)`}
                  />
                  {pts.map(([cx, cy], i) => {
                    const r = active === i ? 6 : 4.5
                    return k === 0 ? (
                      <circle key={i} cx={cx} cy={cy} r={r} fill="currentColor" strokeWidth="2" className="stroke-surface" />
                    ) : (
                      <rect
                        key={i}
                        x={cx - r}
                        y={cy - r}
                        width={r * 2}
                        height={r * 2}
                        transform={`rotate(45 ${cx} ${cy})`}
                        fill="currentColor"
                        strokeWidth="2"
                        className="stroke-surface"
                      />
                    )
                  })}
                </g>
              )
            })}

            {/* 끝 값은 점의 왼쪽으로 펼쳐서 오른쪽 축 숫자와 겹치지 않게 한다 */}
            {series.map((s, k) => (
              <text
                key={s.name}
                x={px(last) + 6}
                y={py(s, s.values[last]) + (k === 0 ? -14 : 24)}
                textAnchor="end"
                stroke="var(--color-surface)"
                strokeWidth="4"
                className="fill-body font-display text-[13px] font-bold [paint-order:stroke]"
              >
                {fmt(s.values[last])} {s.unit}
              </text>
            ))}

            {x.map((c, i) => (
              <text key={c.label} x={px(i)} y={base + 22} textAnchor="middle" className="fill-body text-[13px]">
                {c.label}
                {c.sub && (
                  <tspan x={px(i)} dy="1.35em" className="fill-muted font-display text-xs">
                    {c.sub}
                  </tspan>
                )}
              </text>
            ))}
            <text x={M.left + plotW / 2} y={H - 4} textAnchor="middle" className="fill-muted text-[11px]">
              {xTitle}
            </text>

            {/* 마우스·키보드 영역: x마다 세로 띠 하나. 가장 가까운 x에 맞춰진다.
                초점 표시는 테두리 대신 세로선·커진 점·값 상자가 맡는다 */}
            {x.map((c, i) => (
              <rect
                key={c.label}
                x={M.left + i * step}
                y={M.top}
                width={step}
                height={base - M.top}
                fill="transparent"
                tabIndex={0}
                role="img"
                aria-label={`${c.label}${c.sub ? ` ${c.sub}` : ''}: ${series
                  .map((s) => `${s.name} ${fmt(s.values[i])} ${s.unit}`)
                  .join(', ')}`}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="outline-none"
              />
            ))}
          </svg>
        )}

        {active !== null && (
          <div
            className="pointer-events-none absolute top-0 z-10 rounded-xl border border-glass-border bg-surface/95 px-3 py-2 text-xs shadow-glass"
            style={{ width: tipW, left: Math.min(Math.max(px(active) - tipW / 2, 0), width - tipW) }}
          >
            <div className="text-muted">
              {x[active].label} {x[active].sub}
            </div>
            {series.map((s, k) => (
              <div key={s.name} className="mt-1 flex items-center gap-1.5">
                <LineKey color={s.color} dashed={k === 1} />
                <b className="font-display text-sm text-body">{fmt(s.values[active])}</b>
                <span className="text-muted">
                  {s.unit} {s.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted">표로 보기</summary>
        <table className="mt-2 w-full text-left">
          <thead className="text-xs text-muted">
            <tr>
              <th scope="col" className="py-1 font-medium">
                {xTitle}
              </th>
              {series.map((s) => (
                <th key={s.name} scope="col" className="py-1 text-right font-medium">
                  {s.name} ({s.unit})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {x.map((c, i) => (
              <tr key={c.label} className="border-t border-glass-border">
                <th scope="row" className="py-1.5 font-normal">
                  {c.label}
                  {c.sub && ` · ${c.sub}`}
                </th>
                {series.map((s) => (
                  <td key={s.name} className="py-1.5 text-right font-display tabular-nums">
                    {fmt(s.values[i])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}

export default LineChart
