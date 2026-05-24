import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ConfigProvider, theme as antdTheme } from 'antd'
import { KEYS, loadJson, saveJson } from '../utils/storage'

export type ThemeMode = 'light' | 'dark'

interface ThemeCtx {
  mode: ThemeMode
  toggle: () => void
  setMode: (m: ThemeMode) => void
}

const Ctx = createContext<ThemeCtx | null>(null)

const STORAGE_KEY = `${KEYS.examHistory.split(':')[0]}:theme`

function getInitialMode(): ThemeMode {
  const stored = loadJson<ThemeMode | null>(STORAGE_KEY, null)
  if (stored === 'light' || stored === 'dark') return stored
  if (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }
  return 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => getInitialMode())

  useEffect(() => {
    saveJson(STORAGE_KEY, mode)
    document.documentElement.dataset.theme = mode
  }, [mode])

  const value = useMemo<ThemeCtx>(
    () => ({
      mode,
      setMode,
      toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')),
    }),
    [mode],
  )

  return (
    <Ctx.Provider value={value}>
      <ConfigProvider
        theme={{
          algorithm:
            mode === 'dark'
              ? antdTheme.darkAlgorithm
              : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#1677ff',
            borderRadius: 8,
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          },
        }}
      >
        {children}
      </ConfigProvider>
    </Ctx.Provider>
  )
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useTheme must be used within ThemeProvider')
  return v
}
