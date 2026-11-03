import InfoTip from './InfoTip.tsx'
import TextInput from './TextInput.tsx'

const dotColors = {
  emerald: 'text-emerald',
  cyan: 'text-cyan',
  amber: 'text-amber',
  violet: 'text-violet',
}

export type RecipeRow = {
  key: string
  label: string
  unit: string
  tip: { title: string; body: string }
  min: number
  max: number
  step?: number
  varied?: boolean // 실험 변수: 초록으로 강조
  values: (number | null)[] // 스텝 순서대로. null은 그 스텝에서 쓰지 않는 칸(–)
}

type RecipeTableProps = {
  steps: readonly { name: string; color: keyof typeof dotColors }[]
  rows: RecipeRow[]
  onChange: (key: string, step: number, value: number | null) => void
}

// 스텝별 레시피 입력 표. 작은 화면에서는 항목 이름을 윗줄로 올려 가로 스크롤 없이 보인다
// (가로 스크롤 영역 안에서는 InfoTip이 잘리기 때문)
function RecipeTable({ steps, rows, onChange }: RecipeTableProps) {
  return (
    <table className="w-full table-fixed border-separate border-spacing-0 text-sm sm:border-spacing-y-2">
      <thead className="text-[13px] text-muted">
        <tr>
          <th scope="col" className="hidden w-40 px-3 py-1 text-left font-medium sm:table-cell">
            항목
          </th>
          {steps.map((s) => (
            <th key={s.name} scope="col" className="px-1 py-1 text-left font-medium first-of-type:pl-3 sm:px-3">
              <span aria-hidden="true" className={dotColors[s.color]}>
                ●
              </span>{' '}
              {s.name}
            </th>
          ))}
        </tr>
      </thead>
      {rows.map((row) => {
        const bg = row.varied ? 'bg-emerald/8' : 'sm:bg-white/[0.025]'
        const edge = row.varied ? 'border-emerald' : 'border-transparent'
        const name = (
          <>
            <span className="font-medium">{row.label}</span>{' '}
            <span className="text-xs text-muted">{row.unit}</span>{' '}
            <InfoTip label={row.label} title={row.tip.title}>
              {row.tip.body}
            </InfoTip>
            {row.varied && (
              <span className="block text-[11px] font-bold text-emerald">실험 변수</span>
            )}
          </>
        )
        return (
          <tbody key={row.key}>
            <tr className="sm:hidden">
              <th
                scope="colgroup"
                colSpan={steps.length}
                className={`rounded-t-[14px] border-l-2 px-3 pt-3 pb-1.5 text-left font-normal ${bg} ${edge}`}
              >
                {name}
              </th>
            </tr>
            <tr>
              <th
                scope="row"
                className={`hidden rounded-l-[14px] border-l-2 px-3 py-2.5 text-left font-normal sm:table-cell ${bg} ${edge}`}
              >
                {name}
              </th>
              {row.values.map((v, i) => (
                <td
                  key={steps[i].name}
                  className={`px-1 pb-3 first-of-type:rounded-bl-[14px] first-of-type:border-l-2 first-of-type:pl-3 last:rounded-br-[14px] last:pr-3 sm:px-2 sm:py-1.5 sm:first-of-type:rounded-none sm:first-of-type:border-l-0 sm:first-of-type:pl-2 sm:last:rounded-r-[14px] sm:last:pr-2 ${bg} ${edge}`}
                >
                  <TextInput
                    aria-label={`${row.label} ${steps[i].name}`}
                    value={v ?? ''}
                    placeholder="–"
                    min={row.min}
                    max={row.max}
                    step={row.step ?? 'any'}
                    highlight={row.varied && v !== null}
                    onChange={(e) =>
                      onChange(row.key, i, e.target.value === '' ? null : Number(e.target.value))
                    }
                  />
                </td>
              ))}
            </tr>
          </tbody>
        )
      })}
    </table>
  )
}

export default RecipeTable
