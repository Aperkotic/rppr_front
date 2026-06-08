import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiClient } from '../../api/client'
import styles from './HotelDetailPage.module.css'
import { useAuth } from '../../hooks/useAuth'
import { AxiosError } from 'axios'

interface Room {
  id: number
  name: string
  description: string
  price_per_night: string
  capacity: number
  image_url: string
  hotel_name: string
  hotel_description: string
  hotel_image_url: string
}

interface RecommendedRoom {
  hotel_id: number
  id: number
  name: string
  price_per_night: number
  image_url: string
}

interface CreatedBooking {
  id?: number
  booking_id?: number
}

const placeholderImage = 'https://source.unsplash.com/400x300/?hotel'

const ImageWithFallback = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [imgSrc, setImgSrc] = useState(src)
  const handleError = () => setImgSrc(placeholderImage)
  return <img src={imgSrc} alt={alt} className={className} onError={handleError} />
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
        setBookingError('Не удалось создать бронирование.')
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
      navigate('/profile/bookings')
    } catch (error) {
      console.error('Error confirming booking:', error)
      setPaymentError('Не удалось подтвердить бронирование.')
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

      <div className={styles.roomScroller}>
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`${styles.roomCard} ${selectedRoom?.id === room.id ? styles.selected : ''}`}
            onClick={() => setSelectedRoom(room)}
          >
            <ImageWithFallback src={room.image_url} alt={room.name} className={styles.roomImage} />
            <div className={styles.roomInfo}>
              <h4>{room.name}</h4>
              <p>{room.price_per_night} руб.</p>
            </div>
          </div>
        ))}
      </div>

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
            <input type="date" name="check_in" min={today} value={bookingDates.check_in} onChange={handleDateChange} />
            <input
              type="date"
              name="check_out"
              min={bookingDates.check_in || today}
              value={bookingDates.check_out}
              onChange={handleDateChange}
            />
          </div>

          <button className={styles.bookButton} onClick={handleBooking} disabled={isBookingDisabled}>
            Забронировать
          </button>
          {disabledMessage && <p className={styles.disabledMessage}>{disabledMessage}</p>}
        </div>
      </div>

      <div className={styles.recommendations}>
        <h3 className={styles.recommendationsTitle}>Рекомендации на основе ваших предпочтений</h3>
        <div className={styles.recommendationsGrid}>
          {recommendations.map((rec) => (
            <div key={rec.id} className={styles.recCard}>
              <ImageWithFallback src={rec.image_url} alt={rec.name} className={styles.recImage} />
              <div className={styles.recContent}>
                <h4 className={styles.recTitle}>{rec.name}</h4>
                <p className={styles.recPrice}>Цена: {rec.price_per_night} руб.</p>
              </div>
              <button className={styles.recFooter} onClick={() => navigate(`/hotel/${rec.hotel_id}`)}>
                Выбрать
              </button>
            </div>
          ))}
        </div>
      </div>

      {paymentModal && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.paymentModal}`}>
            <button onClick={closePaymentModal} className={styles.closeModalButton} disabled={paymentLoading}>
              &times;
            </button>
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
              {paymentError && <p className={styles.disabledMessage}>{paymentError}</p>}
              <button className={styles.paymentSubmitButton} onClick={handlePaymentConfirm} disabled={paymentLoading}>
                {paymentLoading ? 'Подтверждение...' : 'Оплатить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
