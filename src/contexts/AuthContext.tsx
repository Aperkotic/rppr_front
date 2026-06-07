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
import { getIsManagerFromToken, getJwtPayload, getUserIdFromToken } from '../utils/jwt'
import { mockLogin, mockRegister } from '../api/mockAuth'

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

  const login = useCallback(
    async (loginName: string, password: string) => {
      try {
        const response = await authApi.login(loginName, password)
        setAccessToken(response.access_token)

        const id = getUserIdFromToken(response.access_token)
        if (id == null) {
          throw new Error('Не удалось прочитать id пользователя из токена')
        }

        const tokenUser = createAuthUserFromToken(response.access_token, loginName)
        const authUser: AuthUser = {
          ...tokenUser,
          first_name: response.first_name ?? tokenUser.first_name,
          last_name: response.last_name ?? tokenUser.last_name,
        }

        saveUser(authUser)
        setUser(authUser)
      } catch (err: unknown) {
        console.warn('Ошибка бэкенда, используем mock-авторизацию:', err)

        const mockResult = await mockLogin(loginName, password)
        setAccessToken(mockResult.access_token)

        const tokenUser = createAuthUserFromToken(mockResult.access_token, loginName)
        const authUser: AuthUser = {
          ...tokenUser,
          first_name: mockResult.first_name ?? tokenUser.first_name,
          last_name: mockResult.last_name ?? tokenUser.last_name,
        }

        saveUser(authUser)
        setUser(authUser)
      }
    },
    [],
  )

  const register = useCallback(async (data: UserCreate) => {
    try {
      const newUser = await authApi.register(data)
      if (data.password) {
        await login(newUser.login, data.password)
      }
      return newUser
    } catch (err: unknown) {
      console.warn('Ошибка бэкенда, используем mock-регистрацию:', err)

      const mockResult = await mockRegister({
        login: data.login,
        password: data.password || '',
        first_name: data.first_name ?? '',
        last_name: data.last_name ?? '',
      })

      if (data.password) {
        await login(mockResult.login, data.password)
      }
      return mockResult as User
    }
  }, [login])

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
