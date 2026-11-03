import GlassPanel from '../ui/GlassPanel.tsx'
import StatChip from '../ui/StatChip.tsx'

// 만든 UI 부품을 모아 보는 전시 화면
function UiKit() {
  return (
    <main className="min-h-dvh bg-canvas-glow px-4 py-8 font-sans break-keep text-body">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <header className="flex items-baseline justify-between gap-4">
          <h1 className="font-display text-3xl font-bold">UI 키트</h1>
          <a href="/" className="text-sm text-emerald underline">
            첫 화면으로
          </a>
        </header>

        <GlassPanel className="flex flex-col gap-2 p-5">
          <h2 className="text-[15px] font-bold">GlassPanel</h2>
          <p className="text-sm text-muted">
            공정 화면의 내용을 담는 유리 패널이에요.
          </p>
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-3 p-5">
          <h2 className="text-[15px] font-bold">StatChip</h2>
          <p className="text-sm text-muted">
            color 값으로 색을 골라요. 숫자는 모두 예시 값이에요.
          </p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <StatChip label="진행률" value={69} unit="%" color="emerald" />
            <StatChip label="O₂" value="6,000" unit="sccm" color="cyan" />
            <StatChip label="TEOS" value={200} unit="sccm" color="amber" />
            <StatChip label="RF 순방향" value={450} unit="W" color="violet" />
          </div>
        </GlassPanel>
      </div>
    </main>
  )
}

export default UiKit
