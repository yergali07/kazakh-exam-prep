import { Card, Collapse, Input, Space, Tag, Typography } from 'antd'
import type { OpenQuestion } from '../data/types'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

export interface OpenCardProps {
  question: OpenQuestion
  userAnswer: string
  onAnswerChange: (text: string) => void
  modelVisible?: boolean
  index?: number
}

function wordCount(s: string): number {
  return s.trim().length === 0 ? 0 : s.trim().split(/\s+/).length
}

export function OpenCard({
  question,
  userAnswer,
  onAnswerChange,
  modelVisible = false,
  index,
}: OpenCardProps) {
  return (
    <Card
      title={
        <Space wrap>
          {index != null && <Text strong>Ашық сұрақ №{index + 1}</Text>}
          <Tag color="purple">{question.topic}</Tag>
        </Space>
      }
    >
      <Title level={5} style={{ marginTop: 0, whiteSpace: 'pre-wrap' }}>
        {question.question}
      </Title>

      <TextArea
        value={userAnswer}
        onChange={(e) => onAnswerChange(e.target.value)}
        autoSize={{ minRows: 12, maxRows: 30 }}
        placeholder="Жауабыңызды осында жазыңыз..."
      />
      <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
        Сөз саны: {wordCount(userAnswer)}
      </Text>

      <Collapse
        style={{ marginTop: 16 }}
        items={[
          {
            key: 'key-points',
            label: 'Негізгі тармақтар (өзін-өзі бағалау үшін)',
            children: (
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {question.keyPoints.map((kp, i) => (
                  <li key={i}>{kp}</li>
                ))}
              </ul>
            ),
          },
        ]}
      />

      {modelVisible && (
        <Collapse
          style={{ marginTop: 12 }}
          items={[
            {
              key: 'model',
              label: 'Үлгі жауап',
              children: (
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                  {question.modelAnswer}
                </Paragraph>
              ),
            },
          ]}
        />
      )}
    </Card>
  )
}
