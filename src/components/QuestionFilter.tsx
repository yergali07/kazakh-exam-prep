import { Input, Select, Space } from 'antd'

export interface QuestionFilterValue {
  weeks: number[]
  topics: string[]
  search: string
}

export interface QuestionFilterProps {
  weeks: number[]
  topics: string[]
  value: QuestionFilterValue
  onChange: (v: QuestionFilterValue) => void
}

export function QuestionFilter({
  weeks,
  topics,
  value,
  onChange,
}: QuestionFilterProps) {
  return (
    <Space wrap style={{ width: '100%' }}>
      <Select
        mode="multiple"
        allowClear
        placeholder="Апта"
        style={{ minWidth: 180 }}
        value={value.weeks}
        onChange={(weeks) => onChange({ ...value, weeks })}
        options={weeks.map((w) => ({ value: w, label: `Апта ${w}` }))}
      />
      <Select
        mode="multiple"
        allowClear
        placeholder="Тақырып"
        style={{ minWidth: 260 }}
        value={value.topics}
        onChange={(topics) => onChange({ ...value, topics })}
        options={topics.map((t) => ({ value: t, label: t }))}
      />
      <Input.Search
        placeholder="Іздеу..."
        allowClear
        style={{ width: 240 }}
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
      />
    </Space>
  )
}
