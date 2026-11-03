const steps = ['개념', '예측', '레시피', '운전', '결과'] as const

export type Step = (typeof steps)[number]

type StepTabsProps = {
  current: Step
  onSelect: (step: Step) => void
}

// 알약 모양 단계 탭. 현재 단계만 초록으로 빛난다
function StepTabs({ current, onSelect }: StepTabsProps) {
  return (
    <nav
      aria-label="실습 단계"
      className="flex w-full gap-1.5 rounded-full border border-glass-border bg-white/5 p-1.5 backdrop-blur-lg sm:inline-flex sm:w-fit"
    >
      {steps.map((step) => (
        <button
          key={step}
          type="button"
          aria-current={step === current ? 'step' : undefined}
          onClick={() => onSelect(step)}
          className={`flex-1 rounded-full py-2.5 text-[13px] whitespace-nowrap sm:flex-none sm:px-4 sm:text-sm ${
            step === current
              ? 'bg-emerald font-bold text-on-emerald shadow-glow-emerald'
              : 'text-muted hover:text-body'
          }`}
        >
          {step}
        </button>
      ))}
    </nav>
  )
}

export default StepTabs
