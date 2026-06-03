import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiClient } from '../../api/client';
import styles from './AddRoomForm.module.css';

export const AddRoomForm = () => {
  const { hotelId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hotel_id: hotelId || '',
    room_type: 'standard',
    price_per_night: 0,
    capacity: 2,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price_per_night' || name === 'capacity' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/admin/rooms', formData);
      alert('Номер добавлен!');
      navigate('/admin/bookings');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка при добавлении';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Добавить номер</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.group}>
          <label>Тип номера</label>
          <select name="room_type" value={formData.room_type} onChange={handleChange}>
            <option value="standard">Стандарт</option>
            <option value="comfort">Комфорт</option>
            <option value="deluxe">Люкс</option>
            <option value="suite">Сьют</option>
          </select>
        </div>

        <div className={styles.group}>
          <label>Цена за ночь (руб)</label>
          <input type="number" name="price_per_night" value={formData.price_per_night} onChange={handleChange} min={0} />
        </div>

        <div className={styles.group}>
          <label>Вместимость (чел.)</label>
          <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} min={1} max={10} />
        </div>

        <div className={styles.group}>
          <label>Описание</label>
          <textarea name="description" rows={3} value={formData.description} onChange={handleChange} />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnSecondary} onClick={() => navigate(-1)}>Отмена</button>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Добавление...' : 'Добавить номер'}
          </button>
        </div>
      </form>
    </div>
  );
};