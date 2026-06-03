import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import styles from './BookingHistory.module.css';

interface MyBooking {
  id: number;
  hotel_name: string;
  room_type: string;
  date_from: string;
  date_to: string;
  status: string;
  total_price: number;
}

export const BookingHistory = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<MyBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/bookings/my')
      .then(res => {
        if (Array.isArray(res.data)) {
          setBookings(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: number) => {
    if (!confirm('Отменить бронирование?')) return;
    try {
      await apiClient.post(`/bookings/${id}/cancel`);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка отмены';
      alert(message);
    }
  };

  return (
    <div className={styles.page}>
      {/* Личные данные */}
      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Личные данные</h2>
        <div className={styles.userData}>
          <p><strong>Имя:</strong> {user?.first_name || '—'}</p>
          <p><strong>Фамилия:</strong> {user?.last_name || '—'}</p>
          <p><strong>Email:</strong> {user?.login || '—'}</p>
        </div>
      </div>

      {/* Мои бронирования */}
      <div className={styles.block}>
        <h2 className={styles.blockTitle}>Мои бронирования</h2>

        {loading && <p className={styles.loading}>Загрузка...</p>}

        {!loading && bookings.length === 0 && (
          <p className={styles.empty}>У вас пока нет бронирований.</p>
        )}

        {!loading && bookings.length > 0 && (
          <div className={styles.list}>
            {bookings.map(b => (
              <div key={b.id} className={styles.bookingCard}>
                <div className={styles.bookingInfo}>
                  <div className={styles.hotelName}>{b.hotel_name}</div>
                  <div>{b.room_type}</div>
                  <div>
                    {new Date(b.date_from).toLocaleDateString()} — {new Date(b.date_to).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.bookingPrice}>{b.total_price} руб</div>
                <button
                  className={styles.cancelBtn}
                  onClick={() => handleCancel(b.id)}
                  disabled={b.status !== 'pending'}
                >
                  Отменить бронирование
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Link to="/" className={styles.homeLink}>← Вернуться к отелям</Link>
    </div>
  );
};