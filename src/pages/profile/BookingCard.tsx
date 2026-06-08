import styles from './BookingHistory.module.css'
import { formatBookingDate, isBookingExpired } from './bookingUtils'
import { statusColors, statusLabels, type Booking } from './types'

interface BookingCardProps {
  booking: Booking
  onPaymentRequest: (bookingId: number) => void
  onEditRequest: (booking: Booking) => void
  onCancelRequest: (bookingId: number) => void
}

export const BookingCard = ({
  booking,
  onPaymentRequest,
  onEditRequest,
  onCancelRequest,
}: BookingCardProps) => {
  const expired = isBookingExpired(booking)
  const showActions = !expired && (booking.status === 'pending' || booking.status === 'confirmed')

  return (
    <div className={styles.card}>
      {booking.hotel_image_url && (
        <img src={booking.hotel_image_url} alt={booking.hotel_name} className={styles.cardImage} />
      )}
      <div className={styles.cardContent}>
        <div className={styles.header}>
          <h3>{booking.hotel_name}</h3>
          <span className={styles.status} style={{ backgroundColor: statusColors[booking.status] }}>
            {statusLabels[booking.status]}
          </span>
        </div>
        <div className={styles.info}>
          <p>
            <strong>Комната:</strong> {booking.room_name}
          </p>
          <p>
            <strong>Заезд:</strong> {formatBookingDate(booking.check_in)}
          </p>
          <p>
            <strong>Выезд:</strong> {formatBookingDate(booking.check_out)}
          </p>
          <p>
            <strong>Стоимость:</strong> {parseFloat(booking.total_price).toFixed(2)} руб.
          </p>
        </div>
        {showActions && (
          <div className={styles.actions}>
            {booking.status === 'pending' && (
              <button className={styles.payButton} onClick={() => onPaymentRequest(booking.id)}>
                Оплатить
              </button>
            )}
            <button className={styles.editButton} onClick={() => onEditRequest(booking)}>
              Изменить
            </button>
            <button className={styles.cancelButton} onClick={() => onCancelRequest(booking.id)}>
              Отменить
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
