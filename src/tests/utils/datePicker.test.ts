import { describe, it, expect } from 'vitest';
import { parseIsoDate, getTodayStart } from '../../utils/datePicker';

describe('parseIsoDate', () => {
  it('parses a valid ISO date string', () => {
    const result = parseIsoDate('2023-10-05');
    expect(result).toBeInstanceOf(Date);
    expect(result!.getFullYear()).toBe(2023);
    expect(result!.getMonth()).toBe(9); 
    expect(result!.getDate()).toBe(5);
  });

  it('returns null for empty string', () => {
    expect(parseIsoDate('')).toBeNull();
  });

  it('returns null for invalid date', () => {
    expect(parseIsoDate('2023-13-40')).toBeNull();
  });
});

describe('getTodayStart', () => {
  it('returns a Date with time set to midnight', () => {
    const todayStart = getTodayStart();
    expect(todayStart).toBeInstanceOf(Date);
    expect(todayStart.getHours()).toBe(0);
    expect(todayStart.getMinutes()).toBe(0);
    expect(todayStart.getSeconds()).toBe(0);
    expect(todayStart.getMilliseconds()).toBe(0);
  });

  it('returns today’s date', () => {
    const todayStart = getTodayStart();
    const now = new Date();
    expect(todayStart.getFullYear()).toBe(now.getFullYear());
    expect(todayStart.getMonth()).toBe(now.getMonth());
    expect(todayStart.getDate()).toBe(now.getDate());
  });
});