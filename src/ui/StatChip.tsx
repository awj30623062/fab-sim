const chipColors = {
  emerald: 'bg-chip-emerald text-on-emerald',
  cyan: 'bg-chip-cyan text-on-cyan',
  amber: 'bg-chip-amber text-on-amber',
  violet: 'bg-chip-violet text-on-violet',
}

type StatChipProps = {
  label: string
  value: string | number
  unit?: string
  color?: keyof typeof chipColors
}

// 그라데이션 숫자 카드
function StatChip({ label, value, unit, color = 'emerald' }: StatChipProps) {
  return (
    <div className={`rounded-2xl p-3 ${chipColors[color]}`}>
      <span className="block text-xs font-medium">{label}</span>
      <span className="font-display text-[22px] font-bold">{value}</span>
      {unit && <span className="text-[11px]"> {unit}</span>}
    </div>
  )
}

export default StatChip
