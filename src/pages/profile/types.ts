export interface UserInfo {
  user_first_name: string
  user_last_name: string
  user_login: string
}

export interface Booking {
  id: number
  room_id: number
  hotel_id: number
  check_in: string
  check_out: string
  total_price: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  hotel_name?: string
  room_name?: string
  hotel_image_url?: string
}

export interface RoomDetails {
  id: number
  name: string
  hotel_name: string
  hotel_image_url: string
}

export const statusLabels: Record<Booking['status'], string> = {
  pending: 'Ожидает оплаты',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
  completed: 'Завершено',
}

export const statusColors: Record<Booking['status'], string> = {
  pending: '#FFA500',
  confirmed: '#4CAF50',
  cancelled: '#F44336',
  completed: '#2196F3',
}
