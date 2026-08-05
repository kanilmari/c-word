import { useCallback, useState } from 'react'
import { CompleteDialog } from './components/CompleteDialog'
import { Crossword } from './components/Crossword'
import { FoundBonusWords } from './components/FoundBonusWords'
import { GuessDisplay } from './components/GuessDisplay'
import { LetterWheel } from './components/LetterWheel'
import { ChevronLeftIcon, ChevronRightIcon, LightbulbIcon } from './components/icons'
import { LimitedKeyboard } from './components/LimitedKeyboard'
import { SettingsSheet } from './components/SettingsSheet'
import { TopBar } from './components/TopBar'
import { UpdatePrompt } from './components/UpdatePrompt'
import { completedCrosswordInitials } from './game/engine'
import { useGame } from './hooks/useGame'

export default function App() {
  const game = useGame()
  const [draft, setDraft] = useState('')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const handleDraft = useCallback((word: string) => setDraft(word), [])

  if (game.loading || !game.save) {
    return <main className="loading-screen"><span className="loading-mark">C</span><p>Avataan maisemaa…</p></main>
  }

  const { level, progress, save } = game
  const completedInitials = completedCrosswordInitials(level, progress.solvedWords)
  return (
    <main className="game-shell">
      <div className="landscape" aria-hidden="true"><i className="sun"/><i className="island island--far"/><i className="island island--near"/><i className="water-line water-line--one"/><i className="water-line water-line--two"/></div>
      <div className="game-content">
        <TopBar bonusPoints={save.bonusPoints} hintCost={level.hintCost ?? 100} currency={save.currency} adminMode={save.settings.adminMode} onOpenSettings={() => setSettingsOpen(true)} />

        <section className="level-heading" aria-label={`Kenttä ${game.levelNumber} / ${game.levelCount}`}>
          {save.settings.adminMode && (
            <button className="level-navigation level-navigation--previous" type="button" onClick={() => game.moveLevel(-1)} disabled={game.levelNumber === 1} aria-label="Edellinen kenttä">
              <ChevronLeftIcon />
            </button>
          )}
          <div>
            <span className="eyebrow">KENTTÄ {game.levelNumber} / {game.levelCount}</span>
            <h1>{level.title}</h1>
            <p>{level.place}</p>
          </div>
          {save.settings.adminMode && (
            <button className="level-navigation level-navigation--next" type="button" onClick={() => game.moveLevel(1)} disabled={game.levelNumber === game.levelCount} aria-label="Seuraava kenttä">
              <ChevronRightIcon />
            </button>
          )}
        </section>

        <Crossword level={level} progress={progress} draft={draft} />

        <section className="play-controls">
          <button className="hint-button" type="button" onClick={game.buyHint} disabled={game.complete} aria-label={save.settings.adminMode ? 'Paljasta kirjain maksutta ylläpitäjätilassa' : `Paljasta kirjain, hinta ${level.hintCost ?? 100} bonuspistettä`}>
            <LightbulbIcon /><span>Vihje</span><small>{save.settings.adminMode ? 'Vapaa' : level.hintCost ?? 100}</small>
          </button>

          <FoundBonusWords key={`bonuses-${level.id}`} words={progress.foundBonusWords} draft={draft} />

          <GuessDisplay draft={draft} feedback={game.feedback} />

          {save.settings.inputMode === 'wheel' ? (
            <LetterWheel
              key={level.id}
              letters={level.letters}
              completedInitials={completedInitials}
              allowRepeatedNode={level.allowRepeatedLetterNode ?? false}
              disabled={game.complete}
              onDraftChange={handleDraft}
              onSubmit={game.submitGuess}
            />
          ) : (
            <LimitedKeyboard key={level.id} letters={level.letters} completedInitials={completedInitials} disabled={game.complete} onDraftChange={handleDraft} onSubmit={game.submitGuess} />
          )}
        </section>

        <p className="offline-note">Tallentuu tälle laitteelle · toimii ilman verkkoa</p>
      </div>

      {game.storageWarning && <div className="storage-warning" role="alert">Tallennustila ei ole käytettävissä. Voit pelata, mutta edistyminen ei ehkä säily.</div>}
      {settingsOpen && <SettingsSheet settings={save.settings} onChange={game.updateSettings} onClose={() => setSettingsOpen(false)} />}
      {game.complete && <CompleteDialog levelNumber={game.levelNumber} title={level.title} foundBonusCount={progress.foundBonusWords.length} onNext={game.nextLevel} />}
      <UpdatePrompt />
    </main>
  )
}
