import { formatRuDate } from '../../utils/formatDate'
import type { Booking } from './types'

export const formatBookingDate = formatRuDate

export function isBookingExpired(booking: Booking): boolean {
  const today = new Date().toISOString().split('T')[0]
  return booking.check_out < today
}

export function sortBookingsByCheckIn(bookings: Booking[]): Booking[] {
  return [...bookings].sort((a, b) => a.check_in.localeCompare(b.check_in))
}
