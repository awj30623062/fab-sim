import type { ComponentProps } from 'react'

const variants = {
  primary:
    'border-transparent bg-button-emerald font-bold text-on-emerald shadow-glow-emerald hover:brightness-110',
  secondary: 'border-white/12 bg-white/5 text-body hover:bg-white/10',
  danger: 'border-red/60 bg-red/15 font-bold text-red-light hover:bg-red/25',
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: keyof typeof variants // 주요(초록) · 보조(투명) · 위험(빨강)
}

function Button({
  variant = 'secondary',
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-[14px] border px-[18px] py-[13px] text-sm disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    />
  )
}

export default Button
