import { rateLimit, sanitizeText } from '../../utils/security';
import { PromptContext, EventResponse } from '../aiService';
import { StatusEffect } from '../../types/game';

/**
 * Rate limit configuration for different API endpoints
 */
const RATE_LIMITS = {
  fetchEvent: 1500,  // 1.5 seconds between event generation calls
  generateChoice: 3000, // 3 seconds between choice generation calls
};

/**
 * Error response when validation fails
 */
interface ValidationErrorResponse {
  error: string;
  invalidFields?: string[];
}

/**
 * Validates a prompt context to ensure all required fields are present and valid
 * 
 * @param context - The prompt context to validate
 * @returns Error response if validation failed, null if valid
 */
export const validatePromptContext = (context: PromptContext): ValidationErrorResponse | null => {
  const invalidFields: string[] = [];
  
  // Check for required fields
  if (typeof context.day !== 'number' || context.day < 1) {
    invalidFields.push('day');
  }
  
  if (typeof context.food !== 'number' || context.food < 0) {
    invalidFields.push('food');
  }
  
  if (typeof context.water !== 'number' || context.water < 0) {
    invalidFields.push('water');
  }
  
  if (!context.survivors || !Array.isArray(context.survivors) || context.survivors.length === 0) {
    invalidFields.push('survivors');
  }
  
  if (!context.theme || typeof context.theme !== 'string') {
    invalidFields.push('theme');
  }
  
  // If any fields are invalid, return error
  if (invalidFields.length > 0) {
    return {
      error: 'Invalid prompt context provided',
      invalidFields,
    };
  }
  
  return null;
};

/**
 * Sanitizes a prompt context to prevent injection attacks
 * 
 * @param context - The prompt context to sanitize
 * @returns Sanitized prompt context safe for API requests
 */
export const sanitizePromptContext = (context: PromptContext): PromptContext => {
  // Create a deep copy to avoid mutating the input
  const sanitized = JSON.parse(JSON.stringify(context)) as PromptContext;
  
  // Sanitize string fields
  if (sanitized.theme) {
    sanitized.theme = sanitizeText(sanitized.theme);
  }
  
  // Sanitize survivor names and statuses
  if (sanitized.survivors && Array.isArray(sanitized.survivors)) {
    sanitized.survivors = sanitized.survivors.map(survivor => ({
      ...survivor,
      name: sanitizeText(survivor.name),
      // Cast back to StatusEffect type after sanitizing
      statuses: (survivor.statuses?.map(status => sanitizeText(status as string)) || []) as StatusEffect[],
      // If there's a companion, sanitize its name and type
      companion: survivor.companion ? {
        ...survivor.companion,
        name: sanitizeText(survivor.companion.name),
        type: sanitizeText(survivor.companion.type),
      } : null,
    }));
  }
  
  // Sanitize event history if present
  if (sanitized.eventHistory && Array.isArray(sanitized.eventHistory)) {
    sanitized.eventHistory = sanitized.eventHistory.map(entry => ({
      ...entry,
      description: sanitizeText(entry.description),
      outcome: sanitizeText(entry.outcome),
    }));
  }
  
  return sanitized;
};

/**
 * Validates and corrects the response data to ensure companions are properly formatted
 * and not incorrectly added as survivors
 * 
 * @param response - The response to validate
 * @returns Corrected event response
 */
export const validateEventResponse = (response: EventResponse): EventResponse => {
  // If there are no choices or already an error, don't process further
  if (!response.choices || response.error) {
    return response;
  }
  
  // Process each choice to validate and fix companion entries
  const validatedChoices = response.choices.map(choice => {
    // If no survivor changes, return the choice as is
    if (!choice.survivorChanges || !Array.isArray(choice.survivorChanges)) {
      return choice;
    }
    
    // Process each survivor change
    choice.survivorChanges = choice.survivorChanges.map(change => {
      // Check for incorrectly formatted companions - animals being added as survivors
      if (change.new === true && 
          (change.statuses?.includes("Companion Bond") || 
           /dog|wolf|cat|pet|animal|bird|robot|drone/i.test(change.name || ''))) {
        
        console.warn('Middleware detected companion incorrectly added as survivor:', change);
        
        // Generate a companion ID
        const companionId = `companion-${(change.name || 'Companion').toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
        
        // Fix by converting to proper companion format
        return {
          target: "player", // Default to player if unsure
          addCompanion: {
            id: companionId,
            name: change.name || 'Companion',
            type: guessCompanionTypeFromName(change.name || ''),
          }
        };
      }
      
      // Check if companion is being added but missing ID
      if (change.addCompanion && !change.addCompanion.id) {
        const companionName = change.addCompanion.name || 'Companion';
        const companionId = `companion-${companionName.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
        
        // Add the missing ID
        return {
          ...change,
          addCompanion: {
            ...change.addCompanion,
            id: companionId
          }
        };
      }
      
      return change;
    });
    
    return choice;
  });
  
  return {
    ...response,
    choices: validatedChoices
  };
};

/**
 * Helper function to guess the companion type based on name
 * 
 * @param name - The companion name to analyze
 * @returns Best guess at companion type
 */
function guessCompanionTypeFromName(name: string): string {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('dog') || lowerName.includes('wolf') || lowerName.includes('puppy')) {
    return 'dog';
  } else if (lowerName.includes('cat') || lowerName.includes('kitten')) {
    return 'cat';
  } else if (lowerName.includes('bird') || lowerName.includes('parrot') || lowerName.includes('crow')) {
    return 'bird';
  } else if (lowerName.includes('robot') || lowerName.includes('bot') || lowerName.includes('drone')) {
    return 'robot';
  } else if (lowerName.includes('rat') || lowerName.includes('mouse')) {
    return 'rodent';
  }
  
  return 'animal';
}

/**
 * Middleware for the fetchEvent function to apply rate limiting and validation
 * 
 * @param contextFn - Function that returns the prompt context
 * @param fetchFn - The original fetch function to call
 * @returns Promise with event response or error
 */
export const withMiddleware = async (
  contextFn: () => PromptContext,
  fetchFn: (context: PromptContext) => Promise<EventResponse>
): Promise<EventResponse> => {
  try {
    // Get context
    const context = contextFn();
    
    // Validate context
    const validationError = validatePromptContext(context);
    if (validationError) {
      console.error('Validation error:', validationError);
      return {
        description: `Unable to generate event: ${validationError.error}`,
        choices: [{
          action: 'Continue...',
          cost: { food: 0, water: 0 },
          outcome: 'System error. Please try again.',
        }],
      };
    }
    
    // Sanitize context
    const sanitizedContext = sanitizePromptContext(context);
    
    // Apply rate limiting
    const rateLimitedFetch = rateLimit(fetchFn, RATE_LIMITS.fetchEvent);
    const result = rateLimitedFetch(sanitizedContext);
    
    if (!result) {
      return {
        description: 'Please wait a moment before generating another event.',
        choices: [{
          action: 'Wait patiently...',
          cost: { food: 0, water: 0 },
          outcome: 'You wait for a moment to collect your thoughts.',
        }],
      };
    }
    
    const eventResponse = await result;
    
    // Validate and fix response data
    const validatedResponse = validateEventResponse(eventResponse);
    
    return validatedResponse;
  } catch (error) {
    console.error('Error in AI service middleware:', error);
    return {
      description: 'An unexpected error occurred while generating the event.',
      choices: [{
        action: 'Continue despite the error...',
        cost: { food: 0, water: 0 },
        outcome: 'You press on despite the uncertainty.',
      }],
    };
  }
}; 