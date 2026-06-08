import { useEffect, useState, type ReactNode } from 'react'
import { notificationService } from '../../services/notification/notificationService'
import type { Notification } from '../../services/notification/types'
import styles from './NotificationContainer.module.css'

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => notificationService.subscribe(setNotifications), [])

  return (
    <>
      {children}
      <div className={styles.container} aria-live="polite" aria-relevant="additions">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`${styles.notification} ${styles[notification.type]}`}
            role="alert"
          >
            <p className={styles.message}>{notification.message}</p>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="Закрыть уведомление"
              onClick={() => notificationService.dismiss(notification.id)}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
