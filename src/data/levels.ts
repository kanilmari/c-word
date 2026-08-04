import rawLevels from './levels.json'
import { assertValidLevels } from '../game/levelValidator'
import type { LevelData } from '../types/game'

export const levels = assertValidLevels(rawLevels as LevelData[])

export function getLevel(levelId: string): LevelData {
  return levels.find(({ id }) => id === levelId) ?? levels[0]
}
