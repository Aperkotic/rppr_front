import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { notificationService } from '../../services/notification/notificationService';
import { useNotification } from '../../hooks/useNotification';

vi.mock('../../services/notification/notificationService', () => ({
  notificationService: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe('useNotification', () => {
  it('returns an object with success, error, and info methods', () => {
    const { result } = renderHook(() => useNotification());

    expect(result.current).toHaveProperty('success');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('info');
    expect(typeof result.current.success).toBe('function');
  });

  it('calls the corresponding service method when invoked', () => {
    const { result } = renderHook(() => useNotification());

    result.current.success('Great success');
    result.current.error('Big error');
    result.current.info('Just info');

    expect(notificationService.success).toHaveBeenCalledWith('Great success');
    expect(notificationService.error).toHaveBeenCalledWith('Big error');
    expect(notificationService.info).toHaveBeenCalledWith('Just info');
  });

  it('returns the same methods across re-renders (useMemo)', () => {
    const { result, rerender } = renderHook(() => useNotification());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});