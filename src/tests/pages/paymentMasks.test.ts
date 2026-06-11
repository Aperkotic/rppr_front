import { describe, it, expect } from 'vitest';
import {
  maskCardNumber,
  maskExpiryDate,
  maskCvv,
  applyPaymentMask,
  isPaymentFormComplete,
} from '../../pages/HotelDetailPage/paymentMasks';
import type { PaymentFormData } from '../../pages/HotelDetailPage/types';

// ── maskCardNumber ──
describe('maskCardNumber', () => {
  it('groups digits into blocks of 4', () => {
    expect(maskCardNumber('1234567890123456')).toBe('1234 5678 9012 3456');
  });

  it('removes non-digit characters', () => {
    expect(maskCardNumber('1234-5678-9012-3456')).toBe('1234 5678 9012 3456');
  });

  it('truncates to 16 digits', () => {
    expect(maskCardNumber('12345678901234567890')).toBe('1234 5678 9012 3456');
  });

  it('returns empty string for empty input', () => {
    expect(maskCardNumber('')).toBe('');
  });

  it('handles partial input', () => {
    expect(maskCardNumber('1234567')).toBe('1234 567');
  });
});

describe('maskExpiryDate', () => {
  it('formats MM/YY for 4 digits', () => {
    expect(maskExpiryDate('1225')).toBe('12/25');
  });

  it('returns up to 2 digits without slash', () => {
    expect(maskExpiryDate('12')).toBe('12');
  });

  it('removes non-digit characters', () => {
    expect(maskExpiryDate('12/25')).toBe('12/25'); 
    expect(maskExpiryDate('12-25')).toBe('12/25');
  });

  it('truncates to 4 digits', () => {
    expect(maskExpiryDate('122567')).toBe('12/25');
  });
});

describe('maskCvv', () => {
  it('returns up to 3 digits', () => {
    expect(maskCvv('123')).toBe('123');
    expect(maskCvv('1234')).toBe('123');
  });

  it('removes non-digit characters', () => {
    expect(maskCvv('12a')).toBe('12');
  });
});

describe('applyPaymentMask', () => {
  it('applies cardNumber mask', () => {
    expect(applyPaymentMask('cardNumber', '1234567890123456')).toBe('1234 5678 9012 3456');
  });

  it('applies expiryDate mask', () => {
    expect(applyPaymentMask('expiryDate', '1225')).toBe('12/25');
  });

  it('applies cvv mask', () => {
    expect(applyPaymentMask('cvv', '1234')).toBe('123');
  });

  it('returns value unchanged for unknown field', () => {
    expect(applyPaymentMask('unknown' as any, 'test')).toBe('test');
  });
});

describe('isPaymentFormComplete', () => {
  const validData: PaymentFormData = {
    cardNumber: '1234 5678 9012 3456',
    expiryDate: '12/25',
    cvv: '123',
  };

  it('returns true for complete valid data', () => {
    expect(isPaymentFormComplete(validData)).toBe(true);
  });

  it('returns false if card number has wrong length', () => {
    expect(isPaymentFormComplete({ ...validData, cardNumber: '1234 5678 9012' })).toBe(false);
  });

  it('returns false if expiry date has wrong length', () => {
    expect(isPaymentFormComplete({ ...validData, expiryDate: '12/2' })).toBe(false);
  });

  it('returns false if month is invalid (00 or >12)', () => {
    expect(isPaymentFormComplete({ ...validData, expiryDate: '00/25' })).toBe(false);
    expect(isPaymentFormComplete({ ...validData, expiryDate: '13/25' })).toBe(false);
  });

  it('returns false if CVV length is not 3', () => {
    expect(isPaymentFormComplete({ ...validData, cvv: '12' })).toBe(false);
    expect(isPaymentFormComplete({ ...validData, cvv: '1234' })).toBe(false);
  });

  it('strips non-digit characters for validation', () => {
    expect(isPaymentFormComplete({ cardNumber: '1234 5678 9012 3456', expiryDate: '12/25', cvv: '1 2 3' })).toBe(true);
  });
});