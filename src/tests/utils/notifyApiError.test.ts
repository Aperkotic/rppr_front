import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getErrorMessage } from '../../utils/getErrorMessage';
import { notifyApiError } from '../../utils/notifyApiError';

const { mockError } = vi.hoisted(() => ({
  mockError: vi.fn(),
}));

vi.mock('../../services/notification/notificationService', () => ({
  notificationService: { error: mockError },
}));

vi.mock('../../utils/getErrorMessage', () => ({
  getErrorMessage: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('notifyApiError', () => {
  it('calls notification service when getErrorMessage returns non-empty', () => {
    (getErrorMessage as any).mockReturnValue('Some error');
    const result = notifyApiError(new Error('test'));
    expect(result).toBe('Some error');
    expect(mockError).toHaveBeenCalledWith('Some error');
  });

  it('does not call notification service when message is empty', () => {
    (getErrorMessage as any).mockReturnValue('');
    const result = notifyApiError(new Error('canceled'));
    expect(result).toBe('');
    expect(mockError).not.toHaveBeenCalled();
  });

  it('passes custom fallback to getErrorMessage', () => {
    (getErrorMessage as any).mockReturnValue('Custom fallback');
    notifyApiError({}, 'Custom fallback');
    expect(getErrorMessage).toHaveBeenCalledWith({}, 'Custom fallback');
  });
});