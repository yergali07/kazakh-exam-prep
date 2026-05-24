import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Col,
  Modal,
  Result,
  Row,
  Space,
  Steps,
  Typography,
} from 'antd'
import { useNavigate } from 'react-router-dom'
import { mcqQuestions, openQuestions } from '../data/questions'
import type {
  ExamAttempt,
  MCQChoice,
  MCQuestion,
  McqPick,
  OpenPick,
  OpenQuestion,
} from '../data/types'
import { pickN } from '../utils/randomize'
import { scoreMcqs } from '../utils/scoring'
import { useExamHistory } from '../hooks/useExamHistory'
import { McqCard } from '../components/McqCard'
import { OpenCard } from '../components/OpenCard'
import { Timer } from '../components/Timer'

const { Title, Paragraph, Text } = Typography

const MCQ_COUNT = 50
const OPEN_COUNT = 2
const MCQ_SECONDS = 40 * 60
const OPEN_SECONDS = 80 * 60

type Phase = 'pre' | 'mcq' | 'open' | 'done'

export function ExamMode() {
  const navigate = useNavigate()
  const { addAttempt } = useExamHistory()

  const [phase, setPhase] = useState<Phase>('pre')
  const [startedAt, setStartedAt] = useState<number>(0)
  const [mcqs, setMcqs] = useState<MCQuestion[]>([])
  const [opens, setOpens] = useState<OpenQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, MCQChoice>>({})
  const [openText, setOpenText] = useState<Record<string, string>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  const begin = () => {
    setMcqs(pickN(mcqQuestions, MCQ_COUNT))
    setOpens(pickN(openQuestions, OPEN_COUNT))
    setAnswers({})
    setOpenText({})
    setStartedAt(Date.now())
    setPhase('mcq')
  }

  const finalize = useCallback(() => {
    const mcqPicks: McqPick[] = mcqs.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] ?? null,
    }))
    const openPicks: OpenPick[] = opens.map((q) => ({
      questionId: q.id,
      text: openText[q.id] ?? '',
    }))
    const mcqResult = scoreMcqs(mcqPicks, mcqs)
    const attempt: ExamAttempt = {
      id: `attempt-${Date.now()}`,
      startedAt,
      finishedAt: Date.now(),
      mcqPicks,
      openPicks,
      mcqScore: mcqResult.score,
      openScore: 0,
      totalScore: mcqResult.score,
    }
    addAttempt(attempt)
    setPhase('done')
    navigate(`/exam/result?id=${attempt.id}`)
  }, [addAttempt, answers, mcqs, navigate, opens, openText, startedAt])

  const answeredCount = useMemo(
    () => Object.keys(answers).length,
    [answers],
  )

  // Lock navigation away accidentally
  useEffect(() => {
    if (phase !== 'mcq' && phase !== 'open') return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [phase])

  if (phase === 'pre') {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        <Card>
          <Title level={3}>Толық емтихан</Title>
          <Paragraph>
            Жалпы уақыт: <Text strong>120 минут</Text>
          </Paragraph>
          <ul>
            <li>
              <Text strong>Тест бөлімі:</Text> 50 сұрақ, 40 минут (20 балл)
            </li>
            <li>
              <Text strong>Ашық сұрақтар:</Text> 2 сұрақ, 80 минут (20 балл)
            </li>
          </ul>
          <Alert
            style={{ margin: '16px 0' }}
            type="warning"
            showIcon
            message="Емтиханды бастағаннан кейін бетті жаппаңыз — таймер тоқтамайды."
          />
          <Space>
            <Button type="primary" size="large" onClick={begin}>
              Бастау
            </Button>
            <Button onClick={() => navigate('/')}>Кері</Button>
          </Space>
        </Card>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <Result
        status="success"
        title="Емтихан аяқталды"
        subTitle="Нәтиже бетіне өтілуде..."
      />
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '16px' }}>
      <Row
        align="middle"
        justify="space-between"
        gutter={[12, 12]}
        style={{ marginBottom: 16, position: 'sticky', top: 0, zIndex: 10, background: 'inherit', padding: '8px 0' }}
      >
        <Col>
          <Steps
            size="small"
            current={phase === 'mcq' ? 0 : 1}
            items={[{ title: 'Тест' }, { title: 'Ашық сұрақтар' }]}
          />
        </Col>
        <Col>
          <Timer
            initialSeconds={phase === 'mcq' ? MCQ_SECONDS : OPEN_SECONDS}
            onExpire={() => {
              if (phase === 'mcq') setPhase('open')
              else finalize()
            }}
          />
        </Col>
      </Row>

      {phase === 'mcq' && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Card size="small">
            <Text strong>
              {answeredCount} / {mcqs.length} жауап берілді
            </Text>
          </Card>
          {mcqs.map((q, i) => (
            <McqCard
              key={q.id}
              question={q}
              index={i}
              answered={answers[q.id] ?? null}
              onAnswer={(c) => setAnswers((a) => ({ ...a, [q.id]: c }))}
            />
          ))}
          <Button
            type="primary"
            size="large"
            block
            onClick={() => setPhase('open')}
          >
            Ашық сұрақтарға өту →
          </Button>
        </Space>
      )}

      {phase === 'open' && (
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {opens.map((q, i) => (
            <OpenCard
              key={q.id}
              question={q}
              index={i}
              userAnswer={openText[q.id] ?? ''}
              onAnswerChange={(t) =>
                setOpenText((s) => ({ ...s, [q.id]: t }))
              }
            />
          ))}
          <Button
            type="primary"
            size="large"
            block
            danger
            onClick={() => setConfirmOpen(true)}
          >
            Емтиханды тапсыру
          </Button>
        </Space>
      )}

      <Modal
        open={confirmOpen}
        title="Емтиханды тапсыру"
        onCancel={() => setConfirmOpen(false)}
        onOk={() => {
          setConfirmOpen(false)
          finalize()
        }}
        okText="Иә, тапсыру"
        cancelText="Жалғастыру"
      >
        <Paragraph>
          Тапсырғаннан кейін жауаптарды өзгерте алмайсыз. Жалғастырамыз ба?
        </Paragraph>
      </Modal>
    </div>
  )
}
