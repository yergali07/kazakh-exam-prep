import { Card, Radio, Space, Tag, Typography, Alert, theme } from 'antd'
import type { RadioChangeEvent } from 'antd'
import type { MCQChoice, MCQuestion } from '../data/types'

const { Title, Text, Paragraph } = Typography
const { useToken } = theme

export interface McqCardProps {
  question: MCQuestion
  answered?: MCQChoice | null
  onAnswer: (choice: MCQChoice) => void
  showFeedback?: boolean
  index?: number
}

function optionStyle(
  showFeedback: boolean,
  answered: MCQChoice | null | undefined,
  correct: MCQChoice,
  optionId: MCQChoice,
  colors: { success: string; error: string },
): React.CSSProperties {
  if (!showFeedback || !answered) return {}
  if (optionId === correct) {
    return { color: colors.success, fontWeight: 600 }
  }
  if (optionId === answered && answered !== correct) {
    return { color: colors.error, textDecoration: 'line-through' }
  }
  return { opacity: 0.7 }
}

export function McqCard({
  question,
  answered = null,
  onAnswer,
  showFeedback = false,
  index,
}: McqCardProps) {
  const { token } = useToken()
  const colors = { success: token.colorSuccess, error: token.colorError }
  const locked = showFeedback && answered != null
  const handleChange = (e: RadioChangeEvent) => {
    if (locked) return
    onAnswer(e.target.value as MCQChoice)
  }

  return (
    <Card
      size="small"
      title={
        <Space wrap>
          {index != null && <Text strong>№{index + 1}</Text>}
          <Tag color="blue">Апта {question.week}</Tag>
          <Tag>{question.topic}</Tag>
        </Space>
      }
    >
      <Title level={5} style={{ marginTop: 0, whiteSpace: 'pre-wrap' }}>
        {question.question}
      </Title>
      <Radio.Group
        onChange={handleChange}
        value={answered ?? undefined}
        style={{ display: 'block' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          {question.options.map((opt) => (
            <Radio
              key={opt.id}
              value={opt.id}
              disabled={locked}
              style={optionStyle(
                showFeedback,
                answered,
                question.correctAnswer,
                opt.id,
                colors,
              )}
            >
              <Text strong>{opt.id}.</Text> {opt.text}
            </Radio>
          ))}
        </Space>
      </Radio.Group>

      {showFeedback && answered && (
        <Alert
          style={{ marginTop: 16 }}
          type={answered === question.correctAnswer ? 'success' : 'error'}
          message={
            answered === question.correctAnswer
              ? 'Дұрыс жауап!'
              : `Дұрыс жауап: ${question.correctAnswer}`
          }
          description={
            <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
              {question.explanation}
            </Paragraph>
          }
          showIcon
        />
      )}
    </Card>
  )
}
