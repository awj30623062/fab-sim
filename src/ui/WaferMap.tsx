import { useEffect, useRef, useState } from 'react'

type WaferPoint = { x: number; y: number; value: number } // 위치는 웨이퍼 중심 기준 mm(위쪽이 +y), 값은 nm

type WaferMapProps = {
  title: string // 화면 낭독기가 읽는 맵 이름
  points: WaferPoint[]
  min?: number // 색 범위(nm). 여러 장을 비교할 때는 같은 값을 넣는다. 기본은 측정값의 최소·최대
  max?: number
  diameter?: number // mm
  size?: number // px
}

const fmt = (v: number) => v.toLocaleString('ko-KR', { maximumFractionDigits: 1 })

// 원형 웨이퍼 위 측정 지점별 두께를 색으로 보여주는 맵. 얇을수록 짙고 두꺼울수록 밝다.
// 각 위치는 가장 가까운 측정점의 값으로 칠한다. 점 사이를 매끄럽게 이으면(보간)
// 측정하지 않은 가짜 고리 무늬가 생기기 때문이다
function WaferMap({ title, points, min, max, diameter = 300, size = 200 }: WaferMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [active, setActive] = useState<number | null>(null)
  const values = points.map((p) => p.value)
  const lo = min ?? Math.min(...values)
  const hi = max ?? Math.max(...values)
  const mean = values.reduce((a, v) => a + v, 0) / values.length
  const R = diameter / 2
  const toPx = (mm: number) => ((mm + R) / diameter) * size

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const n = Math.round(size * (window.devicePixelRatio || 1))
    canvas.width = n
    canvas.height = n
    // 색은 tokens.css에서 읽는다. fillStyle에 넣었다 빼면 #rrggbb 형식이 된다
    const rgb = (name: string) => {
      ctx.fillStyle = getComputedStyle(canvas).getPropertyValue(name)
      const hex = String(ctx.fillStyle)
      return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    }
    const a = rgb('--color-map-low')
    const b = rgb('--color-map-high')
    const notch = diameter * 0.027 // 노치(방향 표시 V홈)의 깊이. 실제(약 1 mm)보다 크게 그린다
    const gap = (2 * diameter) / size // 영역 사이 2px 틈(mm)
    const img = ctx.createImageData(n, n)
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const x = ((i + 0.5) / n) * diameter - R
        const y = R - ((j + 0.5) / n) * diameter
        if (y + R < notch - Math.abs(x)) continue // 아래쪽 V홈 안은 투명으로 둔다
        let d1 = Infinity
        let d2 = Infinity
        let v = 0
        for (const p of points) {
          const d = Math.hypot(p.x - x, p.y - y)
          if (d < d1) {
            d2 = d1
            d1 = d
            v = p.value
          } else if (d < d2) d2 = d
        }
        if (d2 - d1 < gap) continue // 두 측정점의 경계: 틈으로 비운다
        const t = hi > lo ? Math.min(1, Math.max(0, (v - lo) / (hi - lo))) : 0.5
        const k = (j * n + i) * 4
        img.data[k] = a[0] + (b[0] - a[0]) * t
        img.data[k + 1] = a[1] + (b[1] - a[1]) * t
        img.data[k + 2] = a[2] + (b[2] - a[2]) * t
        img.data[k + 3] = 255
      }
    }
    ctx.putImageData(img, 0, 0)
  }, [points, lo, hi, diameter, size, R])

  const p = active === null ? null : points[active]

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={`${title}. 측정점 ${points.length}개, 최소 ${fmt(Math.min(...values))} nm, 최대 ${fmt(Math.max(...values))} nm, 평균 ${fmt(mean)} nm`}
          className="size-full rounded-full shadow-glow-emerald-wide"
        />
        <svg width={size} height={size} className="absolute inset-0 overflow-visible">
          {points.map((pt, i) => {
            const cx = toPx(pt.x)
            const cy = toPx(-pt.y)
            return (
              <g key={`${pt.x},${pt.y}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={active === i ? 5.5 : 4}
                  strokeWidth="1.5"
                  className={active === i ? 'fill-body stroke-canvas' : 'fill-canvas stroke-body'}
                />
                {/* 점보다 큰 투명 영역이 마우스·키보드를 받는다 */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={12}
                  fill="transparent"
                  tabIndex={0}
                  role="img"
                  aria-label={`(${pt.x}, ${pt.y}) mm: ${fmt(pt.value)} nm`}
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="outline-none"
                />
              </g>
            )
          })}
        </svg>
        {p && (
          <div
            className="pointer-events-none absolute z-10 w-max -translate-x-1/2 -translate-y-full rounded-xl border border-glass-border bg-surface/95 px-3 py-2 text-xs shadow-glass"
            style={{ left: toPx(p.x), top: toPx(-p.y) - 12 }}
          >
            <b className="font-display text-sm text-body">{fmt(p.value)}</b>{' '}
            <span className="text-muted">nm</span>
            <div className="text-muted">
              ({p.x}, {p.y}) mm
            </div>
          </div>
        )}
      </div>

      <div className="flex w-full max-w-60 flex-col gap-1.5 text-xs text-muted">
        <div className="flex justify-between gap-2">
          <span>
            얇음 · <span className="font-display tabular-nums">{fmt(lo)}</span> nm
          </span>
          <span>
            <span className="font-display tabular-nums">{fmt(hi)}</span> nm · 두꺼움
          </span>
        </div>
        <span
          aria-hidden="true"
          className="h-2 rounded-full bg-linear-to-r/srgb from-map-low to-map-high"
        />
      </div>

      <details className="w-full text-sm">
        <summary className="cursor-pointer text-muted">표로 보기</summary>
        <table className="mt-2 w-full text-left">
          <thead className="text-xs text-muted">
            <tr>
              <th scope="col" className="py-1 font-medium">
                위치 (x, y) mm
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                두께 (nm)
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((pt) => (
              <tr key={`${pt.x},${pt.y}`} className="border-t border-glass-border">
                <th scope="row" className="py-1.5 font-normal">
                  ({pt.x}, {pt.y})
                </th>
                <td className="py-1.5 text-right font-display tabular-nums">{fmt(pt.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  )
}

export default WaferMap
