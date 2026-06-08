import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiClient } from '../../api/client'
import styles from './AddHotelForm.module.css'

interface CreatedHotel {
  id: number
  name: string
  location: string
  description: string
  image_url: string
  rooms: unknown[]
}

export const AddHotelForm = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    image_url: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.post<CreatedHotel>('/api/admin/hotels', formData)
      navigate(`/admin/add-room/${response.data.id}`)
    } catch (err: unknown) {
      console.error('Error creating hotel:', err)
      setError('Не удалось добавить отель')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div>
          <Link to="/admin" className={styles.backLink}>Назад к панели</Link>
          <h1 className={styles.title}>Добавление нового отеля</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.group}>
          <label htmlFor="hotel-name">Название отеля</label>
          <input
            id="hotel-name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
          />
        </div>

        <div className={styles.group}>
          <label htmlFor="hotel-location">Локация</label>
          <input
            id="hotel-location"
            name="location"
            required
            value={formData.location}
            onChange={handleChange}
          />
        </div>

        <div className={styles.group}>
          <label htmlFor="hotel-description">Описание</label>
          <textarea
            id="hotel-description"
            name="description"
            rows={4}
            required
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className={styles.group}>
          <label htmlFor="hotel-image">URL изображения</label>
          <input
            id="hotel-image"
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
            {loading ? 'Добавление...' : 'Добавить отель'}
          </button>
        </div>
      </form>
    </div>
  )
}
