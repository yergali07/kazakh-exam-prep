import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Card, Segmented, Space, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'
import {
  allTopics,
  allWeeks,
  mcqQuestions,
  openQuestions,
} from '../data/questions'
import type { MCQChoice, MCQuestion, OpenQuestion } from '../data/types'
import { McqCard } from '../components/McqCard'
import { OpenCard } from '../components/OpenCard'
import { QuestionFilter } from '../components/QuestionFilter'
import type { QuestionFilterValue } from '../components/QuestionFilter'
import { pickN } from '../utils/randomize'

const { Title } = Typography

type Mode = 'mcq' | 'open'

function filterMcq(qs: MCQuestion[], f: QuestionFilterValue): MCQuestion[] {
  return qs.filter((q) => {
    if (f.weeks.length && !f.weeks.includes(q.week)) return false
    if (f.topics.length && !f.topics.includes(q.topic)) return false
    if (
      f.search &&
      !q.question.toLowerCase().includes(f.search.toLowerCase())
    )
      return false
    return true
  })
}

function filterOpen(qs: OpenQuestion[], f: QuestionFilterValue): OpenQuestion[] {
  return qs.filter((q) => {
    if (f.topics.length && !f.topics.includes(q.topic)) return false
    if (
      f.search &&
      !q.question.toLowerCase().includes(f.search.toLowerCase())
    )
      return false
    return true
  })
}

export function PracticeMode() {
  const [mode, setMode] = useState<Mode>('mcq')
  const [filter, setFilter] = useState<QuestionFilterValue>({
    weeks: [],
    topics: [],
    search: '',
  })
  const [mcq, setMcq] = useState<MCQuestion | null>(null)
  const [openQ, setOpenQ] = useState<OpenQuestion | null>(null)
  const [answer, setAnswer] = useState<MCQChoice | null>(null)
  const [openText, setOpenText] = useState('')

  const mcqPool = useMemo(
    () => filterMcq(mcqQuestions, filter),
    [filter],
  )
  const openPool = useMemo(
    () => filterOpen(openQuestions, { ...filter, weeks: [] }),
    [filter],
  )

  const nextQuestion = useCallback(() => {
    setAnswer(null)
    setOpenText('')
    if (mode === 'mcq') {
      const pick = pickN(mcqPool, 1)[0] ?? null
      setMcq(pick)
      setOpenQ(null)
    } else {
      const pick = pickN(openPool, 1)[0] ?? null
      setOpenQ(pick)
      setMcq(null)
    }
  }, [mode, mcqPool, openPool])

  useEffect(() => {
    nextQuestion()
  }, [nextQuestion])

  useEffect(() => {
    if (mode !== 'mcq') return
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement) {
        const tag = e.target.tagName
        if (tag === 'INPUT' || tag === 'TEXTAREA') return
      }
      const key = e.key.toUpperCase()
      if (!answer && mcq && (key === 'A' || key === 'B' || key === 'C' || key === 'D')) {
        setAnswer(key as MCQChoice)
      } else if (key === 'N' && answer) {
        nextQuestion()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [answer, mcq, mode, nextQuestion])

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ marginBottom: 8 }}>
            Жаттығу режимі
          </Title>
          <Segmented
            value={mode}
            onChange={(v) => setMode(v as Mode)}
            options={[
              { label: 'Тест (MCQ)', value: 'mcq' },
              { label: 'Ашық сұрақтар', value: 'open' },
            ]}
          />
        </div>

        <Card size="small">
          <QuestionFilter
            weeks={allWeeks}
            topics={allTopics}
            value={filter}
            onChange={setFilter}
          />
        </Card>

        {mode === 'mcq' && mcq && (
          <McqCard
            question={mcq}
            answered={answer}
            onAnswer={setAnswer}
            showFeedback
          />
        )}
        {mode === 'open' && openQ && (
          <OpenCard
            question={openQ}
            userAnswer={openText}
            onAnswerChange={setOpenText}
            modelVisible
          />
        )}
        {mode === 'mcq' && !mcq && (
          <Card>
            <Typography.Text type="secondary">
              Сүзгілерге сәйкес сұрақ табылмады.
            </Typography.Text>
          </Card>
        )}

        <Button
          type="primary"
          size="large"
          icon={<ReloadOutlined />}
          onClick={nextQuestion}
          block
        >
          Келесі сұрақ (N)
        </Button>
      </Space>
    </div>
  )
}
