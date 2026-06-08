import React from 'react'
import styles from './HotelCard.module.css'
import { useNavigate } from 'react-router-dom'

interface Room {
  id?: number
  name?: string
  price_per_night: string
}

interface Hotel {
  id: number
  name: string
  location: string
  description: string
  image_url: string
  rooms?: Room[]
}

interface HotelCardProps {
  hotel: Hotel
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel }) => {
  const navigate = useNavigate()

  // ✅ Используем комнаты, что пришли из API
  const allRooms = hotel.rooms || []

  const minPrice = allRooms.length > 0
    ? Math.min(...allRooms.map(room => parseFloat(room.price_per_night)))
    : Infinity

  const firstRoomName = allRooms[0]?.name || ''

  const placeholderImageUrl = `https://source.unsplash.com/400x300/?hotel,room&random=${hotel.id}`

  const handleSelectHotel = () => {
    navigate(`/hotel/${hotel.id}`)
  }

  return (
    <div className={styles.card} onClick={handleSelectHotel}>
      <img
        src={hotel.image_url}
        alt={hotel.name}
        className={styles.image}
        onError={(e) => {
          const target = e.target as HTMLImageElement
          target.onerror = null
          target.src = placeholderImageUrl
        }}
      />
      <div className={styles.content}>
        <h3 className={styles.title}>{hotel.name}</h3>

        {firstRoomName && (
          <p className={styles.room}>
            <strong>Комната:</strong> {firstRoomName}
          </p>
        )}

        {minPrice !== Infinity && (
          <p className={styles.price}>
            Цена от: {Math.round(minPrice)} руб.
          </p>
        )}

        <p className={styles.description}>{hotel.location}</p>

        <button className={styles.footer}>
          Выбрать
        </button>
      </div>
    </div>
  )
}

export default HotelCard