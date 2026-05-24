import { useEffect, useRef, useState } from 'react'

export interface UseTimerOptions {
  initialSeconds: number
  autoStart?: boolean
  onExpire?: () => void
}

export function useTimer({
  initialSeconds,
  autoStart = true,
  onExpire,
}: UseTimerOptions) {
  const [remaining, setRemaining] = useState(initialSeconds)
  const [running, setRunning] = useState(autoStart)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!running) return
    if (remaining <= 0) {
      onExpireRef.current?.()
      setRunning(false)
      return
    }
    const id = window.setInterval(() => {
      setRemaining((s) => Math.max(0, s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [running, remaining])

  return {
    remaining,
    running,
    start: () => setRunning(true),
    pause: () => setRunning(false),
    reset: (s: number) => {
      setRemaining(s)
      setRunning(autoStart)
    },
  }
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
}
