import { describe, it, expect } from 'vitest';
import { sanitizeInput } from './sanitize';

// Feature: election-process-education, Property 1: sanitize idempotency

describe('sanitizeInput', () => {
  it('strips HTML tags', () => {
    expect(sanitizeInput('<script>alert(1)</script>')).toBe('');
    expect(sanitizeInput('<b>bold</b>')).toBe('bold');
    expect(sanitizeInput('<img src=x onerror=alert(1)>')).toBe('');
  });

  it('removes dangerous special characters', () => {
    expect(sanitizeInput('hello; DROP TABLE users;')).toBe('hello DROP TABLE users');
    // & < > " are stripped by the safe-char regex; spaces remain
    const result = sanitizeInput("test & <> \" '");
    expect(result).toContain("'");
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
    expect(result).not.toContain('&');
  });

  it('preserves safe characters', () => {
    expect(sanitizeInput('How do I register to vote?')).toBe('How do I register to vote?');
    expect(sanitizeInput("What's the ECI's role?")).toBe("What's the ECI's role?");
    expect(sanitizeInput('Voter ID, Form 6.')).toBe('Voter ID, Form 6.');
  });

  it('trims whitespace', () => {
    expect(sanitizeInput('  hello world  ')).toBe('hello world');
    expect(sanitizeInput('\n\ttest\n')).toBe('test');
  });

  it('truncates to 500 characters', () => {
    const long = 'a'.repeat(600);
    expect(sanitizeInput(long)).toHaveLength(500);
  });

  it('handles empty string', () => {
    expect(sanitizeInput('')).toBe('');
  });

  // Property 1: Idempotency — sanitizeInput(sanitizeInput(s)) === sanitizeInput(s)
  it('is idempotent', () => {
    const inputs = [
      'Hello <b>world</b>',
      '<script>alert(1)</script>',
      'Normal election question?',
      'What is the MCC & ECI?',
      '   spaces   ',
      'a'.repeat(600),
    ];
    for (const input of inputs) {
      const once = sanitizeInput(input);
      const twice = sanitizeInput(once);
      expect(twice).toBe(once);
    }
  });
});
