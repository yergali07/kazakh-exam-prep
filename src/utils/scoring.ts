import type { MCQuestion, McqPick, OpenSelfGrade } from '../data/types'

export interface McqScoreResult {
  correct: number
  total: number
  /** Score out of 20 (0.4 pt per question over 50). */
  score: number
  wrong: MCQuestion[]
  unanswered: MCQuestion[]
}

export function scoreMcqs(
  picks: McqPick[],
  questions: MCQuestion[],
): McqScoreResult {
  const byId = new Map(questions.map((q) => [q.id, q]))
  let correct = 0
  const wrong: MCQuestion[] = []
  const unanswered: MCQuestion[] = []
  for (const pick of picks) {
    const q = byId.get(pick.questionId)
    if (!q) continue
    if (pick.answer === null) {
      unanswered.push(q)
    } else if (pick.answer === q.correctAnswer) {
      correct++
    } else {
      wrong.push(q)
    }
  }
  const total = picks.length
  // 50 questions = 20 points → 0.4 each. Generalize.
  const score = total === 0 ? 0 : (correct / total) * 20
  return { correct, total, score, wrong, unanswered }
}

/**
 * Score an open question out of 10:
 *   6 pt content (proportional to covered key points)
 *   2 pt grammar (pass/fail)
 *   2 pt punctuation (pass/fail)
 */
export function scoreOpenSelf(grade: OpenSelfGrade): number {
  const content =
    grade.totalKeyPoints === 0
      ? 0
      : (grade.coveredKeyPoints / grade.totalKeyPoints) * 6
  return content + (grade.grammarOk ? 2 : 0) + (grade.punctuationOk ? 2 : 0)
}

export function scoreAllOpen(grades: OpenSelfGrade[]): number {
  return grades.reduce((sum, g) => sum + scoreOpenSelf(g), 0)
}
