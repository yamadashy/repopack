import { expect, test, describe, beforeAll, afterAll } from 'vitest';
import { Tiktoken, get_encoding } from 'tiktoken';

describe('tiktoken', () => {
  let encoding: Tiktoken;

  beforeAll(() => {
    encoding = get_encoding('cl100k_base');
  });

  afterAll(() => {
    encoding.free();
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
      const tokenCount = encoding.encode(input).length;
      expect(tokenCount).toBe(expectedTokens);
    });
  });

  test('should handle empty input', () => {
    const tokenCount = encoding.encode('').length;
    expect(tokenCount).toBe(0);
  });

  test('should handle very long input', () => {
    const longText = 'a'.repeat(1000);
    const tokenCount = encoding.encode(longText).length;
    expect(tokenCount).toBeGreaterThan(0);
  });
});
