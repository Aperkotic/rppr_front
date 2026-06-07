import { useEffect, useState } from 'react'
import { apiClient } from '../../api/client'
import styles from './BookingHistory.module.css'
import { AxiosError } from 'axios'

interface UserInfo {
  user_first_name: string
  user_last_name: string
  user_login: string
}

interface Booking {
  id: number
  room_id: number
  hotel_id: number
  check_in: string
  check_out: string
  total_price: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  // Merged data
  hotel_name?: string
  room_name?: string
  hotel_image_url?: string
}

interface RoomDetails {
  id: number
  name: string
  hotel_name: string
  hotel_image_url: string
}

const statusLabels: Record<string, string> = {
  pending: 'Ожидает оплаты',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
  completed: 'Завершено',
}

const statusColors: Record<string, string> = {
  pending: '#FFA500',
  confirmed: '#4CAF50',
  cancelled: '#F44336',
  completed: '#2196F3',
}

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
      await fetchBookings(new AbortController().signal) // Re-fetch after action
    } catch (err) {
      console.error('Ошибка отмены:', err)
      alert('Не удалось отменить бронирование.')
    }
  }

  const handlePaymentConfirm = async () => {
    if (!paymentModal.bookingId) return
    if (!validatePaymentData()) return

    try {
      await apiClient.post(`/bookings/${paymentModal.bookingId}/confirm`)
      setPaymentData({ cardNumber: '', expiryDate: '', cvv: '' })
      handlePaymentClose()
      await fetchBookings(new AbortController().signal) // Re-fetch after action
    } catch (err) {
      console.error('Ошибка оплаты:', err)
      alert('Не удалось провести оплату.')
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
      await fetchBookings(new AbortController().signal) // Re-fetch after action
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.detail === 'Room not available') {
        setEditError('Выбранные даты недоступны. Пожалуйста, выберите другие.')
      } else {
        console.error('Ошибка изменения:', err)
        setEditError('Не удалось изменить бронирование. Попробуйте позже.')
      }
    }
  }

  // --- Helper Functions ---
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('ru-RU')
  }
  
  const today = new Date().toISOString().split('T')[0];

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
        {bookings.length === 0 ? (
          <p className={styles.noBookings}>У вас пока нет бронирований.</p>
        ) : (
          <div className={styles.list}>
            {bookings.map(booking => (
              <div key={booking.id} className={styles.card}>
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
                    <p><strong>Комната:</strong> {booking.room_name}</p>
                    <p><strong>Заезд:</strong> {formatDate(booking.check_in)}</p>
                    <p><strong>Выезд:</strong> {formatDate(booking.check_out)}</p>
                    <p><strong>Стоимость:</strong> {parseFloat(booking.total_price).toFixed(2)} руб.</p>
                  </div>
                  <div className={styles.actions}>
                    {booking.status === 'pending' && (
                      <button className={styles.payButton} onClick={() => handlePaymentRequest(booking.id)}>Оплатить</button>
                    )}
                    {(booking.status === 'pending' || booking.status === 'confirmed') && (
                      <>
                        <button className={styles.editButton} onClick={() => handleEditRequest(booking)}>Изменить</button>
                        <button className={styles.cancelButton} onClick={() => handleCancelRequest(booking.id)}>Отменить</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
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
