/**
 * Logger utility for consistent logging that can be disabled in production
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Determine if we're in development or production
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Logger utility that only logs in development by default
 */
const logger = {
  /**
   * Debug level logging - only shown in development
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Info level logging - only shown in development
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warning level logging - shown in both development and production
   */
  warn: (...args: any[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error level logging - shown in both development and production
   */
  error: (...args: any[]) => {
    console.error('[ERROR]', ...args);
  }
};

export default logger; 