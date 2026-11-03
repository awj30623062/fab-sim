import type { ComponentProps } from 'react'

type TextInputProps = ComponentProps<'input'> & {
  highlight?: boolean // 실험 변수처럼 눈에 띄어야 하는 칸
}

// 레시피 숫자 입력칸. 이름은 aria-label이나 <label>로 붙인다.
// min/max를 벗어나면 브라우저가 :invalid로 판단해 빨간 테두리가 된다.
// 좁은 칸에서도 숫자가 보이게 증감 화살표는 숨긴다 (↑↓ 키는 그대로 동작)
function TextInput({ highlight = false, className = '', ...props }: TextInputProps) {
  return (
    <input
      type="number"
      inputMode="decimal"
      className={`w-full [appearance:textfield] rounded-xl border bg-black/25 px-2.5 py-2.5 font-display text-base text-body placeholder:text-muted invalid:border-red invalid:text-red-light sm:px-3 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
        highlight ? 'border-emerald/80 shadow-glow-emerald-soft' : 'border-white/10'
      } ${className}`}
      {...props}
    />
  )
}

export default TextInput
