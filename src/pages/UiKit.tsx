import { useState } from 'react'
import Button from '../ui/Button.tsx'
import CrossSection from '../ui/CrossSection.tsx'
import Gauge from '../ui/Gauge.tsx'
import GlassPanel from '../ui/GlassPanel.tsx'
import InfoTip from '../ui/InfoTip.tsx'
import LineChart from '../ui/LineChart.tsx'
import RecipeTable, { type RecipeRow } from '../ui/RecipeTable.tsx'
import StatChip from '../ui/StatChip.tsx'
import StepTabs, { type Step } from '../ui/StepTabs.tsx'
import TextInput from '../ui/TextInput.tsx'
import WaferMap from '../ui/WaferMap.tsx'

const recipeSteps = [
  { name: '안정화', color: 'cyan' },
  { name: '증착', color: 'emerald' },
  { name: '퍼지', color: 'violet' },
] as const

// 전시용 예시 레시피 (PM A). 범위(min~max)도 예시 값
const sampleRecipe: RecipeRow[] = [
  {
    key: 'temp', label: '온도', unit: '°C', min: 100, max: 450, values: [400, 400, 400],
    tip: { title: '온도 · 웨이퍼를 데우는 정도', body: '높을수록 표면 반응이 빨라져 증착률이 오르고 막이 치밀해져요.' },
  },
  {
    key: 'pressure', label: '압력', unit: 'Torr', min: 0.5, max: 10, step: 0.1, values: [3, 3, 3],
    tip: { title: '압력 · 챔버 안 가스의 압력', body: '플라즈마 밀도와 가스가 퍼지는 정도에 영향을 줘요.' },
  },
  {
    key: 'teos', label: 'TEOS', unit: 'sccm', min: 0, max: 1000, varied: true, values: [200, 200, null],
    tip: { title: 'TEOS · 막의 원료', body: 'SiO₂ 막의 실리콘을 공급하는 원료 가스예요. 이번 실험에서 바꾸는 값이에요.' },
  },
  {
    key: 'o2', label: 'O₂', unit: 'sccm', min: 0, max: 10000, values: [6000, 6000, null],
    tip: { title: 'O₂ · 산소 공급', body: 'TEOS와 반응해 SiO₂를 만드는 산소예요.' },
  },
  {
    key: 'n2', label: 'N₂', unit: 'sccm', min: 0, max: 10000, values: [null, null, 3000],
    tip: { title: 'N₂ · 퍼지 가스', body: '퍼지 스텝에서 챔버에 남은 가스를 밀어내요.' },
  },
  {
    key: 'rf', label: 'RF 전력', unit: 'W', min: 0, max: 1000, values: [0, 450, 0],
    tip: {
      title: 'RF 전력 · 플라즈마의 세기',
      body: 'TEOS를 분해하는 플라즈마를 얼마나 세게 켤지 정해요. 높일수록 증착률이 오르고 막이 치밀해지지만, 너무 높으면 아킹이 생길 수 있어요.',
    },
  },
  {
    key: 'time', label: '시간', unit: 's', min: 1, max: 600, values: [20, 90, 20],
    tip: { title: '스텝 시간', body: '각 스텝을 유지하는 시간이에요. 막 두께 = 증착률 × 증착 스텝 시간.' },
  },
]

// 전시용 예시 측정점 13개 (mm, nm). 중심이 두껍고 가장자리로 갈수록 얇다
const sampleWafer = [
  { x: 0, y: 0, value: 985 },
  { x: 75, y: 0, value: 978 },
  { x: 0, y: 75, value: 980 },
  { x: -75, y: 0, value: 976 },
  { x: 0, y: -75, value: 979 },
  { x: 130, y: 0, value: 958 },
  { x: 92, y: 92, value: 955 },
  { x: 0, y: 130, value: 961 },
  { x: -92, y: 92, value: 952 },
  { x: -130, y: 0, value: 950 },
  { x: -92, y: -92, value: 954 },
  { x: 0, y: -130, value: 957 },
  { x: 92, y: -92, value: 960 },
]

// 만든 UI 부품을 모아 보는 전시 화면
function UiKit() {
  const [progress, setProgress] = useState(69)
  const [step, setStep] = useState<Step>('레시피')
  const [recipe, setRecipe] = useState(sampleRecipe)

  const updateRecipe = (key: string, i: number, value: number | null) =>
    setRecipe((rows) =>
      rows.map((r) =>
        r.key === key ? { ...r, values: r.values.map((v, j) => (j === i ? value : v)) } : r,
      ),
    )

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

        <GlassPanel className="flex flex-col gap-3 p-5">
          <h2 className="text-[15px] font-bold">RecipeTable</h2>
          <p className="text-sm text-muted">
            스텝별 레시피 입력 표예요. 실험 변수 행은 초록으로 강조돼요. 값은 모두 예시예요.
          </p>
          <RecipeTable steps={recipeSteps} rows={recipe} onChange={updateRecipe} />
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-3 p-5">
          <h2 className="text-[15px] font-bold">LineChart</h2>
          <p className="text-sm text-muted">
            그래프 위에 마우스를 올리거나 Tab으로 이동해 보세요. 값은 모두 예시예요.
          </p>
          <LineChart
            title="TEOS 유량에 따른 증착률과 불균일도 (예시)"
            x={[
              { label: 'PM A', sub: '200' },
              { label: 'PM B', sub: '300' },
              { label: 'PM C', sub: '400' },
            ]}
            xTitle="TEOS 유량 (sccm)"
            left={{ name: '증착률', unit: 'Å/min', color: 'emerald', values: [4200, 5400, 6500], min: 3000, max: 8000 }}
            right={{ name: '불균일도', unit: '%', color: 'amber', values: [3.2, 2.6, 2.1], min: 0, max: 5 }}
          />
          <p className="text-xs text-muted">불균일도는 값이 낮을수록 균일해요.</p>
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-3 p-5">
          <h2 className="text-[15px] font-bold">CrossSection</h2>
          <p className="text-sm text-muted">
            막 높이는 모두 같은 비율이라 나란히 비교할 수 있어요. 두께 = 증착률 × 증착
            시간 (예: 4,200 Å/min × 90 s = 630 nm). 값은 모두 예시예요.
          </p>
          <CrossSection
            items={[
              { label: 'PM A · TEOS 200', thickness: 630 },
              { label: 'PM B · TEOS 300', thickness: 810 },
              { label: 'PM C · TEOS 400', thickness: 975 },
            ]}
          />
        </GlassPanel>

        <GlassPanel className="flex flex-col gap-3 p-5">
          <h2 className="text-[15px] font-bold">WaferMap</h2>
          <p className="text-sm text-muted">
            측정점에 마우스를 올리거나 Tab으로 이동해 보세요. 각 영역은 가장 가까운
            측정점의 두께로 칠해요. 아래쪽 V자 홈은 웨이퍼 방향을 알려주는 노치예요. 값은
            모두 예시예요.
          </p>
          <WaferMap title="웨이퍼 두께 맵 · PM C (예시)" points={sampleWafer} />
        </GlassPanel>
      </div>
    </main>
  )
}

export default UiKit
