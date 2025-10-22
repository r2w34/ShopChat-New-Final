/**
 * Environment-aware logging utility
 * Prevents information disclosure in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log debug information (only in development)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Log informational messages
   */
  info: (...args: any[]) => {
    console.log('[INFO]', ...args);
  },

  /**
   * Log warnings (always logged)
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Log errors (always logged)
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * Log successful operations (only in development)
   */
  success: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[SUCCESS]', ...args);
    }
  },
};
