import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient } from '../../api/client'
import styles from './HotelDetailPage.module.css'
import { useAuth } from '../../hooks/useAuth'
import { AxiosError } from 'axios'
import { notificationService } from '../../services/notification/notificationService'
import { getErrorMessage } from '../../utils/getErrorMessage'
import { notifyApiError } from '../../utils/notifyApiError'
import { ImageWithFallback } from './ImageWithFallback'
import { RoomList } from './RoomList'
import { RecommendedRooms } from './RecommendedRooms'
import { PaymentModal } from './PaymentModal'
import { isPaymentFormComplete } from './paymentMasks'
import type { Room, RecommendedRoom } from './types'

interface CreatedBooking {
  id?: number
  booking_id?: number
}

export const HotelDetailPage = () => {
  const { hotelId } = useParams<{ hotelId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [rooms, setRooms] = useState<Room[]>([])
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendedRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentModal, setPaymentModal] = useState(false)
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [bookingDates, setBookingDates] = useState({ check_in: '', check_out: '' })
  const [paymentData, setPaymentData] = useState({ cardNumber: '', expiryDate: '', cvv: '' })
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const fetchData = async () => {
      if (!hotelId) return

      setLoading(true)
      try {
        const roomsResponse = await apiClient.get(`/hotels/${hotelId}/rooms`)
        setRooms(roomsResponse.data)

        if (roomsResponse.data.length > 0) {
          const initialRoom = roomsResponse.data[0]
          setSelectedRoom(initialRoom)
          const recommendationsResponse = await apiClient.get(`/room/${initialRoom.id}/recommendations?limit=10`)
          setRecommendations(recommendationsResponse.data)
        }
      } catch (error) {
        console.error('Error fetching hotel data:', error)
        notifyApiError(error, 'Не удалось загрузить данные отеля')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [hotelId])

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBookingDates({ ...bookingDates, [event.target.name]: event.target.value })
    setBookingError(null)
  }

  const handlePaymentFieldChange = (field: keyof typeof paymentData, value: string) => {
    setPaymentData({ ...paymentData, [field]: value })
    setPaymentError(null)
  }

  const validatePaymentData = () => {
    if (!isPaymentFormComplete(paymentData)) {
      setPaymentError('Заполните все поля оплаты корректно.')
      return false
    }

    return true
  }

  const handleBooking = async () => {
    if (!selectedRoom || !bookingDates.check_in || !bookingDates.check_out || !isAuthenticated) {
      return
    }

    setBookingError(null)
    setPaymentError(null)

    try {
      const response = await apiClient.post<CreatedBooking>('/bookings/', null, {
        params: {
          room_id: selectedRoom.id,
          check_in: bookingDates.check_in,
          check_out: bookingDates.check_out,
        },
      })

      const createdBookingId = response.data.id ?? response.data.booking_id
      if (!createdBookingId) {
        throw new Error('Booking id is missing in create booking response')
      }

      setPendingBookingId(createdBookingId)
      setPaymentModal(true)
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.detail === 'Room not available') {
        setBookingError('Комната уже забронирована на эти даты.')
      } else {
        console.error('Error creating booking:', error)
        setBookingError(getErrorMessage(error, 'Не удалось создать бронирование.'))
      }
    }
  }

  const handlePaymentConfirm = async () => {
    if (!validatePaymentData()) {
      return
    }

    if (!pendingBookingId) {
      setPaymentError('Бронирование не найдено.')
      return
    }

    setPaymentLoading(true)
    setPaymentError(null)

    try {
      await apiClient.post(`/bookings/${pendingBookingId}/confirm`)
      setPaymentModal(false)
      setPendingBookingId(null)
      setPaymentData({ cardNumber: '', expiryDate: '', cvv: '' })
      notificationService.success('Бронирование успешно подтверждено')
      navigate('/profile/bookings')
    } catch (error) {
      console.error('Error confirming booking:', error)
      setPaymentError(getErrorMessage(error, 'Не удалось подтвердить бронирование.'))
    } finally {
      setPaymentLoading(false)
    }
  }

  const closePaymentModal = () => {
    if (paymentLoading) return
    setPaymentModal(false)
    setPaymentError(null)
  }

  const isBookingDisabled = !bookingDates.check_in || !bookingDates.check_out || !isAuthenticated || !!bookingError
  let disabledMessage = ''

  if (!isAuthenticated) {
    disabledMessage = 'Пожалуйста, войдите в систему, чтобы забронировать.'
  } else if (!bookingDates.check_in || !bookingDates.check_out) {
    disabledMessage = 'Пожалуйста, выберите даты заезда и выезда.'
  } else if (bookingError) {
    disabledMessage = bookingError
  }

  if (loading) {
    return <p>Загрузка...</p>
  }

  if (!selectedRoom) {
    return <p>Нет доступных номеров для этого отеля.</p>
  }

  return (
    <div className={styles.page}>
      <button onClick={() => navigate('/')} className={styles.backButton}>
        &larr; К списку отелей
      </button>

      <h1 className={styles.hotelTitle}>{selectedRoom.hotel_name}</h1>
      <p className={styles.hotelLocation}>{selectedRoom.hotel_description}</p>

      <RoomList rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={setSelectedRoom} />

      <div className={styles.mainContent}>
        <div className={styles.gallery}>
          <ImageWithFallback src={selectedRoom.image_url} alt={selectedRoom.name} className={styles.mainImage} />
        </div>

        <div className={styles.roomDetails}>
          <h2 className={styles.roomTitle}>{selectedRoom.name}</h2>
          <p className={styles.roomDescription}>{selectedRoom.description}</p>
          <p className={styles.capacity}>
            <strong>Количество гостей:</strong> {selectedRoom.capacity}
          </p>
          <p className={styles.price}>
            <strong>Цена:</strong> {selectedRoom.price_per_night} руб./ночь
          </p>

          <div className={styles.datePickers}>
            <label className={styles.datePickerField}>
              <span className={styles.datePickerLabel}>Дата заезда:</span>
              <input
                type="date"
                name="check_in"
                min={today}
                value={bookingDates.check_in}
                onChange={handleDateChange}
                className={styles.datePickerInput}
              />
            </label>
            <label className={styles.datePickerField}>
              <span className={styles.datePickerLabel}>Дата выезда:</span>
              <input
                type="date"
                name="check_out"
                min={bookingDates.check_in || today}
                value={bookingDates.check_out}
                onChange={handleDateChange}
                className={styles.datePickerInput}
              />
            </label>
          </div>

          <button className={styles.bookButton} onClick={handleBooking} disabled={isBookingDisabled}>
            Забронировать
          </button>
          {disabledMessage && <p className={styles.disabledMessage}>{disabledMessage}</p>}
        </div>
      </div>

      <RecommendedRooms recommendations={recommendations} />

      {paymentModal && (
        <PaymentModal
          paymentData={paymentData}
          paymentError={paymentError}
          paymentLoading={paymentLoading}
          onClose={closePaymentModal}
          onFieldChange={handlePaymentFieldChange}
          onConfirm={handlePaymentConfirm}
        />
      )}
    </div>
  )
}
