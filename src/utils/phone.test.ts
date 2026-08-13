import { describe, expect, it } from 'vitest';
import { extractPhoneDigits, formatPhone, phoneForAuth } from './phone';

describe('phone helpers', () => {
  it('normalizes Kazakhstan numbers with country prefix', () => {
    expect(extractPhoneDigits('+7 (707) 181-99-12')).toBe('7071819912');
    expect(extractPhoneDigits('8 707 181 99 12')).toBe('7071819912');
  });

  it('formats a local number for display', () => {
    expect(formatPhone('7071819912')).toBe('+7 (707) 181-99-12');
  });

  it('formats a number for authentication', () => {
    expect(phoneForAuth('7071819912')).toBe('+77071819912');
  });
});
