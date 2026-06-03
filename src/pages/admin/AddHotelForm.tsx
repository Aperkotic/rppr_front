import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import styles from './AddHotelForm.module.css';

export const AddHotelForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiClient.post('/admin/hotels', formData);
      alert('Отель добавлен!');
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
      <h1 className={styles.title}>Добавить новый отель</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.group}>
          <label>Название отеля</label>
          <input name="name" required value={formData.name} onChange={handleChange} />
        </div>

        <div className={styles.group}>
          <label>Локация</label>
          <input name="location" required value={formData.location} onChange={handleChange} />
        </div>

        <div className={styles.group}>
          <label>Описание</label>
          <textarea name="description" rows={4} value={formData.description} onChange={handleChange} />
        </div>

        <div className={styles.group}>
          <label>URL картинки</label>
          <input name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..." />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.btnSecondary} onClick={() => navigate(-1)}>
            Отмена
          </button>
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
};