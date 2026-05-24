export type {
  MCQChoice,
  MCQOption,
  MCQuestion,
  OpenQuestion,
} from './questions'

export interface McqPick {
  questionId: string
  answer: 'A' | 'B' | 'C' | 'D' | null
}

export interface OpenPick {
  questionId: string
  text: string
}

export interface OpenSelfGrade {
  questionId: string
  coveredKeyPoints: number
  totalKeyPoints: number
  grammarOk: boolean
  punctuationOk: boolean
}

export interface ExamAttempt {
  id: string
  startedAt: number
  finishedAt: number
  mcqPicks: McqPick[]
  openPicks: OpenPick[]
  selfGrades?: OpenSelfGrade[]
  mcqScore: number
  openScore: number
  totalScore: number
}
