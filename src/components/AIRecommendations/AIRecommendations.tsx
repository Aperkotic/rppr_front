import { useEffect, useState } from 'react';
import { apiClient } from '../../api/client';
import HotelCard from '../HotelCard/HotelCard';
import styles from './AIRecommendations.module.css';

interface Hotel {
  id: number;
  name: string;
  location: string;
  description: string;
  image_url: string;
  rooms: { price_per_night: string }[];
}

export const AIRecommendations = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/ai/recommendations');
        
        if (!isMounted) return;

        // Обрабатываем разную структуру ответа
        if (Array.isArray(response.data)) {
          setHotels(response.data);
        } else if (response.data?.hotels && Array.isArray(response.data.hotels)) {
          setHotels(response.data.hotels);
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          setHotels(response.data.data);
        } else {
          console.warn('AI Recommendations: неожиданный формат данных', response.data);
          setHotels([]);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : 'Ошибка загрузки рекомендаций';
        console.log('AI Recommendations:', message);
        setHotels([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecommendations();

    return () => {
      isMounted = false;
    };
  }, []);

  // Если нет данных — не рендерим ничего
  if (loading || hotels.length === 0) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>Рекомендации на основе ваших предпочтений</h2>
      <div className={styles.carousel}>
        {hotels.slice(0, 6).map(hotel => (
          <div key={hotel.id} className={styles.cardWrapper}>
            <HotelCard hotel={hotel} />
          </div>
        ))}
      </div>
    </div>
  );
};