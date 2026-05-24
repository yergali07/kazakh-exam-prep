import { useMemo, useState } from 'react'
import {
  Card,
  Collapse,
  List,
  Pagination,
  Segmented,
  Space,
  Tag,
  Typography,
} from 'antd'
import {
  allTopics,
  allWeeks,
  mcqQuestions,
  openQuestions,
} from '../data/questions'
import type { MCQChoice, MCQuestion, OpenQuestion } from '../data/types'
import { McqCard } from '../components/McqCard'
import { QuestionFilter } from '../components/QuestionFilter'
import type { QuestionFilterValue } from '../components/QuestionFilter'

const { Title, Text, Paragraph } = Typography
const PAGE_SIZE = 20

type Kind = 'mcq' | 'open'

function filterMcq(qs: MCQuestion[], f: QuestionFilterValue): MCQuestion[] {
  const q = f.search.toLowerCase()
  return qs.filter((x) => {
    if (f.weeks.length && !f.weeks.includes(x.week)) return false
    if (f.topics.length && !f.topics.includes(x.topic)) return false
    if (q && !x.question.toLowerCase().includes(q)) return false
    return true
  })
}

function filterOpen(qs: OpenQuestion[], f: QuestionFilterValue): OpenQuestion[] {
  const q = f.search.toLowerCase()
  return qs.filter((x) => {
    if (f.topics.length && !f.topics.includes(x.topic)) return false
    if (q && !x.question.toLowerCase().includes(q)) return false
    return true
  })
}

function McqRow({ q }: { q: MCQuestion }) {
  const [answer, setAnswer] = useState<MCQChoice | null>(null)
  return (
    <McqCard question={q} answered={answer} onAnswer={setAnswer} showFeedback />
  )
}

export function BrowseMode() {
  const [kind, setKind] = useState<Kind>('mcq')
  const [filter, setFilter] = useState<QuestionFilterValue>({
    weeks: [],
    topics: [],
    search: '',
  })
  const [page, setPage] = useState(1)

  const filteredMcq = useMemo(
    () => filterMcq(mcqQuestions, filter),
    [filter],
  )
  const filteredOpen = useMemo(
    () => filterOpen(openQuestions, filter),
    [filter],
  )

  const total = kind === 'mcq' ? filteredMcq.length : filteredOpen.length
  const start = (page - 1) * PAGE_SIZE
  const paged =
    kind === 'mcq'
      ? filteredMcq.slice(start, start + PAGE_SIZE)
      : filteredOpen.slice(start, start + PAGE_SIZE)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={3} style={{ margin: 0 }}>
          Сұрақтар базасы
        </Title>

        <Segmented
          value={kind}
          onChange={(v) => {
            setKind(v as Kind)
            setPage(1)
          }}
          options={[
            { label: `MCQ (${mcqQuestions.length})`, value: 'mcq' },
            { label: `Ашық (${openQuestions.length})`, value: 'open' },
          ]}
        />

        <Card size="small">
          <QuestionFilter
            weeks={allWeeks}
            topics={allTopics}
            value={filter}
            onChange={(v) => {
              setFilter(v)
              setPage(1)
            }}
          />
        </Card>

        <Text type="secondary">Табылды: {total}</Text>

        {kind === 'mcq' ? (
          <List
            dataSource={paged as MCQuestion[]}
            renderItem={(q) => (
              <List.Item style={{ display: 'block', padding: '8px 0' }}>
                <Collapse
                  items={[
                    {
                      key: q.id,
                      label: (
                        <Space wrap>
                          <Tag color="blue">Апта {q.week}</Tag>
                          <Tag>{q.topic}</Tag>
                          <Text>{q.question.slice(0, 80)}…</Text>
                        </Space>
                      ),
                      children: <McqRow q={q} />,
                    },
                  ]}
                />
              </List.Item>
            )}
          />
        ) : (
          <List
            dataSource={paged as OpenQuestion[]}
            renderItem={(q) => (
              <List.Item style={{ display: 'block', padding: '8px 0' }}>
                <Collapse
                  items={[
                    {
                      key: q.id,
                      label: (
                        <Space wrap>
                          <Tag color="purple">{q.topic}</Tag>
                          <Text>{q.question.slice(0, 100)}…</Text>
                        </Space>
                      ),
                      children: (
                        <>
                          <Paragraph strong style={{ whiteSpace: 'pre-wrap' }}>
                            {q.question}
                          </Paragraph>
                          <Collapse
                            items={[
                              {
                                key: 'kp',
                                label: 'Негізгі тармақтар',
                                children: (
                                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                                    {q.keyPoints.map((kp, i) => (
                                      <li key={i}>{kp}</li>
                                    ))}
                                  </ul>
                                ),
                              },
                              {
                                key: 'ma',
                                label: 'Үлгі жауап',
                                children: (
                                  <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                                    {q.modelAnswer}
                                  </Paragraph>
                                ),
                              },
                            ]}
                          />
                        </>
                      ),
                    },
                  ]}
                />
              </List.Item>
            )}
          />
        )}

        {total > PAGE_SIZE && (
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
            style={{ textAlign: 'center' }}
          />
        )}
      </Space>
    </div>
  )
}
