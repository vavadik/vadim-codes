import { describe, expect, it } from 'vitest';
import { generateId } from './generate-id';

const ALPHABET_RE = /^[A-Za-z0-9]+$/;

describe('generateId', () => {
  it('produces an 8-character string', () => {
    expect(generateId()).toHaveLength(8);
  });

  it('only contains alphanumeric characters', () => {
    for (let i = 0; i < 100; i++) {
      expect(generateId()).toMatch(ALPHABET_RE);
    }
  });

  it('generates unique IDs across many calls', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => generateId()));
    expect(ids.size).toBe(1000);
  });
});
