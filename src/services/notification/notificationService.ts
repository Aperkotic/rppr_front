import type { Notification, NotificationType } from './types'

type Listener = (notifications: Notification[]) => void

const DEFAULT_DURATION_MS = 5000

let notifications: Notification[] = []
const listeners = new Set<Listener>()

const emit = () => {
  const snapshot = [...notifications]
  listeners.forEach((listener) => listener(snapshot))
}

export const notificationService = {
  subscribe(listener: Listener) {
    listeners.add(listener)
    listener([...notifications])
    return () => {
      listeners.delete(listener)
    }
  },

  show(type: NotificationType, message: string, duration = DEFAULT_DURATION_MS) {
    const trimmed = message.trim()
    if (!trimmed) return

    const notification: Notification = {
      id: crypto.randomUUID(),
      type,
      message: trimmed,
    }

    notifications = [...notifications, notification]
    emit()

    if (duration > 0) {
      window.setTimeout(() => notificationService.dismiss(notification.id), duration)
    }
  },

  success(message: string) {
    this.show('success', message)
  },

  error(message: string) {
    this.show('error', message)
  },

  info(message: string) {
    this.show('info', message)
  },

  dismiss(id: string) {
    notifications = notifications.filter((notification) => notification.id !== id)
    emit()
  },
}
