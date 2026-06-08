import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { apiClient } from '../../api/client'
import { formatRuDate } from '../../utils/formatDate'
import styles from './AdminPage.module.css'

type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

interface Booking {
  id: number
  user: {
    id: number
    first_name: string
    last_name: string
    login: string
    is_manager: boolean
    created_at: string
  }
  room: {
    id: number
    name: string
    hotel_id: number
  }
  check_in: string
  check_out: string
  total_price: string
  status: BookingStatus
}

interface AdminBookingsResponse {
  bookings: Booking[]
  total_bookings: number
  confirmed_bookings: number
  cancelled_bookings: number
  total_revenue: string
}

interface AdminSummary {
  total_bookings: number
  confirmed_bookings: number
  cancelled_bookings: number
  total_revenue: string
}

const LIMIT = 10

const statusLabels: Record<BookingStatus, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
}

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
})

const formatMoney = (value: string | number) => {
  const numericValue = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numericValue)) {
    return '0 ₽'
  }
  return moneyFormatter.format(numericValue)
}

export const AdminPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [summary, setSummary] = useState<AdminSummary>({
    total_bookings: 0,
    confirmed_bookings: 0,
    cancelled_bookings: 0,
    total_revenue: '0',
  })
  const [offset, setOffset] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.get<AdminBookingsResponse>('/api/admin/bookings', {
          params: { limit: LIMIT, offset },
        })
        setBookings(response.data.bookings)
        setSummary({
          total_bookings: response.data.total_bookings,
          confirmed_bookings: response.data.confirmed_bookings,
          cancelled_bookings: response.data.cancelled_bookings,
          total_revenue: response.data.total_revenue,
        })
      } catch (err) {
        console.error('Error fetching bookings:', err)
        setError('Не удалось загрузить бронирования')
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [offset])

  const handleStatusChange = async (bookingId: number, status: BookingStatus) => {
    const previousBookings = bookings
    setUpdatingId(bookingId)
    setError(null)
    setBookings((current) => current.map((booking) => (
      booking.id === bookingId ? { ...booking, status } : booking
    )))

    try {
      const response = await apiClient.patch<Booking>(`/api/admin/bookings/${bookingId}/status`, { status })
      setBookings((current) => current.map((booking) => (
        booking.id === bookingId ? response.data : booking
      )))
    } catch (err) {
      console.error('Error updating booking status:', err)
      setBookings(previousBookings)
      setError('Не удалось изменить статус бронирования')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Панель управляющего</h1>
        <div className={styles.headerActions}>
          <Link to="/admin/add-hotel" className={styles.primaryAction}>Добавить отель</Link>
          <Link to="/admin/add-room" className={styles.secondaryAction}>Добавить номер</Link>
        </div>
      </div>

      <section className={styles.summary} aria-label="Сводка бронирований">
        <div className={styles.summaryCard}>
          <h2>Всего броней</h2>
          <p>{summary.total_bookings}</p>
        </div>
        <div className={styles.summaryCard}>
          <h2>Подтверждено</h2>
          <p>{summary.confirmed_bookings}</p>
        </div>
        <div className={styles.summaryCard}>
          <h2>Отменено</h2>
          <p>{summary.cancelled_bookings}</p>
        </div>
        <div className={styles.summaryCard}>
          <h2>Выручка</h2>
          <p>{formatMoney(summary.total_revenue)}</p>
        </div>
      </section>

      <section className={styles.bookingsSection}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Новые бронирования и изменение статуса</h2>
          <span className={styles.pageMeta}>
            {bookings.length > 0 ? `Показано ${offset + 1}-${offset + bookings.length}` : 'Показано 0'}
          </span>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        {loading ? (
          <div className={styles.state}>Загрузка...</div>
        ) : bookings.length === 0 ? (
          <div className={styles.state}>Бронирований нет</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Гость</th>
                  <th>Номер</th>
                  <th>Даты</th>
                  <th>Стоимость</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div className={styles.guestName}>
                        {booking.user.first_name} {booking.user.last_name}
                      </div>
                      <div className={styles.guestLogin}>{booking.user.login}</div>
                    </td>
                    <td>
                      <div>{booking.room.name}</div>
                      <div className={styles.muted}>Отель #{booking.room.hotel_id}</div>
                    </td>
                    <td>
                      {formatRuDate(booking.check_in)} – {formatRuDate(booking.check_out)}
                    </td>
                    <td>{formatMoney(booking.total_price)}</td>
                    <td>
                      <select
                        className={styles.statusSelect}
                        value={booking.status}
                        disabled={updatingId === booking.id}
                        onChange={(event) => handleStatusChange(booking.id, event.target.value as BookingStatus)}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={styles.pagination}>
          <button
            type="button"
            className={styles.pageButton}
            disabled={offset === 0 || loading}
            onClick={() => setOffset((current) => Math.max(0, current - LIMIT))}
          >
            Назад
          </button>
          <button
            type="button"
            className={styles.pageButton}
            disabled={offset + bookings.length >= summary.total_bookings || loading}
            onClick={() => setOffset((current) => current + LIMIT)}
          >
            Вперед
          </button>
        </div>
      </section>
    </div>
  )
}
