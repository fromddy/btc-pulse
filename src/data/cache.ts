const PREFIX = 'pulse:'

export function readCache<T>(key: string): { data: T; savedAt: number } | null {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (!raw) return null
    return JSON.parse(raw) as { data: T; savedAt: number }
  } catch {
    return null
  }
}

export function writeCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(
      PREFIX + key,
      JSON.stringify({ data, savedAt: Date.now() }),
    )
  } catch {
    // quota / private mode: ignore
  }
}

export function isFresh(savedAt: number, maxAgeMs: number): boolean {
  return Date.now() - savedAt < maxAgeMs
}
