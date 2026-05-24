import { afterEach, describe, expect, it, vi } from 'vitest'
import { pickN, shuffle } from './randomize'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('shuffle', () => {
  it('returns a new array of the same length', () => {
    const arr = [1, 2, 3, 4, 5]
    const out = shuffle(arr)
    expect(out).not.toBe(arr)
    expect(out).toHaveLength(arr.length)
  })

  it('preserves the multiset of items', () => {
    const arr = [1, 2, 3, 4, 5, 6]
    const out = shuffle(arr).sort((a, b) => a - b)
    expect(out).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('does not mutate the input', () => {
    const arr = [1, 2, 3, 4]
    const copy = arr.slice()
    shuffle(arr)
    expect(arr).toEqual(copy)
  })

  it('handles empty arrays', () => {
    expect(shuffle([])).toEqual([])
  })

  it('is deterministic when Math.random is stubbed', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(shuffle([1, 2, 3, 4])).toEqual([2, 3, 4, 1])
  })
})

describe('pickN', () => {
  it('returns exactly n items when n < length', () => {
    const arr = [1, 2, 3, 4, 5]
    const out = pickN(arr, 3)
    expect(out).toHaveLength(3)
    for (const v of out) expect(arr).toContain(v)
  })

  it('returns a full shuffle when n >= length', () => {
    const arr = [1, 2, 3]
    const out = pickN(arr, 10)
    expect(out).toHaveLength(3)
    expect(out.slice().sort()).toEqual([1, 2, 3])
  })

  it('returns unique items (no duplicates from the source)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const out = pickN(arr, 5)
    expect(new Set(out).size).toBe(5)
  })

  it('returns [] when n is 0', () => {
    expect(pickN([1, 2, 3], 0)).toEqual([])
  })
})
