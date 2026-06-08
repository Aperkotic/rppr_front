export function formatRuDate(dateStr: string): string {
  if (!dateStr) return '—'

  const [datePart] = dateStr.split('T')
  const [year, month, day] = datePart.split('-')

  if (year && month && day) {
    return `${day}.${month}.${year}`
  }

  return new Date(dateStr).toLocaleDateString('ru-RU')
}
