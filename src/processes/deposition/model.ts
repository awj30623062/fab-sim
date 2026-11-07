// 증착(PECVD) 계산 모델. 화면과 분리된 순수 계산만 둔다
import { fields, steps, type FieldKey, type Recipe, type StepKey } from './definition.ts'
import params from './params.json' with { type: 'json' }

export type Warning = {
  code: 'out-of-range' | 'missing' | 'rf-off-deposit' | 'no-teos' | 'purge-missing' | 'rf-order'
  level: 'interlock' | 'defect' // interlock: 장비가 실행하지 않음 · defect: 실행되지만 막에 문제가 생김
  message: string
  step?: StepKey
  field?: FieldKey
}

export type SimResult = {
  rate: number // 증착률 (Å/min)
  thickness: number // 막 두께 (nm)
  nonUniformity: number | null // 불균일도 (%). 낮을수록 균일. 막이 없으면 null
}

const R_GAS = 8.314 // 기체 상수 J/(mol·K)
const r = params.rate
const u = params.nonUniformity

// 증착률 R = A · F/(F+F₀) · P/(P+P₀) · exp(Q/RT)
// Q > 0이라 온도가 오르면 흡착 반응종의 탈착이 늘어 증착률이 약간 줄어든다
export function depositionRate(teos: number, rf: number, tempC: number) {
  if (teos <= 0 || rf <= 0) return 0
  const T = tempC + 273.15
  return (
    r.A.value *
    (teos / (teos + r.F0.value)) *
    (rf / (rf + r.P0.value)) *
    Math.exp(r.Q.value / (R_GAS * T))
  )
}

// 불균일도(%) 경험식: 기본값 + TEOS 공급 부족 + RF 세기 + 최적 압력에서 벗어난 정도
export function nonUniformity(teos: number, rf: number, pressure: number) {
  return (
    u.U0.value +
    u.kF.value * (r.F0.value / (teos + r.F0.value)) +
    u.kP.value * (rf / (rf + r.P0.value)) +
    u.kp.value * ((pressure - u.pOpt.value) / u.pOpt.value) ** 2
  )
}

// 레시피 점검: 범위 초과·빈 값(인터락), RF 꺼짐·TEOS 없음·퍼지 누락·RF 순서(불량)
export function checkRecipe(recipe: Recipe): Warning[] {
  const warnings: Warning[] = []
  for (const s of steps) {
    for (const f of fields) {
      const v = recipe[s.key][f.key]
      if (v === null) {
        if (f.required)
          warnings.push({ code: 'missing', level: 'interlock', step: s.key, field: f.key, message: `${s.name} 스텝의 ${f.label} 값이 비어 있어요. 장비가 실행하지 않아요.` })
      } else if (!(v >= f.min && v <= f.max)) {
        warnings.push({ code: 'out-of-range', level: 'interlock', step: s.key, field: f.key, message: `${s.name} 스텝의 ${f.label} ${v} ${f.unit}는 허용 범위 ${f.min}~${f.max} ${f.unit}를 벗어나요. 장비가 실행하지 않아요.` })
      }
    }
  }

  const { stabilize, deposit, purge } = recipe
  if (!(deposit.rf ?? 0))
    warnings.push({ code: 'rf-off-deposit', level: 'defect', step: 'deposit', field: 'rf', message: '증착 스텝에서 RF가 꺼져 있어요. 플라즈마가 없으면 이 온도에서는 TEOS가 분해되지 않아 막이 쌓이지 않아요. (열만으로 분해하려면 약 700 °C가 필요해요)' })
  if (!(deposit.teos ?? 0))
    warnings.push({ code: 'no-teos', level: 'defect', step: 'deposit', field: 'teos', message: '증착 스텝에 TEOS가 없어요. 막의 원료가 없어 막이 쌓이지 않아요.' })
  if (!(purge.n2 ?? 0))
    warnings.push({ code: 'purge-missing', level: 'defect', step: 'purge', field: 'n2', message: '퍼지 스텝에 N₂가 없어요. 챔버에 남은 TEOS가 다음 웨이퍼에 파티클을 만들 수 있어요.' })
  if (stabilize.rf ?? 0)
    warnings.push({ code: 'rf-order', level: 'defect', step: 'stabilize', field: 'rf', message: '안정화 스텝에서 RF가 켜져 있어요. 가스 유량과 압력이 안정되기 전에 플라즈마를 켜면 아킹이나 막 불량이 생길 수 있어요.' })
  if (purge.rf ?? 0)
    warnings.push({ code: 'rf-order', level: 'defect', step: 'purge', field: 'rf', message: '퍼지 스텝에서 RF가 켜져 있어요. 남은 가스를 빼는 동안 플라즈마가 켜져 있으면 원하지 않는 막이나 파티클이 생길 수 있어요.' })
  return warnings
}

// 레시피 → 결과 + 경고. 인터락 경고가 있으면 장비가 실행하지 않으므로 result는 null
export function simulate(recipe: Recipe): { result: SimResult | null; warnings: Warning[] } {
  const warnings = checkRecipe(recipe)
  if (warnings.some((w) => w.level === 'interlock')) return { result: null, warnings }

  const d = recipe.deposit
  const teos = d.teos ?? 0
  const rf = d.rf ?? 0
  const rate = depositionRate(teos, rf, d.temp ?? 0)
  const thickness = (rate * (d.time ?? 0)) / 60 / 10 // Å/min × s → Å → nm
  return {
    result: {
      rate,
      thickness,
      nonUniformity: thickness > 0 ? nonUniformity(teos, rf, d.pressure ?? 0) : null,
    },
    warnings,
  }
}
