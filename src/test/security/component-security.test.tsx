import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { sanitizeHTML } from '../../utils/security';

describe('Security - Component Rendering & XSS Protection', () => {
  test('renders sanitized HTML string safely without raw script tags', () => {
    const userInput = '<script>alert("hack")</script><b>Safe Content</b>';
    const cleanText = sanitizeHTML(userInput);

    const { container } = render(<div data-testid="security-container">{cleanText}</div>);
    const element = screen.getByTestId('security-container');

    expect(element.innerHTML).not.toContain('<script>');
    expect(element.textContent).toContain('&lt;script&gt;');
  });
});
