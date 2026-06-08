export function parseIsoDate(value: string): Date | null {
  if (!value) return null
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function getTodayStart(): Date {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date
}
