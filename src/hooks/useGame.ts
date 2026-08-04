import { useCallback, useEffect, useMemo, useState } from 'react'
import { getLevel, levels } from '../data/levels'
import { buyHint as purchaseHint } from '../game/hints'
import { createInitialSave, defaultSettings, emptyProgress, evaluateGuess, isLevelComplete } from '../game/engine'
import { playHaptic, playTone } from '../platform/feedback'
import { saveRepository, type SaveRepository } from '../storage/repository'
import type { GameSave, GuessKind, InputMode, LevelProgress, PlayerSettings, ThemeMode } from '../types/game'

export interface ActionFeedback {
  kind: GuessKind | 'hint'
  word: string
  id: number
}

function ensureProgress(save: GameSave, levelId: string): LevelProgress {
  return save.levelProgress[levelId] ?? emptyProgress()
}

export function useGame(repository: SaveRepository = saveRepository) {
  const [save, setSave] = useState<GameSave>()
  const [feedback, setFeedback] = useState<ActionFeedback>()
  const [storageWarning, setStorageWarning] = useState(false)

  useEffect(() => {
    let active = true
    repository
      .load()
      .then((stored) => {
        if (!active) return
        const initial = stored?.schemaVersion === 1 ? stored : createInitialSave(levels[0].id)
        const currentLevelId = levels.some(({ id }) => id === initial.currentLevelId) ? initial.currentLevelId : levels[0].id
        setSave({
          ...initial,
          currentLevelId,
          settings: { ...defaultSettings, ...initial.settings },
          levelProgress: {
            ...initial.levelProgress,
            [currentLevelId]: ensureProgress(initial, currentLevelId)
          }
        })
      })
      .catch(() => {
        if (active) {
          setStorageWarning(true)
          setSave(createInitialSave(levels[0].id))
        }
      })
    return () => {
      active = false
    }
  }, [repository])

  useEffect(() => {
    if (!save) return
    repository.save(save).catch(() => setStorageWarning(true))
  }, [repository, save])

  useEffect(() => {
    if (!save) return
    const root = document.documentElement
    root.dataset.theme = save.settings.theme
    if (save.settings.theme === 'system') delete root.dataset.theme
  }, [save?.settings.theme])

  const level = getLevel(save?.currentLevelId ?? levels[0].id)
  const progress = save ? ensureProgress(save, level.id) : emptyProgress()
  const complete = save ? isLevelComplete(level, progress) : false

  const submitGuess = useCallback(
    (guess: string) => {
      if (!save || complete) return
      const current = ensureProgress(save, level.id)
      const result = evaluateGuess(guess, level, current)
      const becameComplete = isLevelComplete(level, result.progress)
      const completedLevelIds = becameComplete && !save.completedLevelIds.includes(level.id)
        ? [...save.completedLevelIds, level.id]
        : save.completedLevelIds

      setSave({
        ...save,
        bonusPoints: save.bonusPoints + result.awardedPoints,
        completedLevelIds,
        levelProgress: { ...save.levelProgress, [level.id]: result.progress },
        updatedAt: Date.now()
      })
      setFeedback({ kind: result.kind, word: result.word, id: Date.now() })
      const feedbackType = result.kind === 'crossword' ? 'success' : result.kind === 'bonus' ? 'bonus' : result.kind === 'invalid' ? 'error' : 'select'
      void playHaptic(feedbackType, save.settings.hapticsEnabled)
      playTone(feedbackType, save.settings.soundEnabled)
    },
    [complete, level, save]
  )

  const buyHint = useCallback(() => {
    if (!save) return
    const result = purchaseHint(level, ensureProgress(save, level.id), save.bonusPoints, Math.random, save.settings.adminMode)
    if (result.success) {
      setSave({
        ...save,
        bonusPoints: result.remainingPoints,
        levelProgress: { ...save.levelProgress, [level.id]: result.progress },
        updatedAt: Date.now()
      })
      setFeedback({ kind: 'hint', word: 'Kirjain paljastettu', id: Date.now() })
      void playHaptic('success', save.settings.hapticsEnabled)
      playTone('success', save.settings.soundEnabled)
    } else {
      const word = result.reason === 'not-enough-points' ? `Tarvitset ${level.hintCost ?? 100} pistettä` : 'Kaikki kirjaimet ovat jo näkyvissä'
      setFeedback({ kind: 'invalid', word, id: Date.now() })
      void playHaptic('error', save.settings.hapticsEnabled)
    }
  }, [level, save])

  const updateSettings = useCallback((settings: Partial<PlayerSettings>) => {
    setSave((current) => current ? { ...current, settings: { ...current.settings, ...settings }, updatedAt: Date.now() } : current)
  }, [])

  const setInputMode = useCallback((inputMode: InputMode) => updateSettings({ inputMode }), [updateSettings])
  const setTheme = useCallback((theme: ThemeMode) => updateSettings({ theme }), [updateSettings])

  const nextLevel = useCallback(() => {
    if (!save) return
    const index = levels.findIndex(({ id }) => id === level.id)
    const next = levels[index + 1]
    if (next) {
      setSave({
        ...save,
        currentLevelId: next.id,
        levelProgress: { ...save.levelProgress, [next.id]: ensureProgress(save, next.id) },
        updatedAt: Date.now()
      })
      setFeedback(undefined)
      return
    }

    const restarted = Object.fromEntries(levels.map(({ id }) => [id, emptyProgress()]))
    setSave({
      ...save,
      currentLevelId: levels[0].id,
      completedLevelIds: [],
      levelProgress: restarted,
      updatedAt: Date.now()
    })
    setFeedback(undefined)
  }, [level.id, save])

  const moveLevel = useCallback((offset: number) => {
    if (!save?.settings.adminMode) return
    const currentIndex = levels.findIndex(({ id }) => id === level.id)
    const target = levels[currentIndex + offset]
    if (!target) return
    setSave({
      ...save,
      currentLevelId: target.id,
      levelProgress: { ...save.levelProgress, [target.id]: ensureProgress(save, target.id) },
      updatedAt: Date.now()
    })
    setFeedback(undefined)
  }, [level.id, save])

  const levelNumber = useMemo(() => levels.findIndex(({ id }) => id === level.id) + 1, [level.id])

  return {
    loading: !save,
    save,
    level,
    levelNumber,
    levelCount: levels.length,
    progress,
    complete,
    feedback,
    storageWarning,
    submitGuess,
    buyHint,
    updateSettings,
    setInputMode,
    setTheme,
    nextLevel,
    moveLevel
  }
}
