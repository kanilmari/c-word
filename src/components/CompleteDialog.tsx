import { levels } from '../data/levels'
import { SparkIcon } from './icons'

interface CompleteDialogProps {
  levelNumber: number
  title: string
  foundBonusCount: number
  onNext: () => void
}

export function CompleteDialog({ levelNumber, title, foundBonusCount, onNext }: CompleteDialogProps) {
  const isLast = levelNumber === levels.length
  return (
    <div className="complete-backdrop">
      <section className="complete-dialog" role="dialog" aria-modal="true" aria-labelledby="complete-title">
        <div className="complete-dialog__emblem"><SparkIcon /></div>
        <span className="eyebrow">KENTTÄ {levelNumber} VALMIS</span>
        <h2 id="complete-title">{title} ratkaistu!</h2>
        <p>{foundBonusCount ? `Löysit myös ${foundBonusCount} bonus-sanaa.` : 'Kaikki ristikon sanat löytyivät.'}</p>
        <button className="primary-action complete-dialog__button" type="button" onClick={onNext}>{isLast ? 'Aloita uusi kierros' : 'Seuraava maisema'}</button>
      </section>
    </div>
  )
}
