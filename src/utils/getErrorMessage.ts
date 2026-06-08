import { AxiosError } from 'axios'

const isCanceledError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.code === 'ERR_CANCELED' || error.name === 'CanceledError'
  }

  return error instanceof DOMException && error.name === 'AbortError'
}

export const getErrorMessage = (error: unknown, fallback = 'Произошла ошибка'): string => {
  if (isCanceledError(error)) {
    return ''
  }

  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail

    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (typeof item === 'string') return item
          if (item && typeof item === 'object' && 'msg' in item && typeof item.msg === 'string') {
            return item.msg
          }
          return null
        })
        .filter(Boolean)

      if (messages.length > 0) {
        return messages.join(', ')
      }
    }

    if (!error.response) {
      return 'Нет соединения с сервером'
    }

    return fallback
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}
