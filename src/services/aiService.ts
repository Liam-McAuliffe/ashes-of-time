import type { GameState, GameChoice, Survivor, Companion, EventHistoryEntry } from '../types/game';

// 1. Define the data structure we send TO the backend API
// We only need a subset of the full GameState
export interface PromptContext {
  day: number;
  food: number | string; // Allow string for initial 'unknown'
  water: number | string; // Allow string for initial 'unknown'
  survivors: Survivor[];
  theme: string;
  eventHistory?: EventHistoryEntry[]; // Add optional event history
}

// 2. Define the expected data structure received FROM the backend API
// This should match the JSON structure returned by src/app/api/gemini/route.js
export interface EventResponse {
  description: string;
  choices: GameChoice[] | null;
  error?: string; // Optional error field from backend
}

const MAX_RETRIES = 2; // Try the initial call + 2 retries
const RETRY_DELAY_MS = 1500; // Wait 1.5 seconds between retries

// 3. Create the function to call the backend API route
export const fetchGameEvent = async (context: PromptContext): Promise<EventResponse> => {
  console.log(context);
  let retries = 0;
  while (retries <= MAX_RETRIES) {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ promptContext: context }),
      });

      if (!response.ok) {
        // Check if it's a 503 error and we can retry
        if (response.status === 503 && retries < MAX_RETRIES) {
          retries++;
          console.warn(`API returned 503, retrying (${retries}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
          continue; // Go to the next iteration of the loop to retry
        }

        // If not a 503 or retries exhausted, handle as a normal error
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
      console.log('Received API Response:', JSON.stringify(data, null, 2)); // Log the response body

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
      
      return data; // Success, exit the loop and function

    } catch (error: unknown) {
      // Check if it's a network error or similar potentially retryable issue
      if (retries < MAX_RETRIES && !(error instanceof Error && error.message.startsWith('API request failed'))) { // Don't retry non-503 API errors caught above
          retries++;
          console.warn(`Fetch failed, retrying (${retries}/${MAX_RETRIES})... Error: ${error instanceof Error ? error.message : String(error)}`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
          continue; // Go to the next iteration of the loop to retry
      }

      console.error('Error fetching game event after retries:', error);
      const message = error instanceof Error ? error.message : 'An unknown error occurred fetching the event.';
      throw new Error(message); // Propagate error after exhausting retries or for non-retryable errors
    }
  }
  // Should theoretically not be reached if MAX_RETRIES >= 0, but satisfies TS
  throw new Error('Max retries reached, failed to fetch game event.');
}; 