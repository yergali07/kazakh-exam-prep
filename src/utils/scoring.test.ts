import { describe, it, expect } from 'vitest'
import { breakdownByField } from './scoring'
import type { MCQuestion, McqPick } from '../data/types'

function q(
  id: string,
  week: number,
  topic: string,
  correct: 'A' | 'B' = 'A',
): MCQuestion {
  return {
    id,
    week,
    topic,
    question: '',
    options: [
      { id: 'A', text: '' },
      { id: 'B', text: '' },
      { id: 'C', text: '' },
      { id: 'D', text: '' },
    ],
    correctAnswer: correct,
    explanation: '',
  }
}

describe('breakdownByField', () => {
  const questions: MCQuestion[] = [
    q('m1', 2, 'Alpha'),
    q('m2', 2, 'Alpha'),
    q('m3', 2, 'Beta'),
    q('m4', 3, 'Alpha'),
    q('m5', 3, 'Beta'),
  ]

  it('groups by week with correct accuracy', () => {
    const picks: McqPick[] = [
      { questionId: 'm1', answer: 'A' }, // correct
      { questionId: 'm2', answer: 'B' }, // wrong
      { questionId: 'm3', answer: 'A' }, // correct
      { questionId: 'm4', answer: null }, // unanswered
      { questionId: 'm5', answer: 'A' }, // correct
    ]
    const rows = breakdownByField(picks, questions, 'week')
    expect(rows).toEqual([
      { key: 2, total: 3, correct: 2, accuracy: 2 / 3 },
      { key: 3, total: 2, correct: 1, accuracy: 0.5 },
    ])
  })

  it('groups by topic and sorts alphabetically', () => {
    const picks: McqPick[] = [
      { questionId: 'm1', answer: 'A' },
      { questionId: 'm2', answer: 'A' },
      { questionId: 'm3', answer: 'B' },
      { questionId: 'm4', answer: 'A' },
      { questionId: 'm5', answer: null },
    ]
    const rows = breakdownByField(picks, questions, 'topic')
    expect(rows.map((r) => r.key)).toEqual(['Alpha', 'Beta'])
    const alpha = rows.find((r) => r.key === 'Alpha')!
    expect(alpha).toEqual({ key: 'Alpha', total: 3, correct: 3, accuracy: 1 })
    const beta = rows.find((r) => r.key === 'Beta')!
    expect(beta).toEqual({ key: 'Beta', total: 2, correct: 0, accuracy: 0 })
  })

  it('treats unanswered picks as incorrect but counted in total', () => {
    const picks: McqPick[] = [
      { questionId: 'm1', answer: null },
      { questionId: 'm2', answer: null },
    ]
    const rows = breakdownByField(picks, questions, 'week')
    expect(rows).toEqual([{ key: 2, total: 2, correct: 0, accuracy: 0 }])
  })

  it('skips picks whose questionId is not in the question list', () => {
    const picks: McqPick[] = [
      { questionId: 'm1', answer: 'A' },
      { questionId: 'ghost', answer: 'A' },
    ]
    const rows = breakdownByField(picks, questions, 'week')
    expect(rows).toEqual([{ key: 2, total: 1, correct: 1, accuracy: 1 }])
  })

  it('returns an empty array for no picks', () => {
    expect(breakdownByField([], questions, 'week')).toEqual([])
  })
})
