import type { ComponentProps } from 'react'

// 유리 패널. 안쪽 여백과 배치는 쓰는 쪽에서 className으로 정한다
function GlassPanel({ className = '', ...props }: ComponentProps<'section'>) {
  return (
    <section
      className={`rounded-3xl border border-glass-border bg-glass shadow-glass backdrop-blur-lg ${className}`}
      {...props}
    />
  )
}

export default GlassPanel
