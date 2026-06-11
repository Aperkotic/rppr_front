import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAccessToken, setAccessToken, clearAuthStorage } from '../../api/client';

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
  },
}));
vi.mock('./auth', () => ({ refresh: vi.fn() }));
vi.mock('../services/notification/notificationService', () => ({
  notificationService: { error: vi.fn() },
}));
vi.mock('./storage', () => ({
  STORAGE_ACCESS_TOKEN: 'accessToken',
  STORAGE_AUTH_USER: 'authUser',
}));

const localStorageMock = {
  getItem: vi.fn(),       
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Token storage utilities', () => {
  it('setAccessToken saves a token', () => {
    setAccessToken('abc123');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'abc123');
  });

  it('setAccessToken(null) removes the token', () => {
    setAccessToken(null);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
  });

  it('getAccessToken returns the stored token', () => {
    localStorageMock.getItem.mockReturnValueOnce('my-token');
    expect(getAccessToken()).toBe('my-token');
  });

  it('getAccessToken returns null when nothing is stored', () => {
    localStorageMock.getItem.mockReturnValueOnce(null);
    expect(getAccessToken()).toBeNull();
  });

  it('clearAuthStorage removes both accessToken and authUser', () => {
    clearAuthStorage();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('authUser');
  });
});