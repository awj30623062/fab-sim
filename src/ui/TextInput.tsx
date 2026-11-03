import type { ComponentProps } from 'react'

type TextInputProps = ComponentProps<'input'> & {
  highlight?: boolean // 실험 변수처럼 눈에 띄어야 하는 칸
}

// 레시피 숫자 입력칸. 이름은 aria-label이나 <label>로 붙인다.
// min/max를 벗어나면 브라우저가 :invalid로 판단해 빨간 테두리가 된다
function TextInput({ highlight = false, className = '', ...props }: TextInputProps) {
  return (
    <input
      type="number"
      inputMode="decimal"
      className={`w-full rounded-xl border bg-black/25 px-3 py-2.5 font-display text-base text-body placeholder:text-muted invalid:border-red invalid:text-red-light ${
        highlight ? 'border-emerald/80 shadow-glow-emerald-soft' : 'border-white/10'
      } ${className}`}
      {...props}
    />
  )
}

export default TextInput
