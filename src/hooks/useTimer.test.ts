import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatTime, useTimer } from './useTimer'

describe('formatTime', () => {
  it('formats seconds as MM:SS zero-padded', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(9)).toBe('00:09')
    expect(formatTime(60)).toBe('01:00')
    expect(formatTime(125)).toBe('02:05')
    expect(formatTime(3600)).toBe('60:00')
  })

  it('floors fractional seconds', () => {
    expect(formatTime(59.9)).toBe('00:59')
  })

  it('clamps negative values to 00:00', () => {
    expect(formatTime(-10)).toBe('00:00')
  })
})

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('counts down by one each second when running', () => {
    const { result } = renderHook(() => useTimer({ initialSeconds: 5 }))
    expect(result.current.remaining).toBe(5)
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current.remaining).toBe(2)
  })

  it('does not tick when autoStart is false until start() is called', () => {
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 5, autoStart: false }),
    )
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.remaining).toBe(5)
    act(() => {
      result.current.start()
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.remaining).toBe(3)
  })

  it('pauses on demand and resumes from the same value', () => {
    const { result } = renderHook(() => useTimer({ initialSeconds: 10 }))
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    act(() => {
      result.current.pause()
    })
    const paused = result.current.remaining
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.remaining).toBe(paused)
  })

  it('calls onExpire once when reaching 0 and stops running', () => {
    const onExpire = vi.fn()
    const { result } = renderHook(() =>
      useTimer({ initialSeconds: 2, onExpire }),
    )
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(result.current.remaining).toBe(0)
    expect(result.current.running).toBe(false)
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('reset() restores remaining and resumes per autoStart', () => {
    const { result } = renderHook(() => useTimer({ initialSeconds: 3 }))
    act(() => {
      vi.advanceTimersByTime(3000)
    })
    expect(result.current.remaining).toBe(0)
    act(() => {
      result.current.reset(10)
    })
    expect(result.current.remaining).toBe(10)
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.remaining).toBe(8)
  })
})
