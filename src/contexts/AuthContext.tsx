/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import * as authApi from '../api/auth'
import { clearAuthStorage, setAccessToken, getAccessToken } from '../api/client'
import { STORAGE_AUTH_USER } from '../api/storage'
import type { AuthUser, User, UserCreate } from '../types/auth'
import {
  getIsManagerFromToken,
  getJwtPayload,
  getTokenExpiresAt,
  getUserIdFromToken,
} from '../utils/jwt'

export interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (login: string, password: string) => Promise<void>
  register: (data: UserCreate) => Promise<User>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function loadUserFromStorage(): AuthUser | null {
  const raw = localStorage.getItem(STORAGE_AUTH_USER)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function saveUser(user: AuthUser | null): void {
  if (user) {
    localStorage.setItem(STORAGE_AUTH_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_AUTH_USER)
  }
}

function createAuthUserFromToken(token: string, fallbackLogin: string): AuthUser {
  const payload = getJwtPayload(token)

  return {
    login: typeof payload?.login === 'string' ? payload.login : fallbackLogin,
    first_name: typeof payload?.first_name === 'string' ? payload.first_name : '',
    last_name: typeof payload?.last_name === 'string' ? payload.last_name : '',
    is_manager: getIsManagerFromToken(token),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = getAccessToken()
    const storedUser = loadUserFromStorage()
    if (token && storedUser) {
      return {
        ...storedUser,
        is_manager: getIsManagerFromToken(token),
      }
    }
    return null
  })

  const [isLoading] = useState(false)

  const logout = useCallback(() => {
    clearAuthStorage()
    setUser(null)
  }, [])

  useEffect(() => {
    const onLogout = () => {
      setUser(null)
    }
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  const applyAuthResponse = useCallback((response: authApi.LoginResponse, fallbackLogin: string) => {
    setAccessToken(response.access_token)

    const id = getUserIdFromToken(response.access_token)
    if (id == null) {
      throw new Error('Не удалось прочитать id пользователя из токена')
    }

    const tokenUser = createAuthUserFromToken(response.access_token, fallbackLogin)
    const authUser: AuthUser = {
      ...tokenUser,
      first_name: response.first_name ?? tokenUser.first_name,
      last_name: response.last_name ?? tokenUser.last_name,
    }

    saveUser(authUser)
    setUser(authUser)
  }, [])

  const login = useCallback(
    async (loginName: string, password: string) => {
      const response = await authApi.login(loginName, password)
      applyAuthResponse(response, loginName)
    },
    [applyAuthResponse],
  )

  const register = useCallback(
    async (data: UserCreate) => {
      const newUser = await authApi.register(data)
      if (data.password) {
        await login(newUser.login, data.password)
      }
      return newUser
    },
    [login],
  )

  useEffect(() => {
    if (!user) return

    let timer: ReturnType<typeof setTimeout>

    const scheduleRefresh = () => {
      const token = getAccessToken()
      if (!token) return

      const exp = getTokenExpiresAt(token)
      if (!exp) return

      const refreshInMs = exp * 1000 - Date.now() - 2 * 60 * 1000
      const delay = Math.max(refreshInMs, 0)

      timer = setTimeout(async () => {
        try {
          const response = await authApi.refresh()
          setAccessToken(response.access_token)

          setUser((current) => {
            if (!current) return current
            const updated: AuthUser = {
              ...current,
              is_manager: getIsManagerFromToken(response.access_token),
              first_name: response.first_name ?? current.first_name,
              last_name: response.last_name ?? current.last_name,
            }
            saveUser(updated)
            return updated
          })

          scheduleRefresh()
        } catch {
          // При следующем API-запросе сработает interceptor
        }
      }, delay)
    }

    scheduleRefresh()
    return () => clearTimeout(timer)
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user && getAccessToken()),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
