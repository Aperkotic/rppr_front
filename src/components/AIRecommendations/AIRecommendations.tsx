import React, { useState, useEffect } from 'react';
import styles from './AIRecommendations.module.css';

interface Hotel {
  id: number;
  name: string;
  location: string;
  description: string;
  image_url: string;
  rooms: { price_per_night: string }[];
}

interface AIRecommendationsProps {
  hotels: Hotel[];
  userPreferences?: {
    budget?: number;
    location?: string;
  };
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ hotels, userPreferences }) => {
  const [recommendations, setRecommendations] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Имитация AI-рекомендаций
    const generateRecommendations = () => {
      setLoading(true);
      
      // Сортируем отели по релевантности (простая логика)
      let sorted = [...hotels];
      
      if (userPreferences?.budget) {
        sorted = sorted.filter(hotel => {
          const minPrice = Math.min(...hotel.rooms.map(r => parseFloat(r.price_per_night)));
          return minPrice <= userPreferences.budget!;
        });
      }
      
      // Берем топ-3 рекомендации
      setRecommendations(sorted.slice(0, 3));
      setLoading(false);
    };

    generateRecommendations();
  }, [hotels, userPreferences]);

  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>🤖 AI Рекомендации</h3>
        <p className={styles.loading}>Анализируем отели для вас...</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>🤖 Подобрано для вас</h3>
      <div className={styles.recommendations}>
        {recommendations.map(hotel => {
          const minPrice = Math.min(...hotel.rooms.map(r => parseFloat(r.price_per_night)));
          return (
            <div key={hotel.id} className={styles.recommendation}>
              <img 
                src={hotel.image_url} 
                alt={hotel.name}
                className={styles.image}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/150x100?text=${encodeURIComponent(hotel.name)}`;
                }}
              />
              <div className={styles.info}>
                <h4 className={styles.name}>{hotel.name}</h4>
                <p className={styles.location}>{hotel.location}</p>
                <p className={styles.price}>от {Math.round(minPrice)} ₽/ночь</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIRecommendations;