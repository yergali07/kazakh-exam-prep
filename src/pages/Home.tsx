import { Card, Col, Row, Statistic, Typography, Button, Space } from 'antd'
import {
  ClockCircleOutlined,
  ExperimentOutlined,
  BookOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { mcqQuestions, openQuestions } from '../data/questions'
import { useExamHistory } from '../hooks/useExamHistory'

const { Title, Paragraph, Text } = Typography

export function Home() {
  const { bestScore, history } = useExamHistory()

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ marginBottom: 4 }}>
          Кәсіби қазақ тілі — емтиханға дайындық
        </Title>
        <Paragraph type="secondary">
          KBTU қорытынды емтиханын шынайы форматта жаттығыңыз.
        </Paragraph>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card hoverable styles={{ body: { minHeight: 220 } }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <ClockCircleOutlined style={{ fontSize: 28, color: '#1677ff' }} />
              <Title level={4} style={{ margin: 0 }}>
                Толық емтихан
              </Title>
              <Text type="secondary">120 мин · 50 тест + 2 ашық сұрақ</Text>
              <Statistic
                title="Үздік нәтиже"
                value={
                  history.length === 0 ? '—' : `${bestScore.toFixed(1)} / 40`
                }
              />
              <Link to="/exam">
                <Button type="primary" block>
                  Бастау
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card hoverable styles={{ body: { minHeight: 220 } }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <ExperimentOutlined style={{ fontSize: 28, color: '#52c41a' }} />
              <Title level={4} style={{ margin: 0 }}>
                Жаттығу
              </Title>
              <Text type="secondary">
                Кездейсоқ сұрақ, бірден кері байланыс
              </Text>
              <Statistic title="MCQ сұрақтары" value={mcqQuestions.length} />
              <Link to="/practice">
                <Button block>Жаттығу</Button>
              </Link>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card hoverable styles={{ body: { minHeight: 220 } }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <BookOutlined style={{ fontSize: 28, color: '#722ed1' }} />
              <Title level={4} style={{ margin: 0 }}>
                Сұрақтар базасы
              </Title>
              <Text type="secondary">
                Барлық сұрақтарды қарап, шешу
              </Text>
              <Statistic
                title="Барлығы"
                value={mcqQuestions.length + openQuestions.length}
              />
              <Link to="/browse">
                <Button block>Қарап шығу</Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
