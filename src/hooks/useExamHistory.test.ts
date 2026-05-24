import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { ExamAttempt } from '../data/types'
import { KEYS } from '../utils/storage'
import { useExamHistory } from './useExamHistory'

function attempt(id: string, totalScore: number): ExamAttempt {
  return {
    id,
    startedAt: 0,
    finishedAt: 0,
    mcqPicks: [],
    openPicks: [],
    mcqScore: 0,
    openScore: 0,
    totalScore,
  }
}

beforeEach(() => {
  window.localStorage.clear()
})

describe('useExamHistory', () => {
  it('starts empty when localStorage has no history', () => {
    const { result } = renderHook(() => useExamHistory())
    expect(result.current.history).toEqual([])
    expect(result.current.bestScore).toBe(0)
  })

  it('hydrates from localStorage on mount', () => {
    window.localStorage.setItem(
      KEYS.examHistory,
      JSON.stringify([attempt('a', 30)]),
    )
    const { result } = renderHook(() => useExamHistory())
    expect(result.current.history).toHaveLength(1)
    expect(result.current.bestScore).toBe(30)
  })

  it('addAttempt prepends to history and persists', () => {
    const { result } = renderHook(() => useExamHistory())
    act(() => result.current.addAttempt(attempt('a', 10)))
    act(() => result.current.addAttempt(attempt('b', 25)))
    expect(result.current.history.map((a) => a.id)).toEqual(['b', 'a'])
    const stored = JSON.parse(
      window.localStorage.getItem(KEYS.examHistory) ?? '[]',
    ) as ExamAttempt[]
    expect(stored.map((a) => a.id)).toEqual(['b', 'a'])
  })

  it('bestScore tracks the maximum totalScore', () => {
    const { result } = renderHook(() => useExamHistory())
    act(() => result.current.addAttempt(attempt('a', 12)))
    act(() => result.current.addAttempt(attempt('b', 38)))
    act(() => result.current.addAttempt(attempt('c', 25)))
    expect(result.current.bestScore).toBe(38)
  })

  it('updateAttempt patches the matching attempt by id', () => {
    const { result } = renderHook(() => useExamHistory())
    act(() => result.current.addAttempt(attempt('a', 10)))
    act(() => result.current.updateAttempt('a', { totalScore: 35 }))
    expect(result.current.history[0].totalScore).toBe(35)
    expect(result.current.bestScore).toBe(35)
  })

  it('updateAttempt is a no-op when id is unknown', () => {
    const { result } = renderHook(() => useExamHistory())
    act(() => result.current.addAttempt(attempt('a', 10)))
    act(() => result.current.updateAttempt('ghost', { totalScore: 99 }))
    expect(result.current.history[0].totalScore).toBe(10)
  })

  it('clear() empties history', () => {
    const { result } = renderHook(() => useExamHistory())
    act(() => result.current.addAttempt(attempt('a', 10)))
    act(() => result.current.clear())
    expect(result.current.history).toEqual([])
    expect(result.current.bestScore).toBe(0)
  })
})
