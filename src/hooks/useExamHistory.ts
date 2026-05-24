import { useCallback, useEffect, useState } from 'react'
import type { ExamAttempt } from '../data/types'
import { KEYS, loadJson, saveJson } from '../utils/storage'

export function useExamHistory() {
  const [history, setHistory] = useState<ExamAttempt[]>(() =>
    loadJson<ExamAttempt[]>(KEYS.examHistory, []),
  )

  useEffect(() => {
    saveJson(KEYS.examHistory, history)
  }, [history])

  const addAttempt = useCallback((attempt: ExamAttempt) => {
    setHistory((h) => [attempt, ...h])
  }, [])

  const updateAttempt = useCallback(
    (id: string, patch: Partial<ExamAttempt>) => {
      setHistory((h) =>
        h.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      )
    },
    [],
  )

  const clear = useCallback(() => setHistory([]), [])

  const bestScore = history.reduce(
    (best, a) => (a.totalScore > best ? a.totalScore : best),
    0,
  )

  return { history, addAttempt, updateAttempt, clear, bestScore }
}
