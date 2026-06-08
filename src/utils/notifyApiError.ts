import { notificationService } from '../services/notification/notificationService'
import { getErrorMessage } from './getErrorMessage'

export const notifyApiError = (error: unknown, fallback = 'Произошла ошибка'): string => {
  const message = getErrorMessage(error, fallback)

  if (message) {
    notificationService.error(message)
  }

  return message
}
