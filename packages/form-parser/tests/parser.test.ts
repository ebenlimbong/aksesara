import { describe, it, expect } from 'vitest';
import { classifySensitivity, resolveLabel } from '../src/index';

describe('Form Parser & Label Resolver Unit Tests', () => {
  it('should classify sensitivity correctly', () => {
    expect(classifySensitivity('parent_income', 'Gaji Orang Tua')).toBe('financial');
    expect(classifySensitivity('nim', 'Nomor Induk')).toBe('identity');
    expect(classifySensitivity('password', 'Kata Sandi')).toBe('credential');
    expect(classifySensitivity('full_name', 'Nama Lengkap')).toBe('normal');
  });
});
