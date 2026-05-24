import { useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Collapse,
  Result,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Link, useSearchParams } from 'react-router-dom'
import { mcqQuestions, openQuestions } from '../data/questions'
import type {
  MCQuestion,
  OpenQuestion,
  OpenSelfGrade,
} from '../data/types'
import {
  breakdownByField,
  scoreAllOpen,
  scoreMcqs,
  type BreakdownRow,
} from '../utils/scoring'
import { useExamHistory } from '../hooks/useExamHistory'
import { ResultSummary } from '../components/ResultSummary'

const { Title, Paragraph, Text } = Typography

interface SelfGradeState {
  covered: Set<number>
  grammarOk: boolean
  punctuationOk: boolean
}

function OpenGrader({
  question,
  userAnswer,
  state,
  onChange,
}: {
  question: OpenQuestion
  userAnswer: string
  state: SelfGradeState
  onChange: (s: SelfGradeState) => void
}) {
  return (
    <Card
      title={
        <Space>
          <Text strong>Ашық сұрақ</Text>
          <Tag color="purple">{question.topic}</Tag>
        </Space>
      }
    >
      <Paragraph strong style={{ whiteSpace: 'pre-wrap' }}>
        {question.question}
      </Paragraph>

      <Collapse
        items={[
          {
            key: 'a',
            label: 'Сіздің жауабыңыз',
            children: (
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {userAnswer || <Text type="secondary">(бос)</Text>}
              </Paragraph>
            ),
          },
          {
            key: 'm',
            label: 'Үлгі жауап',
            children: (
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {question.modelAnswer}
              </Paragraph>
            ),
          },
        ]}
      />

      <Title level={5} style={{ marginTop: 16 }}>
        Өзін-өзі бағалау
      </Title>
      <Paragraph type="secondary" style={{ marginTop: -8 }}>
        Жауабыңыз қанша негізгі тармақты қамтығанын белгілеңіз.
      </Paragraph>
      <Space direction="vertical">
        {question.keyPoints.map((kp, i) => (
          <Checkbox
            key={i}
            checked={state.covered.has(i)}
            onChange={(e) => {
              const next = new Set(state.covered)
              if (e.target.checked) next.add(i)
              else next.delete(i)
              onChange({ ...state, covered: next })
            }}
          >
            {kp}
          </Checkbox>
        ))}
      </Space>

      <div style={{ marginTop: 16 }}>
        <Space size="large">
          <Space>
            <Switch
              checked={state.grammarOk}
              onChange={(v) => onChange({ ...state, grammarOk: v })}
            />
            <Text>Грамматика дұрыс (+2)</Text>
          </Space>
          <Space>
            <Switch
              checked={state.punctuationOk}
              onChange={(v) => onChange({ ...state, punctuationOk: v })}
            />
            <Text>Пунктуация дұрыс (+2)</Text>
          </Space>
        </Space>
      </div>
    </Card>
  )
}

function BreakdownTables({
  byWeek,
  byTopic,
}: {
  byWeek: BreakdownRow<number>[]
  byTopic: BreakdownRow<string>[]
}) {
  if (byWeek.length === 0 && byTopic.length === 0) return null

  const rowClassName = (row: { accuracy: number }) =>
    row.accuracy < 0.6 ? 'breakdown-row-low' : ''

  const weekColumns: ColumnsType<BreakdownRow<number>> = [
    { title: 'Апта', dataIndex: 'key', key: 'key', width: 80 },
    { title: 'Жауап', dataIndex: 'total', key: 'total', width: 90 },
    { title: 'Дұрыс', dataIndex: 'correct', key: 'correct', width: 90 },
    {
      title: 'Дәлдік',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (a: number) => `${Math.round(a * 100)}%`,
    },
  ]
  const topicColumns: ColumnsType<BreakdownRow<string>> = [
    { title: 'Тақырып', dataIndex: 'key', key: 'key' },
    { title: 'Жауап', dataIndex: 'total', key: 'total', width: 90 },
    { title: 'Дұрыс', dataIndex: 'correct', key: 'correct', width: 90 },
    {
      title: 'Дәлдік',
      dataIndex: 'accuracy',
      key: 'accuracy',
      width: 110,
      render: (a: number) => `${Math.round(a * 100)}%`,
    },
  ]

  return (
    <>
      <style>{`.breakdown-row-low > td { background-color: #fff1f0 !important; color: #a8071a; }`}</style>
      <Title level={4}>Нәтиже талдауы</Title>
      <Title level={5} style={{ marginBottom: 8 }}>
        Апта бойынша
      </Title>
      <Table
        size="small"
        rowKey="key"
        pagination={false}
        columns={weekColumns}
        dataSource={byWeek}
        rowClassName={rowClassName}
      />
      <Title level={5} style={{ marginBottom: 8, marginTop: 16 }}>
        Тақырып бойынша
      </Title>
      <Table
        size="small"
        rowKey="key"
        pagination={false}
        columns={topicColumns}
        dataSource={byTopic}
        rowClassName={rowClassName}
      />
    </>
  )
}

export function ExamResult() {
  const [params] = useSearchParams()
  const id = params.get('id')
  const { history, updateAttempt } = useExamHistory()
  const attempt = useMemo(
    () => history.find((a) => a.id === id) ?? history[0],
    [history, id],
  )

  const [grades, setGrades] = useState<Record<string, SelfGradeState>>({})

  if (!attempt) {
    return (
      <Result
        status="warning"
        title="Емтихан табылмады"
        extra={
          <Link to="/">
            <Button type="primary">Басты бетке</Button>
          </Link>
        }
      />
    )
  }

  const mcqById = new Map(mcqQuestions.map((q) => [q.id, q]))
  const openById = new Map(openQuestions.map((q) => [q.id, q]))
  const mcqs = attempt.mcqPicks
    .map((p) => mcqById.get(p.questionId))
    .filter((q): q is MCQuestion => Boolean(q))
  const opens = attempt.openPicks
    .map((p) => openById.get(p.questionId))
    .filter((q): q is OpenQuestion => Boolean(q))
  const mcqResult = scoreMcqs(attempt.mcqPicks, mcqs)
  const byWeek = breakdownByField(attempt.mcqPicks, mcqs, 'week')
  const byTopic = breakdownByField(attempt.mcqPicks, mcqs, 'topic')

  const selfGrades: OpenSelfGrade[] = opens.map((q) => {
    const s = grades[q.id]
    return {
      questionId: q.id,
      coveredKeyPoints: s ? s.covered.size : 0,
      totalKeyPoints: q.keyPoints.length,
      grammarOk: s?.grammarOk ?? false,
      punctuationOk: s?.punctuationOk ?? false,
    }
  })
  const openScore = scoreAllOpen(selfGrades)
  const totalScore = mcqResult.score + openScore

  const saveScore = () => {
    updateAttempt(attempt.id, {
      selfGrades,
      openScore,
      totalScore,
    })
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>
          Емтихан нәтижесі
        </Title>

        <ResultSummary
          mcqCorrect={mcqResult.correct}
          mcqTotal={mcqResult.total}
          mcqScore={mcqResult.score}
          openScore={openScore}
          totalScore={totalScore}
        />

        {mcqResult.unanswered.length > 0 && (
          <Alert
            type="info"
            showIcon
            message={`${mcqResult.unanswered.length} сұраққа жауап берілмеді`}
          />
        )}

        <Title level={4}>Ашық сұрақтарды бағалау</Title>
        {opens.map((q) => {
          const userAnswer =
            attempt.openPicks.find((p) => p.questionId === q.id)?.text ?? ''
          const state =
            grades[q.id] ??
            ({
              covered: new Set<number>(),
              grammarOk: false,
              punctuationOk: false,
            } satisfies SelfGradeState)
          return (
            <OpenGrader
              key={q.id}
              question={q}
              userAnswer={userAnswer}
              state={state}
              onChange={(s) => setGrades((g) => ({ ...g, [q.id]: s }))}
            />
          )
        })}

        <Button type="primary" onClick={saveScore}>
          Бағалауды сақтау
        </Button>

        <BreakdownTables byWeek={byWeek} byTopic={byTopic} />

        {mcqResult.wrong.length > 0 && (
          <>
            <Title level={4}>Қате жауаптарды талдау ({mcqResult.wrong.length})</Title>
            {mcqResult.wrong.map((q) => {
              const picked = attempt.mcqPicks.find(
                (p) => p.questionId === q.id,
              )?.answer
              return (
                <Card key={q.id} size="small">
                  <Space wrap style={{ marginBottom: 8 }}>
                    <Tag color="blue">Апта {q.week}</Tag>
                    <Tag>{q.topic}</Tag>
                  </Space>
                  <Paragraph strong style={{ whiteSpace: 'pre-wrap' }}>
                    {q.question}
                  </Paragraph>
                  <Paragraph>
                    Сіздің жауабыңыз:{' '}
                    <Text type="danger" strong>
                      {picked ?? '—'}
                    </Text>{' '}
                    · Дұрыс жауап:{' '}
                    <Text type="success" strong>
                      {q.correctAnswer}
                    </Text>
                  </Paragraph>
                  <Alert type="info" message={q.explanation} />
                </Card>
              )
            })}
          </>
        )}

        <Space>
          <Link to="/exam">
            <Button type="primary">Қайта тапсыру</Button>
          </Link>
          <Link to="/">
            <Button>Басты бетке</Button>
          </Link>
        </Space>
      </Space>
    </div>
  )
}
