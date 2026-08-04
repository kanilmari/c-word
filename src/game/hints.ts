import type { HintResult, LevelData, LevelProgress } from '../types/game'
import { buildGrid, visibleCellKeys } from './grid'

export function buyHint(
  level: LevelData,
  current: LevelProgress,
  bonusPoints: number,
  random: () => number = Math.random,
  free = false
): HintResult {
  const cost = level.hintCost ?? 100
  const progress: LevelProgress = {
    solvedWords: [...current.solvedWords],
    foundBonusWords: [...current.foundBonusWords],
    revealedCells: [...current.revealedCells]
  }

  if (!free && bonusPoints < cost) {
    return { success: false, reason: 'not-enough-points', remainingPoints: bonusPoints, progress }
  }

  const visible = visibleCellKeys(level, progress.solvedWords, progress.revealedCells)
  const candidates = [...buildGrid(level).keys()].filter((key) => !visible.has(key))
  if (candidates.length === 0) {
    return { success: false, reason: 'nothing-to-reveal', remainingPoints: bonusPoints, progress }
  }

  const index = Math.min(candidates.length - 1, Math.floor(Math.max(0, random()) * candidates.length))
  const revealedCell = candidates[index]
  progress.revealedCells.push(revealedCell)
  return { success: true, revealedCell, remainingPoints: free ? bonusPoints : bonusPoints - cost, progress }
}
