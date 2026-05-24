import { beforeEach, describe, expect, it, vi } from 'vitest'
import { KEYS, loadJson, saveJson } from './storage'

beforeEach(() => {
  window.localStorage.clear()
  vi.restoreAllMocks()
})

describe('loadJson', () => {
  it('returns the fallback when no value is set', () => {
    expect(loadJson('missing', { a: 1 })).toEqual({ a: 1 })
  })

  it('returns the parsed JSON when present', () => {
    window.localStorage.setItem('k', JSON.stringify([1, 2, 3]))
    expect(loadJson<number[]>('k', [])).toEqual([1, 2, 3])
  })

  it('returns the fallback when JSON is malformed', () => {
    window.localStorage.setItem('k', '{not-json')
    expect(loadJson('k', 'fallback')).toBe('fallback')
  })
})

describe('saveJson', () => {
  it('writes JSON-stringified data to localStorage', () => {
    saveJson('k', { x: 1, y: [2, 3] })
    expect(window.localStorage.getItem('k')).toBe('{"x":1,"y":[2,3]}')
  })

  it('round-trips with loadJson', () => {
    saveJson(KEYS.examHistory, [{ id: 'a' }])
    expect(loadJson(KEYS.examHistory, [])).toEqual([{ id: 'a' }])
  })

  it('swallows storage errors (quota exceeded etc.)', () => {
    vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceeded')
    })
    expect(() => saveJson('k', { a: 1 })).not.toThrow()
  })
})

describe('KEYS', () => {
  it('exposes namespaced storage keys', () => {
    expect(KEYS.examHistory).toBe('kep:examHistory')
    expect(KEYS.practiceStats).toBe('kep:practiceStats')
  })
})
