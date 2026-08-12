import { describe, test, expect } from 'vitest';
import { validatePasswordStrength, isValidEmail, isValidUsername } from '../../utils/security';

describe('Security - Authentication & Credential Security', () => {
  test('validatePasswordStrength rejects weak/short passwords', () => {
    const weakPass = validatePasswordStrength('12345');
    expect(weakPass.isValid).toBe(false);
    expect(weakPass.feedback.length).toBeGreaterThan(0);
  });

  test('validatePasswordStrength rejects passwords lacking numbers', () => {
    const noNumbers = validatePasswordStrength('OnlyLettersHere');
    expect(noNumbers.isValid).toBe(false);
  });

  test('validatePasswordStrength approves strong password (>=8 chars, letters, and numbers)', () => {
    const strongPass = validatePasswordStrength('SaheliHealth2026!');
    expect(strongPass.isValid).toBe(true);
    expect(strongPass.score).toBeGreaterThanOrEqual(3);
  });

  test('isValidEmail correctly identifies valid and malformed email addresses', () => {
    expect(isValidEmail('user@saheli.health')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('user@domain')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  test('isValidUsername validates handle length and disallowed special characters', () => {
    expect(isValidUsername('@valid_user123')).toBe(true);
    expect(isValidUsername('short')).toBe(true);
    expect(isValidUsername('ab')).toBe(false); // Too short
    expect(isValidUsername('user<script>')).toBe(false); // Disallowed characters
    expect(isValidUsername('user with spaces')).toBe(false);
  });
});
