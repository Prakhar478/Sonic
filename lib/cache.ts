const cache = new Map<string, {
  value: any
  expiresAt: number
}>()

export function getCache(
  key: string
): any | null {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.value
}

export function setCache(
  key: string,
  value: any,
  ttlMs: number
): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  })
}

export function deleteCache(
  key: string
): void {
  cache.delete(key)
}

export function clearCache(): void {
  cache.clear()
}
