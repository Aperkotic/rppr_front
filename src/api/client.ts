import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { refresh } from './auth'
import { STORAGE_ACCESS_TOKEN, STORAGE_AUTH_USER } from './storage'

export const apiClient = axios.create({
  baseURL: '',
  withCredentials: true,
})

let refreshPromise: Promise<string> | null = null

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_ACCESS_TOKEN)
}

export function setAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem(STORAGE_ACCESS_TOKEN, token)
  } else {
    localStorage.removeItem(STORAGE_ACCESS_TOKEN)
  }
}

export function clearAuthStorage(): void {
  localStorage.removeItem(STORAGE_ACCESS_TOKEN)
  localStorage.removeItem(STORAGE_AUTH_USER)
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/register') ||
      original.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error)
    }

    original._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = refresh().then((data) => {
          setAccessToken(data.access_token)
          return data.access_token
        })
      }
      const newToken = await refreshPromise
      refreshPromise = null
      original.headers.Authorization = `Bearer ${newToken}`
      return apiClient(original)
    } catch {
      refreshPromise = null
      clearAuthStorage()
      window.dispatchEvent(new CustomEvent('auth:logout'))
      return Promise.reject(error)
    }
  },
)