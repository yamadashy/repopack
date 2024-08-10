import { expect, test, describe, beforeAll, afterAll } from 'vitest';
import { TokenCounter } from '../../../src/core/tokenCounter/tokenCounter.js';

describe('tokenCounter', () => {
  let tokenCounter: TokenCounter;

  beforeAll(() => {
    tokenCounter = new TokenCounter();
  });

  afterAll(() => {
    tokenCounter.free();
  });

  test('should correctly count tokens', () => {
    const testCases = [
      { input: 'Hello, world!', expectedTokens: 4 },
      { input: 'This is a longer sentence with more tokens.', expectedTokens: 9 },
      { input: 'Special characters like !@#$%^&*() should be handled correctly.', expectedTokens: 15 },
      { input: 'Numbers 123 and symbols @#$ might affect tokenization.', expectedTokens: 12 },
      { input: 'Multi-line\ntext\nshould\nwork\ntoo.', expectedTokens: 11 },
    ];

    testCases.forEach(({ input, expectedTokens }) => {
      const tokenCount = tokenCounter.countTokens(input);
      expect(tokenCount).toBe(expectedTokens);
    });
  });

  test('should handle empty input', () => {
    const tokenCount = tokenCounter.countTokens('');
    expect(tokenCount).toBe(0);
  });

  test('should handle very long input', () => {
    const longText = 'a'.repeat(1000);
    const tokenCount = tokenCounter.countTokens(longText);
    expect(tokenCount).toBeGreaterThan(0);
  });
});
