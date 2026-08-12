/**
 * Saheli Security & Input Sanitization Utilities
 */

/**
 * Escapes HTML characters in untrusted string inputs to prevent Cross-Site Scripting (XSS).
 */
export function sanitizeHTML(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strips dangerous HTML tags (<script>, <iframe>, <style>, onerror, onload handlers)
 * while preserving plain text content.
 */
export function stripDangerousTags(str: string): string {
  if (!str || typeof str !== 'string') return '';
  // Remove script tags and inline event handlers
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');
}

export interface PasswordStrengthResult {
  score: number; // 0 (weak) to 4 (strong)
  isValid: boolean;
  feedback: string[];
}

/**
 * Evaluates password strength and enforces security criteria:
 * - At least 8 characters long
 * - Must contain at least one uppercase or lowercase letter
 * - Must contain at least one digit
 */
export function validatePasswordStrength(password: string): PasswordStrengthResult {
  const feedback: string[] = [];
  if (!password) {
    return { score: 0, isValid: false, feedback: ['Password cannot be empty.'] };
  }

  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password must be at least 8 characters long.');
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  } else if (/[a-zA-Z]/.test(password)) {
    score += 0.5;
  } else {
    feedback.push('Include both uppercase and lowercase letters.');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Include at least one number.');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  }

  const isValid = password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password);

  return {
    score: Math.min(4, Math.floor(score)),
    isValid,
    feedback
  };
}

/**
 * Validates email format strictly.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates username strictly (3-20 characters, alphanumeric and underscores only).
 */
export function isValidUsername(username: string): boolean {
  if (!username || typeof username !== 'string') return false;
  const cleaned = username.trim().replace(/^@/, '');
  return /^[a-zA-Z0-9_]{3,20}$/.test(cleaned);
}
