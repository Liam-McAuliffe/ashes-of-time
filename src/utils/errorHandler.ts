/**
 * Error handling utilities for consistent error management across the application
 */

import { sanitizeText } from './security';

/**
 * Custom error types for the application
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  RESOURCE = 'RESOURCE',
  AUTHENTICATION = 'AUTHENTICATION',
  RATE_LIMIT = 'RATE_LIMIT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Custom error class with added properties for better error handling
 */
export class GameError extends Error {
  type: ErrorType;
  code?: string;
  data?: any;
  
  constructor(
    message: string, 
    type: ErrorType = ErrorType.UNKNOWN, 
    code?: string, 
    data?: any
  ) {
    // Sanitize error message to prevent XSS
    super(sanitizeText(message));
    this.type = type;
    this.code = code;
    this.data = data;
    this.name = 'GameError';
  }
  
  /**
   * Returns a user-friendly error message based on the error type
   */
  getDisplayMessage(): string {
    switch (this.type) {
      case ErrorType.VALIDATION:
        return 'Invalid input: ' + this.message;
      case ErrorType.NETWORK:
        return 'Network error: Unable to connect to the server.';
      case ErrorType.SERVER:
        return 'Server error: Please try again later.';
      case ErrorType.RESOURCE:
        return 'Resource error: ' + this.message;
      case ErrorType.AUTHENTICATION:
        return 'Authentication error: ' + this.message;
      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.';
      default:
        return 'An unexpected error occurred: ' + this.message;
    }
  }
  
  /**
   * Returns a themed game-style message based on the error
   */
  getThemedMessage(): string {
    switch (this.type) {
      case ErrorType.VALIDATION:
        return 'Your supplies seem damaged. Check your inventory and try again.';
      case ErrorType.NETWORK:
        return 'The radio signal is weak. Unable to reach other survivors.';
      case ErrorType.SERVER:
        return 'A radiation storm is blocking communications. Try again when it passes.';
      case ErrorType.RESOURCE:
        return 'Resources depleted: ' + this.message;
      case ErrorType.AUTHENTICATION:
        return 'Your identity papers are not in order. ' + this.message;
      case ErrorType.RATE_LIMIT:
        return 'You need to rest before trying that again. Wait a moment.';
      default:
        return 'A strange anomaly blocks your path. ' + this.message;
    }
  }
}

/**
 * Creates a validation error
 * 
 * @param message - Error message
 * @param data - Additional error data
 * @returns GameError instance
 */
export const createValidationError = (message: string, data?: any): GameError => {
  return new GameError(message, ErrorType.VALIDATION, 'VALIDATION_ERROR', data);
};

/**
 * Creates a network error
 * 
 * @param message - Error message
 * @param data - Additional error data
 * @returns GameError instance
 */
export const createNetworkError = (message: string, data?: any): GameError => {
  return new GameError(message, ErrorType.NETWORK, 'NETWORK_ERROR', data);
};

/**
 * Creates a server error
 * 
 * @param message - Error message
 * @param data - Additional error data
 * @returns GameError instance
 */
export const createServerError = (message: string, data?: any): GameError => {
  return new GameError(message, ErrorType.SERVER, 'SERVER_ERROR', data);
};

/**
 * Creates a resource error
 * 
 * @param message - Error message
 * @param data - Additional error data
 * @returns GameError instance
 */
export const createResourceError = (message: string, data?: any): GameError => {
  return new GameError(message, ErrorType.RESOURCE, 'RESOURCE_ERROR', data);
};

/**
 * Creates an authentication error
 * 
 * @param message - Error message
 * @param data - Additional error data
 * @returns GameError instance
 */
export const createAuthError = (message: string, data?: any): GameError => {
  return new GameError(message, ErrorType.AUTHENTICATION, 'AUTH_ERROR', data);
};

/**
 * Creates a rate limit error
 * 
 * @param message - Error message
 * @param data - Additional error data
 * @returns GameError instance
 */
export const createRateLimitError = (message: string, data?: any): GameError => {
  return new GameError(message, ErrorType.RATE_LIMIT, 'RATE_LIMIT_ERROR', data);
};

/**
 * Logs an error with appropriate formatting and additional info
 * 
 * @param error - The error to log
 * @param context - Optional context info about where error occurred
 */
export const logError = (error: Error | GameError | unknown, context?: string): void => {
  if (error instanceof GameError) {
    console.error(
      `[${error.type}] ${context ? `${context}: ` : ''}${error.message}`,
      error.data || ''
    );
  } else if (error instanceof Error) {
    console.error(
      `[ERROR] ${context ? `${context}: ` : ''}${error.message}`,
      error.stack || ''
    );
  } else {
    console.error(
      `[UNKNOWN ERROR] ${context ? `${context}: ` : ''}`,
      error
    );
  }
}; 