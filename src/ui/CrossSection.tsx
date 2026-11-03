type CrossSectionProps = {
  items: { label: string; thickness: number }[] // 두께는 nm
  scaleMax?: number // 막 칸 꼭대기에 해당하는 두께(nm). 기본은 가장 두꺼운 막의 1.25배
}

const FILM_SPACE = 74 // px. 단면 칸 130px에서 Si 기판 56px을 뺀, 막이 차지할 수 있는 높이

const fmt = (v: number) => v.toLocaleString('ko-KR', { maximumFractionDigits: 1 })

// Si 기판 위 SiO₂ 막 단면. 여러 개를 같은 비율로 나란히 그려 두께를 비교한다
function CrossSection({ items, scaleMax }: CrossSectionProps) {
  const top = scaleMax ?? Math.max(...items.map((i) => i.thickness)) * 1.25
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(72px,1fr))] gap-2 sm:gap-3">
      {items.map((item) => {
        const h = top > 0 ? Math.min(1, Math.max(0, item.thickness / top)) * FILM_SPACE : 0
        return (
          <div
            key={item.label}
            className="flex min-w-0 flex-col gap-2.5 rounded-[18px] border border-white/8 bg-black/25 p-2 sm:p-3"
          >
            <div
              role="img"
              aria-label={`${item.label} SiO₂ 막 두께 ${fmt(item.thickness)} nm 단면`}
              className="flex h-[130px] flex-col justify-end overflow-hidden rounded-xl bg-cross-bg"
            >
              <div
                className="grid shrink-0 place-items-center bg-film text-[11px] font-bold text-on-emerald shadow-glow-emerald"
                style={{ height: h }}
              >
                {h >= 16 && 'SiO₂'}
              </div>
              <div className="grid h-14 shrink-0 place-items-center bg-silicon text-[11px] text-body">
                Si
              </div>
            </div>
            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
              <span className="text-xs text-muted sm:text-[13px]">{item.label}</span>
              <span className="font-display text-lg font-bold sm:text-[22px]">
                {fmt(item.thickness)} <span className="text-xs text-muted">nm</span>
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default CrossSection
