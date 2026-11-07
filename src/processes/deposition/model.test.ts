import { describe, expect, it } from 'vitest'
import { defaultRecipe, withTeos, type Recipe, type StepKey, type StepValues } from './definition.ts'
import { simulate } from './model.ts'

// 한 스텝의 값만 바꾼 레시피
const set = (recipe: Recipe, step: StepKey, patch: Partial<StepValues>): Recipe => ({
  ...recipe,
  [step]: { ...recipe[step], ...patch },
})

// 인터락 없이 실행된 결과
const run = (recipe: Recipe) => {
  const { result } = simulate(recipe)
  if (!result) throw new Error('인터락으로 실행되지 않음')
  return result
}

const codes = (recipe: Recipe) => simulate(recipe).warnings.map((w) => w.code)

describe('기본 레시피 (PM A)', () => {
  it('경고 없이 막이 쌓인다', () => {
    const { result, warnings } = simulate(defaultRecipe)
    expect(warnings).toEqual([])
    expect(result!.thickness).toBeGreaterThan(0)
  })
})

describe('경향', () => {
  it('TEOS↑ → 증착률↑, 많아질수록 증가 폭은 줄어든다', () => {
    const [a, b, c] = [200, 300, 400].map((f) => run(withTeos(defaultRecipe, f)).rate)
    expect(b).toBeGreaterThan(a)
    expect(c).toBeGreaterThan(b)
    expect(c - b).toBeLessThan(b - a)
  })

  it('RF 전력↑ → 증착률↑', () => {
    const [a, b, c] = [300, 450, 600].map((p) => run(set(defaultRecipe, 'deposit', { rf: p })).rate)
    expect(b).toBeGreaterThan(a)
    expect(c).toBeGreaterThan(b)
  })

  it('증착 시간 2배 → 두께 2배', () => {
    const t1 = run(set(defaultRecipe, 'deposit', { time: 90 })).thickness
    const t2 = run(set(defaultRecipe, 'deposit', { time: 180 })).thickness
    expect(t2 / t1).toBeCloseTo(2, 10)
  })

  it('온도↑ → 증착률 약간↓: 50 °C 올리면 10% 미만으로 줄고, TEOS 200→400 변화보다 훨씬 작다', () => {
    const cool = run(set(defaultRecipe, 'deposit', { temp: 350 })).rate
    const hot = run(set(defaultRecipe, 'deposit', { temp: 400 })).rate
    const tempChange = hot / cool - 1
    const teosChange = run(withTeos(defaultRecipe, 400)).rate / run(withTeos(defaultRecipe, 200)).rate - 1
    expect(tempChange).toBeLessThan(0)
    expect(Math.abs(tempChange)).toBeLessThan(0.1)
    expect(Math.abs(tempChange)).toBeLessThan(teosChange / 3)
  })

  it('TEOS↑ → 불균일도↓ (더 균일)', () => {
    const [a, b, c] = [200, 300, 400].map((f) => run(withTeos(defaultRecipe, f)).nonUniformity!)
    expect(b).toBeLessThan(a)
    expect(c).toBeLessThan(b)
    expect(c).toBeGreaterThan(0)
  })
})

describe('경고', () => {
  it('증착 스텝 RF가 꺼지면 불량 경고, 막이 쌓이지 않는다', () => {
    for (const rf of [0, null]) {
      const recipe = set(defaultRecipe, 'deposit', { rf })
      expect(codes(recipe)).toEqual(['rf-off-deposit'])
      expect(run(recipe)).toEqual({ rate: 0, thickness: 0, nonUniformity: null })
    }
  })

  it('퍼지 스텝에 N₂가 없으면 퍼지 누락 경고', () => {
    for (const n2 of [0, null]) {
      expect(codes(set(defaultRecipe, 'purge', { n2 }))).toEqual(['purge-missing'])
    }
  })

  it('범위를 벗어나면 인터락: 결과 없이 어느 칸인지 알려준다', () => {
    const { result, warnings } = simulate(set(defaultRecipe, 'deposit', { temp: 600 }))
    expect(result).toBeNull()
    expect(warnings).toMatchObject([{ code: 'out-of-range', level: 'interlock', step: 'deposit', field: 'temp' }])
  })

  it('숫자가 아니거나 꼭 필요한 값이 비어도 인터락', () => {
    expect(simulate(set(defaultRecipe, 'stabilize', { pressure: Number.NaN })).warnings[0]).toMatchObject({ code: 'out-of-range', step: 'stabilize', field: 'pressure' })
    expect(simulate(set(defaultRecipe, 'deposit', { time: null }))).toMatchObject({ result: null, warnings: [{ code: 'missing', field: 'time' }] })
  })

  it('안정화·퍼지 스텝에서 RF가 켜지면 RF 순서 경고', () => {
    expect(codes(set(defaultRecipe, 'stabilize', { rf: 200 }))).toEqual(['rf-order'])
    expect(codes(set(defaultRecipe, 'purge', { rf: 200 }))).toEqual(['rf-order'])
  })

  it('증착 스텝에 TEOS가 없으면 경고, 막이 쌓이지 않는다', () => {
    const recipe = set(defaultRecipe, 'deposit', { teos: 0 })
    expect(codes(recipe)).toEqual(['no-teos'])
    expect(run(recipe).thickness).toBe(0)
  })
})
