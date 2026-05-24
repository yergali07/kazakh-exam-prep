import { Button, Layout, Space, Tooltip, Typography, theme } from 'antd'
import { MoonOutlined, SunOutlined } from '@ant-design/icons'
import { Link, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { PracticeMode } from './pages/PracticeMode'
import { BrowseMode } from './pages/BrowseMode'
import { ExamMode } from './pages/ExamMode'
import { ExamResult } from './pages/ExamResult'
import { useTheme } from './hooks/useTheme'

const { Header, Content, Footer } = Layout
const { Title } = Typography

function App() {
  const { mode, toggle } = useTheme()
  const { token } = theme.useToken()

  return (
    <Layout style={{ minHeight: '100vh', background: token.colorBgLayout }}>
      <Header
        style={{
          background: token.colorBgContainer,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        <Link to="/" style={{ color: 'inherit' }}>
          <Title level={4} style={{ margin: 0 }}>
            Кәсіби қазақ тілі
          </Title>
        </Link>
        <Space>
          <Tooltip
            title={mode === 'dark' ? 'Жарық режим' : 'Қараңғы режим'}
          >
            <Button
              type="text"
              icon={mode === 'dark' ? <SunOutlined /> : <MoonOutlined />}
              onClick={toggle}
              aria-label="Toggle theme"
            />
          </Tooltip>
        </Space>
      </Header>
      <Content>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exam" element={<ExamMode />} />
          <Route path="/exam/result" element={<ExamResult />} />
          <Route path="/practice" element={<PracticeMode />} />
          <Route path="/browse" element={<BrowseMode />} />
        </Routes>
      </Content>
      <Footer
        style={{
          textAlign: 'center',
          background: 'transparent',
          color: token.colorTextSecondary,
        }}
      >
        Kazakh Exam Prep · KBTU «Кәсіби қазақ тілі»
      </Footer>
    </Layout>
  )
}

export default App
