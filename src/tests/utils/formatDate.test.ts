import { describe, it, expect } from 'vitest';
import { formatRuDate } from '../../utils/formatDate';

describe('formatRuDate', () => {
  it('formats a valid date string', () => {
    expect(formatRuDate('2023-10-05')).toBe('05.10.2023');
  });

  it('handles ISO string with time part', () => {
    expect(formatRuDate('2023-10-05T14:30:00')).toBe('05.10.2023');
  });

  it('returns — for empty string', () => {
    expect(formatRuDate('')).toBe('—');
  });

  it('falls back to toLocaleDateString for non-standard formats', () => {
    const result = formatRuDate('October 5, 2023');
    expect(result).not.toBe('—');
    expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/);
  });
});