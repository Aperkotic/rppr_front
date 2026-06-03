import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import styles from './BookingDetails.module.css';

interface Booking {
  id: number;
  hotel_name: string;
  room_type: string;
  date_from: string;
  date_to: string;
  total_price: number;
  status: string;
}

export const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/bookings/${id}`)
      .then(res => setBooking(res.data))
      .catch(() => navigate('/profile/bookings'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleConfirm = async () => {
    if (!booking || !confirm('Подтвердить бронирование?')) return;
    try {
      await apiClient.post(`/bookings/${booking.id}/confirm`);
      alert('Заказ подтвержден!');
      navigate('/profile/bookings');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка подтверждения';
      alert(message);
    }
  };

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (!booking) return <div className={styles.loading}>Бронирование не найдено</div>;

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Назад</button>

      <div className={styles.card}>
        <h1 className={styles.hotelName}>{booking.hotel_name}</h1>

        <div className={styles.infoRow}>
          <span className={styles.label}>Тип номера:</span>
          <span>{booking.room_type}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Статус:</span>
          <span className={`${styles.badge} ${styles[booking.status]}`}>
            {booking.status === 'confirmed' ? 'Подтверждено' :
             booking.status === 'cancelled' ? 'Отменено' : 'Ожидание'}
          </span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Даты:</span>
          <span>{new Date(booking.date_from).toLocaleDateString()} — {new Date(booking.date_to).toLocaleDateString()}</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.label}>Цена:</span>
          <span className={styles.price}>{booking.total_price} руб</span>
        </div>

        {booking.status === 'pending' && (
          <button className={styles.confirmBtn} onClick={handleConfirm}>
            Подтвердить заказ
          </button>
        )}
      </div>
    </div>
  );
};