# Kazakh Language Exam Prep — Project Spec

> Web app for preparing for the KBTU «Кәсіби қазақ тілі» final exam. Simulates exam format, lets the user practice individual questions, and browse the full question bank.

## Tech Stack

- **Vite + React 18 + TypeScript** (strict mode)
- **Ant Design 5** (`antd`, `@ant-design/icons`)
- **react-router-dom v6**
- **No backend** — questions are static TS data, progress in localStorage
- **Deploy:** Vercel (auto-detects Vite, zero config)

## Project Structure

```
src/
  data/
    types.ts            # MCQuestion, OpenQuestion, ExamAttempt types
    questions.ts        # Re-exports mcqQuestions and openQuestions arrays
  pages/
    Home.tsx            # Mode selection (exam / practice / browse)
    ExamMode.tsx        # Full 120-min exam simulation
    ExamResult.tsx      # Score breakdown + review wrong answers
    PracticeMode.tsx    # Single random question with feedback
    BrowseMode.tsx      # Filterable list of all questions
  components/
    McqCard.tsx         # MCQ display with answer feedback
    OpenCard.tsx        # Open question with self-grading rubric
    Timer.tsx           # Countdown with warning states
    QuestionFilter.tsx  # Week + topic filter for browse mode
    ResultSummary.tsx   # Score card with breakdown
  utils/
    randomize.ts        # Fisher-Yates shuffle, pickN
    scoring.ts          # MCQ scoring, weighted grade calc
    storage.ts          # localStorage wrappers
  hooks/
    useTimer.ts
    useExamHistory.ts
  App.tsx               # Router setup
  main.tsx              # App entry, AntD ConfigProvider
  index.css             # Tailwind-style reset, AntD overrides
vercel.json             # SPA rewrites
```

## Data Model

See `src/data/types.ts` (already populated):

```ts
type MCQuestion = {
  id: string;              // e.g. "mcq-001"
  week: number;            // 2-14
  topic: string;           // "Қазақ жазуы тарихы" etc.
  question: string;
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation: string;     // Why correct, brief lecture reference
};

type OpenQuestion = {
  id: string;
  topic: string;
  question: string;
  keyPoints: string[];     // Self-grading checklist
  modelAnswer: string;     // Reference essay (~1-1.5 pages)
};
```

## Exam Format (matches official spec)

| Section | Count | Time | Points |
|---|---|---|---|
| MCQ test | 50 | 40 min | 20 (0.4 pt each) |
| Open questions | 2 | 80 min | 20 (10 each: 6 content + 2 grammar + 2 punctuation) |
| **Total** | — | **120 min** | **40** |

Note: actual exam doc says 9/3/3 split for 15-point open questions, but instructions doc says 20 points total. App should use 6/2/2 ratio scaled to 10 points per open question to match the 20-point total.

## Page Specs

### `/` — Home

Hero with three cards (Ant Design `Card.Grid` or `Row/Col` of `Card`):

1. **Толық емтихан** (Full Exam) → `/exam`
   - Description: "120 мин, 50 тест + 2 ашық сұрақ"
   - Stat: best score from localStorage history
2. **Жаттығу** (Practice) → `/practice`
   - Description: "Кездейсоқ сұрақ, бірден тексеру"
3. **Сұрақтар базасы** (Question Bank) → `/browse`
   - Description: "Барлық сұрақтарды қарап, шешу"
   - Stat: total questions count

Footer: link to GitHub/GitLab repo, last updated date.

### `/exam` — Exam Mode

Flow:

1. **Pre-start screen**: rules summary, "Бастау" button.
2. **MCQ phase** (40 min):
   - `pickN(mcqQuestions, 50)` random selection
   - Display one question at a time with Previous/Next, or all on one scrollable page (prefer scrollable — easier mobile UX)
   - Show progress: "12 / 50 жауап берілді"
   - Timer at top right
   - "MCQ-ге кірісу" button when ready to submit MCQ phase
3. **Open question phase** (80 min):
   - `pickN(openQuestions, 2)`
   - Each shown with question text and a large `<TextArea>` for user's answer
   - User can scroll between both
4. **Submit**:
   - Auto-submit on timer expiry
   - Confirm modal on manual submit
5. **Redirect to `/exam/result`** with the attempt data.

Persist attempt to localStorage `examHistory` array. Use `useExamHistory` hook.

### `/exam/result` — Results

- **MCQ score**: `correctCount / 50 × 20` displayed as Ant `Statistic` + `Progress` ring
- **Open questions**: self-grade modal per question — user checks off keyPoints they covered, marks grammar/punctuation as self-assessed pass/fail. Show modelAnswer below their answer in a collapsible `Collapse`.
- **Final score** out of 40
- **Review wrong MCQ** section: list of incorrectly-answered MCQs with full explanations
- "Қайта тапсыру" → new exam

### `/practice` — Practice Mode

- Click "Кездейсоқ сұрақ" → picks random MCQ (or filter by week/topic via dropdown)
- Show question, user clicks an option
- On click: highlight correct (green) + chosen (red if wrong) + show explanation card below
- "Келесі сұрақ" button to repeat

Optional: toggle between MCQ-only and open-questions in this mode.

### `/browse` — Question Bank

- Sidebar/top filters: week (multi-select), topic (multi-select), search by keyword
- List view of all matching questions (paginated, 20 per page)
- Click any question → opens detail modal or expands inline, same behavior as practice (answer + feedback + explanation)

## Component Contracts

### `<McqCard question answered onAnswer />`

Props:
- `question: MCQuestion`
- `answered?: 'A' | 'B' | 'C' | 'D'` — user's selection
- `onAnswer: (choice) => void`
- `showFeedback?: boolean` — if true, color the options and show explanation

Behavior: in exam mode `showFeedback=false`, in practice/browse `showFeedback=true` after answer.

### `<OpenCard question userAnswer onAnswerChange modelVisible />`

Props:
- `question: OpenQuestion`
- `userAnswer: string`
- `onAnswerChange: (text) => void`
- `modelVisible?: boolean` — show model answer below

Includes `<TextArea autoSize={{ minRows: 12 }} />`. Word counter at bottom.

### `<Timer initialSeconds onExpire />`

- Big countdown at top right
- Color: green > 50%, yellow 20-50%, red < 20%, pulse red < 10%
- Calls `onExpire()` at 0
- Pausable for practice mode (not exam)

## Utilities

### `randomize.ts`

```ts
export function shuffle<T>(arr: T[]): T[]   // Fisher-Yates
export function pickN<T>(arr: T[], n: number): T[]
```

### `scoring.ts`

```ts
export function scoreMcqs(
  picks: { questionId: string; answer: string | null }[],
  questions: MCQuestion[]
): { correct: number; total: number; score: number; wrong: MCQuestion[] }

export function scoreOpenSelf(
  selfGrade: { coveredKeyPoints: number; totalKeyPoints: number; grammarOk: boolean; punctuationOk: boolean }
): number  // 0-10
```

### `storage.ts`

```ts
const KEYS = {
  examHistory: 'kep:examHistory',
  practiceStats: 'kep:practiceStats',  // { questionId: { seen, correct } }
};
export function loadJson<T>(key: string, fallback: T): T
export function saveJson(key: string, value: unknown): void
```

## UX Requirements

- **Mobile-first**: AntD components are responsive but verify on 380px width
- **Kazakh as primary UI language** (mirror exam terminology)
- **Keyboard shortcuts in practice**: A/B/C/D to answer, N for next
- **Dark mode** via AntD `ConfigProvider` theme algorithm (optional, nice-to-have)
- **No external network calls** — everything bundled

## vercel.json

For SPA routing, create at repo root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Without this, direct navigation to `/practice` returns 404 on Vercel.

## Build & Deploy

```bash
npm run dev       # local dev at :5173
npm run build     # outputs to dist/
npm run preview   # test prod build locally
```

On Vercel:
- Framework Preset: Vite (auto-detected)
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

Push to main → auto-deploy.

## Implementation Order (suggested)

1. Scaffold routing, layout, home page (1 session)
2. `McqCard` + `PracticeMode` (random pick + feedback) — fastest way to validate data shape
3. `BrowseMode` with filters
4. `Timer` + `ExamMode` orchestration
5. `OpenCard` + self-grading flow in `ExamResult`
6. localStorage history persistence
7. Polish: mobile layout, keyboard shortcuts, dark mode
8. Deploy to Vercel

## Expanding the Question Bank

To add more questions, append to the arrays in `src/data/questions.ts`. IDs follow pattern `mcq-NNN` and `open-NNN`. To generate new ones from lecture material, prompt Claude Code:

> Read [lecture-week-N-notes.md], generate 10 new MCQ in the same format as src/data/questions.ts. Each must have a plausible distractor for every wrong option, and the explanation must cite the lecture week.

## Out of Scope (for v1)

- User accounts / auth
- Server-side persistence
- Auto-grading of open questions (use self-grading)
- Spaced repetition / SRS
- Audio/video questions
