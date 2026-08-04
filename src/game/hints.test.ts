import { describe, expect, it } from 'vitest'
import { levels } from '../data/levels'
import { emptyProgress } from './engine'
import { buildGrid, cellsForWord } from './grid'
import { buyHint } from './hints'

const level = levels[0]

describe('vihjeet', () => {
  it('ostaa vihjeen ja vähentää kenttäkohtaisen hinnan', () => {
    const result = buyHint(level, emptyProgress(), 100, () => 0)
    expect(result.success).toBe(true)
    expect(result.remainingPoints).toBe(0)
    expect(result.progress.revealedCells).toEqual([result.revealedCell])
  })

  it('estää vihjeen liian vähillä pisteillä', () => {
    const result = buyHint(level, emptyProgress(), 99, () => 0)
    expect(result.success).toBe(false)
    expect(result.reason).toBe('not-enough-points')
    expect(result.remainingPoints).toBe(99)
  })

  it('antaa ylläpitäjätilassa vihjeen myös ilman pisteitä', () => {
    const result = buyHint(level, emptyProgress(), 0, () => 0, true)
    expect(result.success).toBe(true)
    expect(result.remainingPoints).toBe(0)
  })

  it('ei paljasta jo paljastettua solua uudelleen', () => {
    const firstKey = [...buildGrid(level).keys()][0]
    const progress = { ...emptyProgress(), revealedCells: [firstKey] }
    const result = buyHint(level, progress, 100, () => 0)
    expect(result.success).toBe(true)
    expect(result.revealedCell).not.toBe(firstKey)
  })

  it('ei paljasta ratkaistun sanan näkyviä soluja', () => {
    const solved = level.words[0]
    const visible = new Set(cellsForWord(solved).map(({ key }) => key))
    const progress = { ...emptyProgress(), solvedWords: [solved.answer] }
    const result = buyHint(level, progress, 100, () => 0)
    expect(result.success).toBe(true)
    expect(visible.has(result.revealedCell!)).toBe(false)
  })

  it('estää oston, kun kaikki solut näkyvät', () => {
    const progress = { ...emptyProgress(), revealedCells: [...buildGrid(level).keys()] }
    const result = buyHint(level, progress, 100)
    expect(result.success).toBe(false)
    expect(result.reason).toBe('nothing-to-reveal')
    expect(result.remainingPoints).toBe(100)
  })
})
