import { Card, Col, Progress, Row, Statistic, Typography } from 'antd'

const { Title } = Typography

export interface ResultSummaryProps {
  mcqCorrect: number
  mcqTotal: number
  mcqScore: number
  openScore: number
  totalScore: number
}

export function ResultSummary({
  mcqCorrect,
  mcqTotal,
  mcqScore,
  openScore,
  totalScore,
}: ResultSummaryProps) {
  const pct = Math.round((totalScore / 40) * 100)
  return (
    <Card>
      <Row gutter={[24, 24]} align="middle">
        <Col xs={24} md={8} style={{ textAlign: 'center' }}>
          <Progress type="dashboard" percent={pct} format={() => `${totalScore.toFixed(1)} / 40`} />
          <Title level={5} style={{ marginTop: 8 }}>
            Жалпы балл
          </Title>
        </Col>
        <Col xs={12} md={8}>
          <Statistic
            title="Тест (MCQ)"
            value={mcqScore.toFixed(1)}
            suffix=" / 20"
          />
          <Statistic
            title="Дұрыс жауап"
            value={`${mcqCorrect} / ${mcqTotal}`}
          />
        </Col>
        <Col xs={12} md={8}>
          <Statistic
            title="Ашық сұрақтар"
            value={openScore.toFixed(1)}
            suffix=" / 20"
          />
        </Col>
      </Row>
    </Card>
  )
}
