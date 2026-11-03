import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

type InfoTipProps = {
  label: string // 무엇에 대한 설명인지. 버튼 이름이 "<label> 설명 보기"가 된다
  title: string
  children: ReactNode
}

// ⓘ 버튼을 누르면 설명이 뜨는 툴팁. 다시 누르거나, 바깥을 누르거나, Esc로 닫는다
// ponytail: 열 때 한 번만 위치를 맞춘다. overflow가 있는 부모 안에서 잘리면 popover로 교체
function InfoTip({ label, title, children }: InfoTipProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const tipRef = useRef<HTMLSpanElement>(null)
  const id = useId()

  // 화면 밖으로 나가지 않게: 가로는 안쪽으로 밀고, 위가 모자라면 아래로 연다
  useLayoutEffect(() => {
    const tip = tipRef.current
    if (!open || !tip) return
    tip.removeAttribute('style')
    const r = tip.getBoundingClientRect()
    const left = Math.max(16, Math.min(r.left, window.innerWidth - 16 - r.width))
    tip.style.translate = `${left - r.left}px`
    if (r.top < 8) Object.assign(tip.style, { bottom: 'auto', top: 'calc(100% + 6px)' })
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      const outside = !ref.current?.contains(e.target as Node)
      if (e instanceof KeyboardEvent ? e.key === 'Escape' : outside) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('pointerdown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  return (
    <span ref={ref} className="relative inline-block align-middle">
      <button
        type="button"
        aria-label={`${label} 설명 보기`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className={`size-6 rounded-full border text-xs font-bold ${
          open
            ? 'border-emerald bg-emerald text-on-emerald'
            : 'border-white/18 text-muted hover:text-body'
        }`}
      >
        i
      </button>
      <span
        ref={tipRef}
        id={id}
        hidden={!open}
        className="absolute bottom-[calc(100%+6px)] left-0 z-10 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2 rounded-2xl border border-emerald/55 bg-surface/96 px-4 py-3.5 text-left shadow-tip"
      >
        <span className="text-sm font-bold text-emerald-light">{title}</span>
        <span className="text-[13px] leading-relaxed text-body">{children}</span>
      </span>
    </span>
  )
}

export default InfoTip
