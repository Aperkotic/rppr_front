import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './HotelDetailPage.module.css'
import { HorizontalScrollRow } from './HorizontalScrollRow'
import type { RecommendedRoom } from './types'

const placeholderImage = 'https://source.unsplash.com/400x300/?hotel'

const RecImageBackground = ({ src, alt }: { src: string; alt: string }) => {
  const [imgSrc, setImgSrc] = useState(src)

  useEffect(() => {
    setImgSrc(src)
    const image = new Image()
    image.onload = () => setImgSrc(src)
    image.onerror = () => setImgSrc(placeholderImage)
    image.src = src
  }, [src])

  return (
    <div
      className={styles.recImage}
      style={{ backgroundImage: `url(${imgSrc})` }}
      role="img"
      aria-label={alt}
    />
  )
}

interface RecommendedRoomsProps {
  recommendations: RecommendedRoom[]
}

export const RecommendedRooms = ({ recommendations }: RecommendedRoomsProps) => {
  const navigate = useNavigate()

  return (
    <div className={styles.recommendations}>
      <h3 className={styles.recommendationsTitle}>Рекомендации на основе ваших предпочтений</h3>
      <HorizontalScrollRow
        scrollStep={232}
        trackClassName={`${styles.horizontalScroller} ${styles.horizontalScrollerWide}`}
        ariaLabelLeft="Прокрутить рекомендации влево"
        ariaLabelRight="Прокрутить рекомендации вправо"
      >
        {recommendations.map((rec) => (
          <div key={rec.id} className={styles.recCard}>
            <RecImageBackground src={rec.image_url} alt={rec.name} />
            <div className={styles.recContent}>
              <h4 className={styles.recTitle}>{rec.name}</h4>
              <p className={styles.recPrice}>Цена: {rec.price_per_night} руб.</p>
            </div>
            <button className={styles.recFooter} onClick={() => navigate(`/hotel/${rec.hotel_id}`)}>
              Выбрать
            </button>
          </div>
        ))}
      </HorizontalScrollRow>
    </div>
  )
}
