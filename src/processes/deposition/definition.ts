// 증착(PECVD) 레시피 정의: 항목·단위·허용 범위·기본값, 3스텝 구성.
// 계산(model.ts)과 화면이 모두 이 정의를 쓴다

export const steps = [
  { key: 'stabilize', name: '안정화' },
  { key: 'deposit', name: '증착' },
  { key: 'purge', name: '퍼지' },
] as const

export type StepKey = (typeof steps)[number]['key']

// defaults는 스텝 순서(안정화, 증착, 퍼지)대로. null은 그 스텝에서 쓰지 않는 칸(–)이고 0으로 계산한다.
// required 항목은 모든 스텝에 값이 있어야 한다
export const fields = [
  { key: 'temp', label: '온도', unit: '°C', min: 200, max: 450, required: true, defaults: [400, 400, 400] },
  { key: 'pressure', label: '압력', unit: 'Torr', min: 0.5, max: 10, required: true, defaults: [3, 3, 3] },
  { key: 'teos', label: 'TEOS', unit: 'sccm', min: 0, max: 1000, required: false, defaults: [200, 200, null] },
  { key: 'o2', label: 'O₂', unit: 'sccm', min: 0, max: 10000, required: false, defaults: [6000, 6000, null] },
  { key: 'n2', label: 'N₂', unit: 'sccm', min: 0, max: 10000, required: false, defaults: [null, null, 3000] },
  { key: 'rf', label: 'RF 전력', unit: 'W', min: 0, max: 1000, required: false, defaults: [0, 450, 0] },
  { key: 'time', label: '시간', unit: 's', min: 1, max: 600, required: true, defaults: [20, 90, 20] },
] as const

export type FieldKey = (typeof fields)[number]['key']
export type StepValues = Record<FieldKey, number | null>
export type Recipe = Record<StepKey, StepValues>

// 기본 레시피 (PM A)
export const defaultRecipe = Object.fromEntries(
  steps.map((s, i) => [s.key, Object.fromEntries(fields.map((f) => [f.key, f.defaults[i]]))]),
) as Recipe

// 대조 실험: PM A/B/C는 TEOS 유량만 다르고 나머지는 같다
export const chambers = [
  { name: 'PM A', teos: 200 },
  { name: 'PM B', teos: 300 },
  { name: 'PM C', teos: 400 },
] as const

// TEOS를 쓰는 스텝(안정화·증착)의 유량만 바꾼 레시피
export function withTeos(recipe: Recipe, teos: number): Recipe {
  return {
    ...recipe,
    stabilize: { ...recipe.stabilize, teos },
    deposit: { ...recipe.deposit, teos },
  }
}
