import type { GameState, GameChoice, Survivor, Companion, EventHistoryEntry } from '../types/game';

// 1. Define the data structure we send TO the backend API
// We only need a subset of the full GameState
export interface PromptContext {
  day: number;
  food: number | string; // Allow string for initial 'unknown'
  water: number | string; // Allow string for initial 'unknown'
  survivors: Survivor[];
  theme: string;
  previousDayOutcome: string;
  eventHistory?: EventHistoryEntry[]; // Add optional event history
}

// 2. Define the expected data structure received FROM the backend API
// This should match the JSON structure returned by src/app/api/gemini/route.js
export interface EventResponse {
  description: string;
  choices: GameChoice[] | null;
  error?: string; // Optional error field from backend
}

// 3. Create the function to call the backend API route
export const fetchGameEvent = async (context: PromptContext): Promise<EventResponse> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ promptContext: context }),
    });

    if (!response.ok) {
      // Try to parse error from backend response body
      let errorMsg = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch (e) {
        // Ignore if response body isn't valid JSON
      }
      throw new Error(errorMsg);
    }

    const data: EventResponse = await response.json();

    // Basic validation of the received structure
    if (typeof data.description !== 'string' || !Array.isArray(data.choices)) {
        // Handle cases where backend might return null/undefined choices
        if (data.choices === null || data.choices === undefined) {
            // If description is valid but choices are null, return as is (might be intended)
            if (typeof data.description === 'string') {
                return { ...data, choices: null };
            }
        } 
        // If structure is fundamentally wrong, throw an error
      throw new Error('Invalid event data structure received from API.');
    }

    return data;

  } catch (error: unknown) {
    console.error('Error fetching game event:', error);
    // Re-throw a consistent error format or return an error structure
    const message = error instanceof Error ? error.message : 'An unknown error occurred fetching the event.';
    // You could return an EventResponse with an error field instead of throwing
    // return { description: `Error: ${message}`, choices: null, error: message };
    throw new Error(message); // Propagate error to be caught by the thunk
  }
}; 