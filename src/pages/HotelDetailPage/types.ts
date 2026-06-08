export interface Room {
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

export interface RecommendedRoom {
  hotel_id: number
  id: number
  name: string
  price_per_night: number
  image_url: string
}

export interface PaymentFormData {
  cardNumber: string
  expiryDate: string
  cvv: string
}
