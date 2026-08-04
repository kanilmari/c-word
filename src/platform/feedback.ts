import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'

export type FeedbackType = 'success' | 'bonus' | 'error' | 'select'

export async function playHaptic(type: FeedbackType, enabled: boolean): Promise<void> {
  if (!enabled) return
  try {
    if (type === 'error') await Haptics.notification({ type: NotificationType.Error })
    else if (type === 'success') await Haptics.notification({ type: NotificationType.Success })
    else await Haptics.impact({ style: type === 'select' ? ImpactStyle.Light : ImpactStyle.Medium })
  } catch {
    if ('vibrate' in navigator) navigator.vibrate(type === 'error' ? [30, 25, 30] : 20)
  }
}

export function playTone(type: FeedbackType, enabled: boolean): void {
  if (!enabled || typeof AudioContext === 'undefined') return
  const context = new AudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const frequency = type === 'error' ? 165 : type === 'bonus' ? 660 : 480
  oscillator.frequency.setValueAtTime(frequency, context.currentTime)
  gain.gain.setValueAtTime(0.0001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.07, context.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12)
  oscillator.connect(gain).connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.13)
  oscillator.addEventListener('ended', () => void context.close())
}
