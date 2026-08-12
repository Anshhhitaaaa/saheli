import { test, describe } from 'node:test';
import assert from 'node:assert';
import { validatePasswordStrength, isValidEmail, isValidUsername } from '../../utils/security.ts';

describe('Security - Authentication & Credential Security', () => {
  test('validatePasswordStrength rejects weak/short passwords', () => {
    const weakPass = validatePasswordStrength('12345');
    assert.strictEqual(weakPass.isValid, false);
    assert.ok(weakPass.feedback.length > 0);
  });

  test('validatePasswordStrength rejects passwords lacking numbers', () => {
    const noNumbers = validatePasswordStrength('OnlyLettersHere');
    assert.strictEqual(noNumbers.isValid, false);
  });

  test('validatePasswordStrength approves strong password (>=8 chars, letters, and numbers)', () => {
    const strongPass = validatePasswordStrength('SaheliHealth2026!');
    assert.strictEqual(strongPass.isValid, true);
    assert.ok(strongPass.score >= 3);
  });

  test('isValidEmail correctly identifies valid and malformed email addresses', () => {
    assert.strictEqual(isValidEmail('user@saheli.health'), true);
    assert.strictEqual(isValidEmail('invalid-email'), false);
    assert.strictEqual(isValidEmail('user@domain'), false);
    assert.strictEqual(isValidEmail(''), false);
  });

  test('isValidUsername validates handle length and disallowed special characters', () => {
    assert.strictEqual(isValidUsername('@valid_user123'), true);
    assert.strictEqual(isValidUsername('short'), true);
    assert.strictEqual(isValidUsername('ab'), false); // Too short
    assert.strictEqual(isValidUsername('user<script>'), false); // Disallowed characters
    assert.strictEqual(isValidUsername('user with spaces'), false);
  });
});
