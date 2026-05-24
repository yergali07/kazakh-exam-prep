import { useEffect } from 'react'
import { Statistic } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'
import { formatTime, useTimer } from '../hooks/useTimer'

export interface TimerProps {
  initialSeconds: number
  onExpire?: () => void
  running?: boolean
}

export function Timer({ initialSeconds, onExpire, running = true }: TimerProps) {
  const timer = useTimer({ initialSeconds, autoStart: running, onExpire })

  useEffect(() => {
    if (running) timer.start()
    else timer.pause()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  const pct = timer.remaining / initialSeconds
  let color = '#389e0d'
  if (pct < 0.2) color = '#cf1322'
  else if (pct < 0.5) color = '#d48806'

  const pulse = pct < 0.1
  return (
    <Statistic
      prefix={<ClockCircleOutlined style={{ color }} />}
      value={formatTime(timer.remaining)}
      valueStyle={{
        color,
        fontVariantNumeric: 'tabular-nums',
        animation: pulse ? 'kep-pulse 1s infinite' : undefined,
      }}
    />
  )
}
