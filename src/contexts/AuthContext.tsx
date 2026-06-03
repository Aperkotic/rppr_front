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
import { getUserIdFromToken } from '../utils/jwt'

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

export function AuthProvider({ children }: { children: ReactNode }) {
  // ✅ ИСПРАВЛЕНИЕ 2: Lazy initialization вместо useEffect
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = getAccessToken()
    const storedUser = loadUserFromStorage()
    if (token && storedUser) {
      return storedUser
    }
    return null
  })
  
  // ✅ isLoading сразу false, т.к. инициализация синхронная
  const [isLoading] = useState(false)

  const logout = useCallback(() => {
    clearAuthStorage()
    setUser(null)
  }, [])

  // ✅ Оставляем только подписку на событие logout
  useEffect(() => {
    const onLogout = () => {
      setUser(null)
    }
    window.addEventListener('auth:logout', onLogout)
    return () => window.removeEventListener('auth:logout', onLogout)
  }, [])

  const login = useCallback(
    async (loginName: string, password: string) => {
      const { access_token, first_name, last_name } = await authApi.login(loginName, password);
      setAccessToken(access_token);

      const id = getUserIdFromToken(access_token);
      if (id == null) {
        throw new Error('Не удалось прочитать id пользователя из токена');
      }

      const authUser: AuthUser = {
        login: loginName,
        first_name: first_name,
        last_name: last_name,
        is_manager: false,
      };
      
      saveUser(authUser);
      setUser(authUser);
    },
    [],
  )

  const register = useCallback(async (data: UserCreate) => {
    const newUser = await authApi.register(data);
    if (data.password) {
      await login(newUser.login, data.password);
    }
    return newUser;
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