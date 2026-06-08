import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '../../api/client'
import styles from './BookingHistory.module.css'
import { AxiosError } from 'axios'
import { notificationService } from '../../services/notification/notificationService'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { notifyApiError } from '../../utils/notifyApiError'
import { BookingCard } from './BookingCard'
import { sortBookingsByCheckIn } from './bookingUtils'
import type { Booking, RoomDetails, UserInfo } from './types'

export const BookingHistory = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [editError, setEditError] = useState<string | null>(null)

  // State for modals
  const [cancelModal, setCancelModal] = useState<{ open: boolean; bookingId: number | null }>({ open: false, bookingId: null })
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; bookingId: number | null }>({ open: false, bookingId: null })
  const [editModal, setEditModal] = useState<{ open: boolean; booking: Booking | null }>({ open: false, booking: null })
  const [editDates, setEditDates] = useState({ check_in: '', check_out: '' })
  const [paymentData, setPaymentData] = useState({ cardNumber: '', expiryDate: '', cvv: '' })
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const fetchBookings = async (signal: AbortSignal) => {
    setLoading(true)
    try {
      const response = await apiClient.get('/bookings/my', { signal })
      const { bookings: rawBookings, ...userData } = response.data
      
      setUserInfo(userData)

      const enrichedBookings = await Promise.all(
        rawBookings.map(async (booking: Booking) => {
          try {
            const roomsResponse = await apiClient.get(`/hotels/${booking.hotel_id}/rooms`, { signal })
            const roomDetails = roomsResponse.data.find((r: RoomDetails) => r.id === booking.room_id)
            return {
              ...booking,
              hotel_name: roomDetails?.hotel_name || 'Отель не найден',
              room_name: roomDetails?.name || 'Комната не найдена',
              hotel_image_url: roomDetails?.hotel_image_url,
            }
          } catch (err) {
            if (err instanceof AxiosError && err.name === 'CanceledError') {
              // Ignore cancellation errors
              return booking;
            }
            console.error(`Ошибка загрузки данных для бронирования #${booking.id}:`, err)
            return {
              ...booking,
              hotel_name: 'Не удалось загрузить',
              room_name: 'Не удалось загрузить',
            }
          }
        })
      )
      
      setBookings(enrichedBookings)
    } catch (err) {
      if (err instanceof AxiosError && err.name === 'CanceledError') {
        // Ignore cancellation errors
        return;
      }
      console.error('Ошибка загрузки бронирований:', err)
      notifyApiError(err, 'Не удалось загрузить бронирования')
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    fetchBookings(abortController.signal)
    
    return () => {
      abortController.abort()
    }
  }, [])

  // --- Handlers for Modals ---
  const handleCancelRequest = (bookingId: number) => setCancelModal({ open: true, bookingId })
  const handleCancelClose = () => setCancelModal({ open: false, bookingId: null })

  const handlePaymentRequest = (bookingId: number) => setPaymentModal({ open: true, bookingId })
  const handlePaymentClose = () => {
    setPaymentModal({ open: false, bookingId: null })
    setPaymentError(null)
  }

  const handlePaymentFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentData({ ...paymentData, [event.target.name]: event.target.value })
    setPaymentError(null)
  }

  const validatePaymentData = () => {
    if (!paymentData.cardNumber.trim() || !paymentData.expiryDate.trim() || !paymentData.cvv.trim()) {
      setPaymentError('Заполните все поля оплаты.')
      return false
    }

    return true
  }

  const handleEditRequest = (booking: Booking) => {
    setEditModal({ open: true, booking })
    setEditDates({ check_in: booking.check_in, check_out: booking.check_out })
    setEditError(null)
  }
  const handleEditClose = () => {
    setEditModal({ open: false, booking: null })
    setEditError(null)
  }

  // --- API Call Handlers ---
  const handleCancelConfirm = async () => {
    if (!cancelModal.bookingId) return
    try {
      await apiClient.delete(`/bookings/${cancelModal.bookingId}`)
      handleCancelClose()
      notificationService.success('Бронирование отменено')
      await fetchBookings(new AbortController().signal) // Re-fetch after action
    } catch (err) {
      console.error('Ошибка отмены:', err)
      notifyApiError(err, 'Не удалось отменить бронирование')
    }
  }

  const handlePaymentConfirm = async () => {
    if (!paymentModal.bookingId) return
    if (!validatePaymentData()) return

    try {
      await apiClient.post(`/bookings/${paymentModal.bookingId}/confirm`)
      setPaymentData({ cardNumber: '', expiryDate: '', cvv: '' })
      handlePaymentClose()
      notificationService.success('Оплата прошла успешно')
      await fetchBookings(new AbortController().signal) // Re-fetch after action
    } catch (err) {
      console.error('Ошибка оплаты:', err)
      setPaymentError(getErrorMessage(err, 'Не удалось провести оплату'))
    }
  }

  const handleEditConfirm = async () => {
    if (!editModal.booking) return
    setEditError(null)
    try {
      await apiClient.patch(`/bookings/${editModal.booking.id}`, null, {
        params: {
          check_in: editDates.check_in,
          check_out: editDates.check_out,
        },
      })
      handleEditClose()
      notificationService.success('Бронирование изменено')
      await fetchBookings(new AbortController().signal) // Re-fetch after action
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.detail === 'Room not available') {
        setEditError('Выбранные даты недоступны. Пожалуйста, выберите другие.')
      } else {
        console.error('Ошибка изменения:', err)
        setEditError(getErrorMessage(err, 'Не удалось изменить бронирование. Попробуйте позже.'))
      }
    }
  }

  const sortedBookings = useMemo(() => sortBookingsByCheckIn(bookings), [bookings])

  const today = new Date().toISOString().split('T')[0]

  if (loading) return <p>Загрузка...</p>

  return (
    <div className={styles.page}>
      {/* Personal Info Section */}
      <div className={styles.personalInfo}>
        <h2 className={styles.sectionTitle}>Личные данные</h2>
        <div className={styles.infoFields}>
          <div className={styles.field}><label>Email</label><p>{userInfo?.user_login}</p></div>
          <div className={styles.field}><label>Имя</label><p>{userInfo?.user_first_name || 'Не указано'}</p></div>
          <div className={styles.field}><label>Фамилия</label><p>{userInfo?.user_last_name || 'Не указано'}</p></div>
        </div>
      </div>

      {/* Bookings Section */}
      <div className={styles.bookingsSection}>
        <h2 className={styles.sectionTitle}>Мои бронирования</h2>
        {sortedBookings.length === 0 ? (
          <p className={styles.noBookings}>У вас пока нет бронирований.</p>
        ) : (
          <div className={styles.list}>
            {sortedBookings.map(booking => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPaymentRequest={handlePaymentRequest}
                onEditRequest={handleEditRequest}
                onCancelRequest={handleCancelRequest}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {cancelModal.open && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Подтверждение отмены</h3>
            <p>Вы уверены, что хотите отменить бронирование?</p>
            <div className={styles.modalActions}>
              <button onClick={handleCancelClose} className={styles.cancelBtn}>Нет</button>
              <button onClick={handleCancelConfirm} className={styles.confirmBtn}>Да, отменить</button>
            </div>
          </div>
        </div>
      )}

      {paymentModal.open && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.paymentModal}`}>
            <button onClick={handlePaymentClose} className={styles.closeModalButton}>&times;</button>
            <h3>Введите номер карты</h3>
            <div className={styles.paymentForm}>
              <div className={styles.paymentField}>
                <label>Номер карты</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={paymentData.cardNumber}
                  onChange={handlePaymentFieldChange}
                />
              </div>
              <div className={styles.paymentRow}>
                <div className={styles.paymentField}>
                  <label>Дата выдачи</label>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={handlePaymentFieldChange}
                  />
                </div>
                <div className={styles.paymentField}>
                  <label>CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handlePaymentFieldChange}
                  />
                </div>
              </div>
              {paymentError && <p className={styles.editError}>{paymentError}</p>}
              <button className={styles.paymentSubmitButton} onClick={handlePaymentConfirm}>Оплатить</button>
            </div>
          </div>
        </div>
      )}

      {editModal.open && editModal.booking && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Изменить бронирование</h3>
            <div className={styles.editForm}>
              <div className={styles.editField}>
                <label>Дата заезда</label>
                <input 
                  type="date" 
                  value={editDates.check_in} 
                  min={today}
                  onChange={e => setEditDates({...editDates, check_in: e.target.value})} 
                />
              </div>
              <div className={styles.editField}>
                <label>Дата выезда</label>
                <input 
                  type="date" 
                  value={editDates.check_out} 
                  min={editDates.check_in || today}
                  onChange={e => setEditDates({...editDates, check_out: e.target.value})} 
                />
              </div>
            </div>
            {editError && <p className={styles.editError}>{editError}</p>}
            <div className={styles.modalActions}>
              <button onClick={handleEditClose} className={styles.cancelBtn}>Отмена</button>
              <button onClick={handleEditConfirm} className={styles.confirmBtn}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
