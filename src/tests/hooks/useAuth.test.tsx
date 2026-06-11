import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { AuthContext, AuthContextValue } from '../../contexts/AuthContext';
import { useAuth } from '../../hooks/useAuth';

const sampleValue: AuthContextValue = {
  isAuthenticated: true,
  user: null,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  isLoading: false,
};

describe('useAuth', () => {
  it('returns the context value when inside a provider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={sampleValue}>{children}</AuthContext.Provider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current).toEqual(sampleValue);
  });

  it('throws an error when used outside of AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within AuthProvider');
  });
});