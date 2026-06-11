import { describe, it, expect, vi } from 'vitest';
import { AxiosError } from 'axios';
import { getErrorMessage } from '../../utils/getErrorMessage';

vi.mock('axios', () => ({
  AxiosError: class extends Error {
    code?: string;
    response?: any;   
    constructor(message: string, code?: string, response?: any) {
      super(message);
      this.name = code === 'ERR_CANCELED' ? 'CanceledError' : 'AxiosError';
      this.code = code;
      this.response = response;
    }
  },
}));

const axiosErr = (opts: {
  msg?: string;
  code?: string;
  detail?: any;
  noResponse?: boolean;
} = {}) => {
  const { msg = 'Error', code, detail, noResponse } = opts;
  const resp = noResponse ? undefined : { data: { detail } };
  return new (AxiosError as any)(msg, code, resp);
};

describe('getErrorMessage', () => {
  it('returns "" for canceled errors', () => {
    expect(getErrorMessage(axiosErr({ code: 'ERR_CANCELED' }))).toBe('');
    const domErr = new DOMException('', 'AbortError');
    expect(getErrorMessage(domErr)).toBe('');
  });

  it('returns detail string from AxiosError', () => {
    expect(getErrorMessage(axiosErr({ detail: 'Not found' }))).toBe('Not found');
  });

  it('joins array detail messages', () => {
    expect(getErrorMessage(axiosErr({ detail: ['E1', 'E2'] }))).toBe('E1, E2');
    expect(getErrorMessage(axiosErr({ detail: [{ msg: 'A' }, { msg: 'B' }] }))).toBe('A, B');
  });

  it('returns fallback if detail array yields empty', () => {
    expect(getErrorMessage(axiosErr({ detail: [] }))).toBe('Произошла ошибка');
    expect(getErrorMessage(axiosErr({ detail: [{}] }))).toBe('Произошла ошибка');
  });

  it('returns "Нет соединения с сервером" when no response', () => {
    expect(getErrorMessage(axiosErr({ noResponse: true }))).toBe('Нет соединения с сервером');
  });

  it('returns fallback for AxiosError without detail', () => {
    expect(getErrorMessage(axiosErr({ detail: null }))).toBe('Произошла ошибка');
  });

  it('returns Error.message for generic Error', () => {
    expect(getErrorMessage(new Error('Oops'))).toBe('Oops');
  });

  it('returns fallback for unknown input', () => {
    expect(getErrorMessage('something')).toBe('Произошла ошибка');
  });
});