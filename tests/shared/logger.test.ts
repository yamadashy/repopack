import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from '../../src/shared/logger.js';

vi.mock('picocolors', () => ({
  default: {
    red: vi.fn((str) => `RED:${str}`),
    yellow: vi.fn((str) => `YELLOW:${str}`),
    green: vi.fn((str) => `GREEN:${str}`),
    cyan: vi.fn((str) => `CYAN:${str}`),
    dim: vi.fn((str) => `DIM:${str}`),
    blue: vi.fn((str) => `BLUE:${str}`),
    gray: vi.fn((str) => `GRAY:${str}`),
  },
}));

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(vi.fn());
    vi.spyOn(console, 'log').mockImplementation(vi.fn());
    logger.setVerbose(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log error messages', () => {
    logger.error('Error message');
    expect(console.error).toHaveBeenCalledWith('RED:Error message');
  });

  it('should log warning messages', () => {
    logger.warn('Warning message');
    expect(console.log).toHaveBeenCalledWith('YELLOW:Warning message');
  });

  it('should log success messages', () => {
    logger.success('Success message');
    expect(console.log).toHaveBeenCalledWith('GREEN:Success message');
  });

  it('should log info messages', () => {
    logger.info('Info message');
    expect(console.log).toHaveBeenCalledWith('CYAN:Info message');
  });

  it('should log note messages', () => {
    logger.note('Note message');
    expect(console.log).toHaveBeenCalledWith('DIM:Note message');
  });

  it('should log log messages', () => {
    logger.log('Note message');
    expect(console.log).toHaveBeenCalledWith('Note message');
  });

  it('should not log debug messages when verbose is false', () => {
    logger.debug('Debug message');
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should log debug messages when verbose is true', () => {
    logger.setVerbose(true);
    logger.debug('Debug message');
    expect(console.log).toHaveBeenCalledWith('BLUE:Debug message');
  });

  it('should not log trace messages when verbose is false', () => {
    logger.trace('Trace message');
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should log trace messages when verbose is true', () => {
    logger.setVerbose(true);
    logger.trace('Trace message');
    expect(console.log).toHaveBeenCalledWith('GRAY:Trace message');
  });

  it('should format object arguments correctly', () => {
    const obj = { key: 'value' };
    logger.info('Object:', obj);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('CYAN:Object: '));
  });

  it('should handle multiple arguments', () => {
    logger.info('Multiple', 'arguments', 123);
    expect(console.log).toHaveBeenCalledWith('CYAN:Multiple arguments 123');
  });
});
