import { useMemo } from 'react'
import { notificationService } from '../services/notification/notificationService'

export const useNotification = () =>
  useMemo(
    () => ({
      success: notificationService.success.bind(notificationService),
      error: notificationService.error.bind(notificationService),
      info: notificationService.info.bind(notificationService),
    }),
    [],
  )
