/**
 * Security utilities for input sanitization and validation
 * Helps protect against various injection attacks and ensures data integrity
 */

/**
 * Sanitizes text input to prevent XSS and code injection
 * 
 * @param input - The user input to sanitize
 * @returns Sanitized string safe for rendering and storage
 */
export const sanitizeText = (input: string): string => {
  if (!input) return '';
  
  // Replace potentially malicious characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;')
    .trim();
};

/**
 * Validates a name input against allowed patterns
 * 
 * @param name - The name to validate
 * @returns Boolean indicating if the name is valid
 */
export const isValidName = (name: string): boolean => {
  if (!name || name.trim().length < 2) return false;
  if (name.trim().length > 20) return false;
  
  // Only allow letters, numbers, spaces, hyphens, and apostrophes in names
  const namePattern = /^[A-Za-z0-9\s\-']+$/;
  return namePattern.test(name);
};

/**
 * Generates a secure game ID for saving/loading games
 * Uses crypto API when available, falls back to less secure method otherwise
 * 
 * @returns A secure random ID string
 */
export const generateSecureGameId = (): string => {
  // Use crypto API if available (more secure)
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(4);
    window.crypto.getRandomValues(array);
    return Array.from(array, (dec) => dec.toString(16).padStart(8, '0')).join('-');
  }
  
  // Fallback to less secure but still reasonable random ID
  return 'game-' + 
    Date.now().toString(36) + 
    Math.random().toString(36).substring(2, 10);
};

/**
 * Rate limiting utility - limits function calls by time window
 * 
 * @param fn - The function to rate limit
 * @param limitMs - The minimum time between allowed function calls
 * @returns Rate limited function
 */
export function rateLimit<T extends (...args: any[]) => any>(
  fn: T, 
  limitMs: number = 1000
): (...args: Parameters<T>) => ReturnType<T> | null {
  let lastCalled = 0;
  let timeoutId: number | null = null;
  
  return (...args: Parameters<T>): ReturnType<T> | null => {
    const now = Date.now();
    const elapsed = now - lastCalled;
    
    // If not enough time has passed, ignore this call
    if (elapsed < limitMs) {
      console.warn(`Rate limit exceeded. Please wait ${((limitMs - elapsed) / 1000).toFixed(1)}s`);
      return null;
    }
    
    // Clear any pending timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    // Update the last called time and execute function
    lastCalled = now;
    return fn(...args);
  };
} 