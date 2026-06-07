import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { apiClient } from '../../api/client'
import styles from './AddRoomForm.module.css'

export const AddRoomForm = () => {
  const { hotelId } = useParams<{ hotelId: string }>()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    hotel_id: hotelId ? Number(hotelId) : 0,
    name: '',
    description: '',
    price_per_night: 1,
    capacity: 1,
    image_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ['hotel_id', 'price_per_night', 'capacity'].includes(name) ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await apiClient.post('/api/admin/rooms', formData)
      navigate('/admin')
    } catch (err: unknown) {
      console.error('Error creating room:', err)
      setError('Не удалось добавить номер')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <Link to="/admin" className={styles.backLink}>Назад к панели</Link>
          <h1 className={styles.title}>Добавление номера</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.group}>
          <label htmlFor="room-hotel">ID отеля</label>
          <input
            id="room-hotel"
            type="number"
            name="hotel_id"
            required
            value={formData.hotel_id}
            onChange={handleChange}
          />
        </div>

        <div className={styles.group}>
          <label htmlFor="room-name">Название номера</label>
          <input
            id="room-name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Стандарт"
          />
        </div>

        <div className={styles.group}>
          <label htmlFor="room-description">Описание</label>
          <textarea
            id="room-description"
            name="description"
            rows={4}
            required
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className={styles.group}>
          <label htmlFor="room-price">Цена за ночь</label>
          <input
            id="room-price"
            type="number"
            name="price_per_night"
            required
            min={0}
            step="0.01"
            value={formData.price_per_night}
            onChange={handleChange}
          />
        </div>

        <div className={styles.group}>
          <label htmlFor="room-capacity">Вместимость</label>
          <input
            id="room-capacity"
            type="number"
            name="capacity"
            required
            value={formData.capacity}
            onChange={handleChange}
          />
        </div>

        <div className={styles.group}>
          <label htmlFor="room-image">URL изображения</label>
          <input
            id="room-image"
            name="image_url"
            type="url"
            required
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://example.com/"
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnSecondary} onClick={() => navigate('/admin')}>
            Отмена
          </button>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Добавление...' : 'Добавить номер'}
          </button>
        </div>
      </form>
    </div>
  )
}
