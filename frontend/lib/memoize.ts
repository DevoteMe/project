type MemoizeFunction = <T extends (...args: any[]) => any>(fn: T, getKey?: (...args: Parameters<T>) => string) => T

const DEFAULT_CACHE_SIZE = 100

export const memoize: MemoizeFunction = (fn, getKey) => {
  const cache = new Map()
  const keys: string[] = []

  return ((...args) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const result = fn(...args)

    // Manage cache size
    if (keys.length >= DEFAULT_CACHE_SIZE) {
      const oldestKey = keys.shift()
      if (oldestKey) cache.delete(oldestKey)
    }

    keys.push(key)
    cache.set(key, result)

    return result
  }) as any
}

// For async functions
export const memoizeAsync = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  getKey?: (...args: Parameters<T>) => string,
): T => {
  const cache = new Map<string, Promise<any>>()
  const keys: string[] = []

  return (async (...args) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)
    }

    const resultPromise = fn(...args)

    // Manage cache size
    if (keys.length >= DEFAULT_CACHE_SIZE) {
      const oldestKey = keys.shift()
      if (oldestKey) cache.delete(oldestKey)
    }

    keys.push(key)
    cache.set(key, resultPromise)

    try {
      return await resultPromise
    } catch (error) {
      // Remove failed requests from cache
      cache.delete(key)
      keys.splice(keys.indexOf(key), 1)
      throw error
    }
  }) as any
}

