import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from '@google/genai';
import { NextResponse } from 'next/server';
import type { Survivor } from '../../../types/game';

// Define an interface for ServerError if needed, or use 'any' if structure isn't critical
interface ServerError extends Error {
  status?: number; // Or the actual property name that holds the status code
  // Add other relevant properties if known
}

const apiKey = process.env.GEMINI_API_KEY;
// Example safety settings (adjust as needed):
/* // Safety settings are typically passed during generateContent, not initialization
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];
*/

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null; // Removed safetySettings from constructor

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function for API call with retry logic
async function generateContentWithRetry(
  aiInstance: GoogleGenAI,
  params: any, // Consider defining a more specific type for params if possible
  maxRetries: number = 3,
  initialDelay: number = 1000 // Start with 1 second delay
): Promise<any> { // Consider using the actual Response type from the SDK if known
  let attempt = 0;
  let currentDelay = initialDelay;

  while (attempt < maxRetries) {
    attempt++;
    try {
      // Pass safety settings here if needed for the specific call
      const response = await aiInstance.models.generateContent({
        ...params,
        // safetySettings: safetySettings // Example: Pass safety settings here
      });
      // If the call succeeds, return the response
      return response;
    } catch (error: unknown) { // Use unknown for better type safety
        const typedError = error as ServerError; // Type assertion (use cautiously)
        
        // Check if it's a potentially retryable server error (e.g., 503)
        // Note: The actual error structure/property holding the status might differ.
        // You might need to inspect the 'error' object during debugging
        // to find the correct way to access the status code or error message.
        // This example assumes a 'status' property or checks the message string.
        const isRetryable =
            (typedError.message?.includes('503') || typedError.message?.includes('overloaded')) ||
            (typedError.status && typedError.status >= 500 && typedError.status < 600);


        if (isRetryable && attempt < maxRetries) {
            console.warn(`Attempt ${attempt} failed with retryable error: ${typedError.message}. Retrying in ${currentDelay}ms...`);
            await delay(currentDelay);
            currentDelay *= 2; // Exponential backoff
        } else {
            console.error(`Attempt ${attempt} failed with non-retryable error or max retries reached:`, error);
            // If it's not retryable or we've exhausted retries, re-throw the error
            throw error;
        }
    }
  }
  // This point should theoretically not be reached if the loop correctly re-throws,
  // but we need a return path for TypeScript. Throw a final error.
  throw new Error(`Failed to generate content after ${maxRetries} attempts.`);
}

function tryParseJson(text: string | null | undefined): any {
  if (!text) {
    console.warn('tryParseJson received null/undefined text');
    return { description: 'No response received.', choices: null };
  }
  
  // Handle potential object input (less likely now, but safe)
  if (typeof text === 'object') {
    if (typeof (text as any).description === 'string') return text;
  }

  if (typeof text !== 'string') {
     console.warn('tryParseJson received non-string text:', typeof text);
    return { description: 'Invalid response format received.', choices: null };
  }

  let jsonStringToParse = text;
  let potentialJson = null;

  // 1. Attempt to strip markdown backticks
  try {
      const jsonBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonBlockMatch?.[1]) {
          console.log('tryParseJson: Found JSON within backticks.');
          jsonStringToParse = jsonBlockMatch[1].trim();
      } else {
          // If no backticks, maybe the AI just returned raw JSON (or invalid text)
          // Trim potential whitespace/newlines
          jsonStringToParse = text.trim();
      }
  } catch (e) {
      console.error('tryParseJson: Error during regex/stripping:', e);
      jsonStringToParse = text; // Fallback to original text
  }
  
  // 2. Attempt to parse the processed string
  try {
    // **NEW:** Sanitize numbers with leading '+' sign
    jsonStringToParse = jsonStringToParse.replace(/"\s*:\s*\+\s*(\d+(\.\d+)?)/g, '" : $1');

    // Ensure it looks like JSON before trying to parse
    if (jsonStringToParse.startsWith('{') && jsonStringToParse.endsWith('}')) {
      potentialJson = JSON.parse(jsonStringToParse);
      console.log('tryParseJson: Successfully parsed JSON.');
    } else {
        console.warn('tryParseJson: Text did not start/end with {} after stripping backticks:', jsonStringToParse);
    }
  } catch (e) {
    console.error('tryParseJson: JSON.parse failed:', e);
    console.error('--- String that failed parsing ---\n', jsonStringToParse, '\n--- End String ---');
    // Parsing failed, potentialJson remains null
  }

  // 3. Validate the parsed structure
  // Accept 'description', 'scene', or 'event' as the narrative key
  const narrativeKey = ['description', 'scene', 'event'].find(key => typeof potentialJson?.[key] === 'string');

  if (potentialJson && narrativeKey) {
       console.log(`tryParseJson: Parsed JSON validated successfully (found key: ${narrativeKey}).`);
       
       // Extract the narrative text using the found key
       const narrativeText = potentialJson[narrativeKey];

       // Check for accidental nested JSON string in the narrative
       if (
            narrativeText.includes('{') &&
            narrativeText.includes('}') &&
            (narrativeText.includes('\\"description\\"') || narrativeText.includes('\\"choices\\"') || narrativeText.includes('\\"scene\\"') || narrativeText.includes('\\"event\\"')) // Added event check
        ) {
            console.warn('tryParseJson: AI narrative contained escaped JSON, providing fallback description.');
            return {
                description: 'The day brings new challenges. (Event description formatting error)',
                choices: potentialJson.choices || null, 
            };
        }
       
       // Ensure the final returned object always uses 'description' for consistency
       if (narrativeKey !== 'description') {
            potentialJson.description = narrativeText; // Assign the text to description
            delete potentialJson[narrativeKey];       // Delete the original key (scene or event)
       }

       // Transform choices to match our frontend expectations
       if (Array.isArray(potentialJson.choices)) {
          potentialJson.choices = potentialJson.choices.map(choice => {
            const transformedChoice: any = {
              action: choice.text || choice.action || "Take this action", // Convert text to action, with fallbacks
              outcome: choice.outcome || ""
            };

            // Handle costs if present
            if (choice.cost) {
              transformedChoice.cost = choice.cost;
            }

            // Flatten effects if they exist
            if (choice.effects) {
              if (typeof choice.effects.food === 'number') {
                transformedChoice.foodChange = choice.effects.food;
              }
              if (typeof choice.effects.water === 'number') {
                transformedChoice.waterChange = choice.effects.water;
              }
              if (Array.isArray(choice.effects.survivorChanges)) {
                transformedChoice.survivorChanges = choice.effects.survivorChanges;
              }
            }

            // Also copy over direct properties if they exist
            if (typeof choice.foodChange === 'number') {
              transformedChoice.foodChange = choice.foodChange;
            }
            if (typeof choice.waterChange === 'number') {
              transformedChoice.waterChange = choice.waterChange;
            }
            if (Array.isArray(choice.survivorChanges)) {
              transformedChoice.survivorChanges = choice.survivorChanges;
            }

            return transformedChoice;
          });
          
          console.log("Transformed choices:", potentialJson.choices);
       }
       
       return potentialJson; 
  } else if (potentialJson) {
      console.warn('tryParseJson: Parsed JSON failed validation (missing/invalid description, scene, or event?):', potentialJson);
  }

  // 4. Final fallback if all else failed
  console.warn('tryParseJson: Falling back to uninterpretable message.');
  const limited = text.length > 300 ? text.slice(0, 297) + '...' : text;
  return { description: `Received uninterpretable message: ${limited}`, choices: null };
}

export async function POST(request) {
  if (!ai) {
    return NextResponse.json({ error: 'Server configuration error: Missing API Key.' }, { status: 500 });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 });
  }
  const { promptContext } = body;
  if (!promptContext) {
    return NextResponse.json({ error: 'Missing promptContext in request body.' }, { status: 400 });
  }

  const currentDay = promptContext.day || 1;
  const currentFood = promptContext.food ?? 'unknown';
  const currentWater = promptContext.water ?? 'unknown';
  const gameTheme = promptContext.theme || 'Standard Post-Apocalypse';
  
  const survivors =
    Array.isArray(promptContext.survivors) && promptContext.survivors.length > 0
      ? promptContext.survivors
      : [{ id: 'player', name: 'You', health: 100, statuses: [], companion: null }];
  const survivorCount = survivors.length;
  const survivorNames = survivors.map((s) => s.name);
  const eventHistory = promptContext.eventHistory || [];

  const survivorDetails = survivors
    .map((s) => {
      let d = `- ${s.name} (Health: ${s.health}`;
      if (s.statuses.length) d += `, Statuses: [${s.statuses.join(', ')}]`;
      if (s.companion) d += `, Companion: ${s.companion.name} (${s.companion.type})`;
      return d + ')';
    })
    .join('\n    ');

  // Updated prompt to better match the style of the inspiration version
  let prompt = `
You are generating events for a post-apocalyptic survival game.
The goal is to create engaging, challenging, and contextually relevant scenarios.

**GAME THEME: ${gameTheme}**
* All events and choices should reflect this overarching theme.
* For example, if the theme is "Nuclear Winter", focus on extreme cold, radiation, and appropriate challenges.
* If the theme is "Mutated Beasts", emphasize encounters with strange creatures.
* Maintain consistency with this theme throughout all events and choices.

**Current Game State:**
* **Day:** ${currentDay}
* **Food:** ${currentFood}
* **Water:** ${currentWater}
* **Survivors (${survivorCount}):**
    ${survivorDetails}
`;

  // Add Recent History section if available
  if (eventHistory.length > 0) {
    prompt += `
**Recent History (CRITICAL for Continuity):**
`;
    // Iterate reverse to show most recent first, limit display slightly for prompt length
    eventHistory.slice(0, 2).reverse().forEach(entry => {
      // Ensure entry.description and entry.outcome are strings before substring
      const descSnippet = typeof entry.description === 'string' ? entry.description : '(invalid description)';
      const outcomeSnippet = typeof entry.outcome === 'string' ? entry.outcome : '(invalid outcome)';
      prompt += `* Day ${entry.day}: [Event] ${descSnippet}
* Day ${entry.day}: [Outcome] ${outcomeSnippet}
`;
    });
  }

  prompt += `
**Task:**
`;

  if (currentDay === 1) {
    prompt += `1.  Generate an **initial opening scene** (3-5 sentences) for Day 1 based on the **${gameTheme}** theme. Set the stage effectively. DO NOT use phrases implying continuation (like "second day").
`;
  } else {
    prompt += `1.  Generate a **detailed narrative event** (3-5 sentences) that fits within the **${gameTheme}** setting.
    * **CRITICAL: You MUST directly reference and continue the narrative from the previous day's outcome above.** 
    * If new survivors or companions were introduced, they MUST be mentioned in your new event.
    * The event should feel like a natural progression or consequence of the recent history.
    * COMPANIONS ARE THE PETS AND HELPERS OF THE SURVIVORS. THEY ARE NOT HUMAN!
    * **This event MUST be distinct** from previous events but maintain STRONG CONTINUITY with the previous outcome.
    * Any statuses (injured, sick, etc.) from previous events should be reflected in your narrative.
    * Consider the current day number and how it might affect the narrative.
`;
  }

  prompt += `
2.  Provide **2-3 distinct choices** related to the event.
    * Choices must be logical actions survivors could take in response to the event description.
    * Choices should offer meaningful trade-offs (e.g., risk vs. reward, resource cost vs. potential gain).
    * **Survivor Limit Rule:** If the current survivor count is 5 or more (currently ${survivorCount}), **DO NOT** generate any choices that add a new survivor.
    * **Status Effects & Health:** Include changes to survivor health and status when appropriate:
        * Add status effects that make sense (injured, sick, bleeding, exhausted, etc.) based on the choices
        * Remove status effects when they would logically be cured
        * Apply health changes that reflect the danger or benefit of each choice
    * **New Survivor/Companion Guidance:**
        * Occasionally (around a 5-10% chance per day, increasing slightly with days passed), consider generating a choice that *could* lead to encountering a potential new survivor (if count < 5) or a potential companion.
        * If a survivor was mentioned in the previous day but not yet added, prioritize a choice that allows recruiting them.
        * Do *not* force these encounters; they should arise naturally from the event narrative.
        * If adding a new survivor, try to balance genders and use varied, somewhat common names.
        * If adding a companion, suggest a type (e.g., dog, cat, robot, drone) and a generic initial name.
        * MUST ENCOUNTER A COMPANION OR A SURVIVOR BY DAY 5!
        * REMEMBER TO ADD OTHER PEOPLE TO THE PARTY. THEY ARE NOT ALONE! THIS MAKES IT MORE ENGAGING FOR THE USER!
    * **ADDING NEW SURVIVORS:** To add a *new* survivor via choice effects, include an object within the \`survivorChanges\` array with the property \`"new": true\`, \`"name": "SurvivorName"\` and \`"health": initialHealthValue\`.
    * **DESCRIPTIVE OUTCOMES:** For each choice, the "outcome" field MUST contain a **detailed description (1-2 sentences)** summarizing exactly *what happened* as a result of taking that action.

3.  **Output Format:**
    Respond ONLY with a single, valid JSON object containing \`description\` (string) and \`choices\` (array). Example structure:

    \`\`\`json
    {
    "description": "...",
    "choices": [
        {
        "text": "...",    // Clear description of the action
        "cost": { "food": 0, "water": 0 }, // Resource cost (can be 0)
        "outcome": "...", // Narrative result of the choice
        "effects": {
            "food": 0,       // Net change in food
            "water": 0,      // Net change in water
            "survivorChanges": [
            // Array of changes. Target 'player', 'random', 'all', or specific names: ${survivorNames.join(', ')}
            // Examples:
            // { "target": "player", "healthChange": -10 },
            // { "target": "random", "addStatus": "injured" }, // Common statuses: injured, sick, fatigued, bleeding, hopeful, scared
            // { "target": "${survivorNames.length > 0 ? survivorNames[0] : 'player'}", "removeStatus": "sick" },
            // { "target": "all", "healthChange": 5, "removeStatus": "fatigued" },
            // { "target": "new", "name": "Maya", "health": 75, "statuses": [] }, // ONLY IF survivor count < 5
            // { "target": "player", "addCompanion": { "type": "cat", "name": "Feral Cat" } }, // ONLY IF target has no companion
            // { "target": "${survivorNames.length > 1 ? survivorNames[1] : 'player'}", "removeCompanion": true } // Only if target HAS a companion
            ]
        }
        },
        // Additional choices follow the same structure
    ]
    }
    \`\`\`

---
Generate the JSON event data now based on the current game state and rules, focusing on creating a unique and engaging scenario:
`;

  try { // Add try block for the API call
    const generationParams = {
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      // Include safety settings here if they are specific to the generation call
      // safetySettings: safetySettings
    };

    const response = await generateContentWithRetry(ai, generationParams);

    // Assuming 'response' is the direct result from generateContent if successful
    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = tryParseJson(text);
    console.log(parsed); // Keep logging the final parsed result
    return NextResponse.json(parsed);

  } catch (error: unknown) { // Add catch block
    console.error('Failed to get response from Gemini API after retries:', error);
    // Return a specific error response to the client
    return NextResponse.json(
        { error: 'AI service is currently unavailable. Please try again later.' },
        { status: 503 } // Use 503 to indicate service unavailability
    );
  }
}
