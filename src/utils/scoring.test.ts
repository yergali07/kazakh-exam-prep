import { describe, it, expect } from 'vitest'
import {
  breakdownByField,
  scoreAllOpen,
  scoreMcqs,
  scoreOpenSelf,
} from './scoring'
import type { MCQuestion, McqPick, OpenSelfGrade } from '../data/types'

function q(
  id: string,
  week: number,
  topic: string,
  correct: 'A' | 'B' | 'C' | 'D' = 'A',
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

describe('scoreMcqs', () => {
  const questions: MCQuestion[] = [
    q('m1', 2, 'Alpha', 'A'),
    q('m2', 2, 'Alpha', 'B'),
    q('m3', 3, 'Beta', 'A'),
    q('m4', 3, 'Beta', 'A'),
  ]

  it('counts correct, wrong, and unanswered and scales score to 20', () => {
    const picks: McqPick[] = [
      { questionId: 'm1', answer: 'A' }, // correct
      { questionId: 'm2', answer: 'A' }, // wrong (correct is B)
      { questionId: 'm3', answer: null }, // unanswered
      { questionId: 'm4', answer: 'A' }, // correct
    ]
    const result = scoreMcqs(picks, questions)
    expect(result.correct).toBe(2)
    expect(result.total).toBe(4)
    expect(result.score).toBe((2 / 4) * 20)
    expect(result.wrong.map((q) => q.id)).toEqual(['m2'])
    expect(result.unanswered.map((q) => q.id)).toEqual(['m3'])
  })

  it('returns zero score for empty picks without dividing by zero', () => {
    const result = scoreMcqs([], questions)
    expect(result).toEqual({
      correct: 0,
      total: 0,
      score: 0,
      wrong: [],
      unanswered: [],
    })
  })

  it('skips picks whose questionId is not in the question list', () => {
    const picks: McqPick[] = [
      { questionId: 'm1', answer: 'A' },
      { questionId: 'ghost', answer: 'A' },
    ]
    const result = scoreMcqs(picks, questions)
    expect(result.correct).toBe(1)
    // ghost is skipped entirely — does not count toward total
    expect(result.wrong).toEqual([])
    expect(result.unanswered).toEqual([])
  })

  it('awards full 20 when all answers are correct', () => {
    const picks: McqPick[] = [
      { questionId: 'm1', answer: 'A' },
      { questionId: 'm2', answer: 'B' },
      { questionId: 'm3', answer: 'A' },
      { questionId: 'm4', answer: 'A' },
    ]
    expect(scoreMcqs(picks, questions).score).toBe(20)
  })
})

describe('scoreOpenSelf', () => {
  const base: OpenSelfGrade = {
    questionId: 'o1',
    coveredKeyPoints: 0,
    totalKeyPoints: 0,
    grammarOk: false,
    punctuationOk: false,
  }

  it('returns 0 when nothing is covered and both fail', () => {
    expect(scoreOpenSelf(base)).toBe(0)
  })

  it('awards full 10 when all content points covered and both pass', () => {
    expect(
      scoreOpenSelf({
        ...base,
        coveredKeyPoints: 4,
        totalKeyPoints: 4,
        grammarOk: true,
        punctuationOk: true,
      }),
    ).toBe(10)
  })

  it('scales content proportionally over 6 points', () => {
    expect(
      scoreOpenSelf({
        ...base,
        coveredKeyPoints: 2,
        totalKeyPoints: 4,
      }),
    ).toBe(3) // (2/4) * 6
  })

  it('adds 2 each for grammar and punctuation passes', () => {
    expect(scoreOpenSelf({ ...base, grammarOk: true })).toBe(2)
    expect(scoreOpenSelf({ ...base, punctuationOk: true })).toBe(2)
    expect(
      scoreOpenSelf({ ...base, grammarOk: true, punctuationOk: true }),
    ).toBe(4)
  })

  it('treats totalKeyPoints=0 as 0 content (no division by zero)', () => {
    expect(
      scoreOpenSelf({
        ...base,
        coveredKeyPoints: 0,
        totalKeyPoints: 0,
        grammarOk: true,
        punctuationOk: true,
      }),
    ).toBe(4)
  })
})

describe('scoreAllOpen', () => {
  it('sums per-question open scores', () => {
    const grades: OpenSelfGrade[] = [
      {
        questionId: 'o1',
        coveredKeyPoints: 4,
        totalKeyPoints: 4,
        grammarOk: true,
        punctuationOk: true,
      }, // 10
      {
        questionId: 'o2',
        coveredKeyPoints: 1,
        totalKeyPoints: 2,
        grammarOk: false,
        punctuationOk: true,
      }, // 3 + 0 + 2 = 5
    ]
    expect(scoreAllOpen(grades)).toBe(15)
  })

  it('returns 0 for empty input', () => {
    expect(scoreAllOpen([])).toBe(0)
  })
})
