import { useState } from 'react'
import Button from '../ui/Button.tsx'
import Gauge from '../ui/Gauge.tsx'
import GlassPanel from '../ui/GlassPanel.tsx'
import InfoTip from '../ui/InfoTip.tsx'
import StatChip from '../ui/StatChip.tsx'
import StepTabs, { type Step } from '../ui/StepTabs.tsx'
import TextInput from '../ui/TextInput.tsx'

// 만든 UI 부품을 모아 보는 전시 화면
function UiKit() {
  const [progress, setProgress] = useState(69)
  const [step, setStep] = useState<Step>('레시피')

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

        <GlassPanel className="flex flex-col gap-3 p-5">
          <h2 className="text-[15px] font-bold">Gauge</h2>
          <p className="text-sm text-muted">
            슬라이더로 값을 바꿔 보세요. 0~100 밖의 값은 끝값으로 맞춰요.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <Gauge value={progress} caption={`증착 ${Math.round(progress * 0.9)} / 90 s`} />
            <label className="flex flex-col gap-2 text-sm text-muted">
              진행률 {progress}%
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-48 accent-emerald"
              />
            </label>
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-3 p-5">
          <h2 className="text-[15px] font-bold">StepTabs</h2>
          <p className="text-sm text-muted">
            탭을 눌러 보세요. 현재 단계: <b className="text-body">{step}</b>
          </p>
          <StepTabs current={step} onSelect={setStep} />
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-3 p-5">
          <h2 className="text-[15px] font-bold">Button</h2>
          <p className="text-sm text-muted">
            variant 값으로 주요 · 보조 · 위험을 골라요.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Button variant="primary">운전 시작</Button>
            <Button>저장</Button>
            <Button variant="danger">비상 정지</Button>
            <Button disabled>사용할 수 없음</Button>
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-3 p-5">
          <h2 className="text-[15px] font-bold">TextInput</h2>
          <p className="text-sm text-muted">
            허용 범위(min~max)를 벗어나면 빨간 테두리가 돼요. 범위는 예시예요.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-sm">
              <span>
                온도 <span className="text-xs text-muted">°C</span>
              </span>
              <TextInput defaultValue={400} min={100} max={450} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span>
                TEOS <span className="text-xs text-muted">sccm · 실험 변수</span>
              </span>
              <TextInput defaultValue={200} min={0} max={1000} highlight />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span>
                압력 <span className="text-xs text-muted">Torr · 범위 초과</span>
              </span>
              <TextInput defaultValue={12} min={0.5} max={10} step={0.1} />
            </label>
          </div>
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-3 p-5">
          <h2 className="text-[15px] font-bold">InfoTip</h2>
          <p className="text-sm text-muted">
            ⓘ를 눌러 보세요. 다시 누르거나, 바깥을 누르거나, Esc로 닫혀요.
          </p>
          <p className="text-sm">
            <span className="font-medium">RF 전력</span>{' '}
            <span className="text-xs text-muted">W</span>{' '}
            <InfoTip label="RF 전력" title="RF 전력 · 플라즈마의 세기">
              TEOS를 분해하는 플라즈마를 얼마나 세게 켤지 정해요. 높일수록
              증착률이 오르고 막이 치밀해지지만, 너무 높으면 아킹이 생길 수
              있어요.
            </InfoTip>
          </p>
        </GlassPanel>
      </div>
    </main>
  )
}

export default UiKit
