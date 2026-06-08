import styles from './HotelDetailPage.module.css'
import { HorizontalScrollRow } from './HorizontalScrollRow'
import { ImageWithFallback } from './ImageWithFallback'
import type { Room } from './types'

interface RoomListProps {
  rooms: Room[]
  selectedRoom: Room | null
  onSelectRoom: (room: Room) => void
}

export const RoomList = ({ rooms, selectedRoom, onSelectRoom }: RoomListProps) => (
  <HorizontalScrollRow
    scrollStep={220}
    ariaLabelLeft="Прокрутить номера влево"
    ariaLabelRight="Прокрутить номера вправо"
  >
    {rooms.map((room) => (
      <div
        key={room.id}
        className={`${styles.roomCard} ${selectedRoom?.id === room.id ? styles.selected : ''}`}
        onClick={() => onSelectRoom(room)}
      >
        <ImageWithFallback src={room.image_url} alt={room.name} className={styles.roomImage} />
        <div className={styles.roomInfo}>
          <h4>{room.name}</h4>
          <p>{room.price_per_night} руб.</p>
        </div>
      </div>
    ))}
  </HorizontalScrollRow>
)
