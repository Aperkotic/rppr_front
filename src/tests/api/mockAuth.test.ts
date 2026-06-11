import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockLogin, mockRegister } from '../../api/mockAuth'

describe('Mock Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('mockLogin()', () => {
    it('should successfully login with valid credentials', async () => {
      const result = await mockLogin('e.resetto291@gmail.com', 'password123')

      expect(result.access_token).toBeTruthy()
      expect(result.first_name).toBe('Иван')
      expect(result.last_name).toBe('Петров')
      expect(result.is_manager).toBe(false)
    })

    it('should login as admin with valid credentials', async () => {
      const result = await mockLogin('admin@example.com', 'admin123')

      expect(result.access_token).toBeTruthy()
      expect(result.first_name).toBe('Админ')
      expect(result.is_manager).toBe(true)
    })

    it('should throw error with invalid email', async () => {
      await expect(mockLogin('wrong@example.com', 'password123')).rejects.toThrow(
        'Неверный email или пароль',
      )
    })

    it('should throw error with invalid password', async () => {
      await expect(mockLogin('e.resetto291@gmail.com', 'wrongpassword')).rejects.toThrow(
        'Неверный email или пароль',
      )
    })
  })

  describe('mockRegister()', () => {
    it('should successfully register new user', async () => {
      const result = await mockRegister({
        login: 'newuser@example.com',
        password: 'password123',
        first_name: 'John',
        last_name: 'Doe',
      })

      expect(result.id).toBeTruthy()
      expect(result.login).toBe('newuser@example.com')
      expect(result.first_name).toBe('John')
      expect(result.last_name).toBe('Doe')
      expect(result.is_manager).toBe(false)
    })

    it('should throw error when login already exists', async () => {
      await expect(
        mockRegister({
          login: 'e.resetto291@gmail.com',
          password: 'password123',
          first_name: 'Jane',
          last_name: 'Smith',
        }),
      ).rejects.toThrow('Login already exists')
    })

    it('should throw error when admin login already exists', async () => {
      await expect(
        mockRegister({
          login: 'admin@example.com',
          password: 'password123',
          first_name: 'Test',
          last_name: 'User',
        }),
      ).rejects.toThrow('Login already exists')
    })
  })
})
