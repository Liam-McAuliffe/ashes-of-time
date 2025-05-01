import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import type { Survivor } from '../../../types/game';

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

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
  const previousEventOutcome =
    promptContext.previousDay ||
    (currentDay === 1
      ? 'First day. Establish the initial scene based on the theme.'
      : 'No previous outcome provided.');

  const survivors =
    Array.isArray(promptContext.survivors) && promptContext.survivors.length > 0
      ? promptContext.survivors
      : [{ id: 'player', name: 'You', health: 100, statuses: [], companion: null }];
  const survivorCount = survivors.length;
  const survivorNames = survivors.map((s) => s.name);
  const eventHistory = promptContext.eventHistory || []; // Get history from context

  const survivorDetails = survivors
    .map((s) => {
      let d = `- ${s.name} (Health: ${s.health}`;
      if (s.statuses.length) d += `, Statuses: [${s.statuses.join(', ')}]`;
      if (s.companion) d += `, Companion: ${s.companion.name} (${s.companion.type})`;
      return d + ')';
    })
    .join('\n    ');

  let prompt = `\nYou are generating events for a text-based post-apocalyptic survival game.\nThe goal is to create **unique, varied, and contextually continuous** scenarios in valid JSON format.\nAvoid clichés and repetition unless absolutely necessary.\n\n**GAME THEME: ${gameTheme}**\n* All events and choices MUST strictly adhere to this theme.\n* Maintain thematic consistency.\n\n**Current Game State:**\n* **Day:** ${currentDay}\n* **Food:** ${currentFood}\n* **Water:** ${currentWater}\n* **Survivors (${survivorCount}):**\n    ${survivorDetails}\n`;

  if (currentDay > 1) {
    prompt += `* **Outcome of Previous Choice:** ${previousEventOutcome} \n`; 
  }

  // Add Recent History section if available
  if (eventHistory.length > 0) {
      prompt += `\n**Recent History (Avoid Repeating):**\n`;
      // Iterate reverse to show most recent first, limit display slightly for prompt length
      eventHistory.slice(0, 2).reverse().forEach(entry => {
          prompt += `* Day ${entry.day}: [Event] ${entry.description.substring(0, 70)}... [Outcome] ${entry.outcome.substring(0, 70)}...\n`;
      });
  }

  prompt += `\n**Task:**\n`;

  if (currentDay === 1) {
    prompt += `1.  Generate an **initial opening scene** (3-5 sentences) for Day 1 based on the **${gameTheme}** theme. Set the stage effectively. DO NOT use phrases implying continuation (like \"second day\").\n`;
  } else {
    prompt += `1.  Generate a **unique and detailed narrative event** (3-5 sentences) for Day ${currentDay} fitting the **${gameTheme}** theme. \n    * **Crucially, this event MUST be a direct and logical consequence or follow-up to the specific 'Outcome of Previous Choice' provided above.** \n    * **CONSIDER RECENT HISTORY:** Review the 'Recent History' provided. **AVOID REPEATING** situations, locations, specific challenges, or narrative themes mentioned there. Ensure variety.\n    * Manage status effects logically (replace lesser severity with greater, no contradictions). Reflect changes in effects.\n`;
  }

  prompt += `\n2.  Provide **2-3 distinct and meaningful choices** related to the event.\n    * Choices must be logical actions with clear trade-offs (risk/reward, cost/gain, moral choices).\n    * **Survivor Limit Rule:** No 'new' survivor choices if count >= 5.\n    * **New Survivor/Companion Guidance:** RARE encounters (5-10% chance, increasing slightly), MUST arise naturally from narrative. NO companions on Day 1. Target specific survivors without companions. Ensure encounter by Day 5.\n    * **DESCRIPTIVE OUTCOMES:** For each choice, the \"outcome\" field MUST contain a **detailed description (1-2 sentences)** summarizing exactly *what happened* as a result of taking that action. This outcome text is CRITICAL context for the next day's event.\n\n3.  **Output Format:**\n    Respond ONLY with a single, valid JSON object. No extra text or markdown.\n\n    \\\`\\\`\\\`json\n    {\n      \"description\": \"...\", \n      \"choices\": [\n        {\n          \"id\": \"choice_1\",\n          \"text\": \"...\",\n          \"cost\": { \"food\": 0, \"water\": 0 },\n          \"outcome\": \"...DETAILED outcome description (1-2 sentences)...\", \n          \"effects\": { \"food\": 0, \"water\": 0, \"survivorChanges\": [ /* ... */ ] }\n        }\n        // ... (more choices) ...
      ]\n    }\n    \\\`\\\`\\\`\n\n---\nGenerate the JSON event data now, focusing on **uniqueness, continuity (using previous outcome AND recent history), and detailed outcomes**:\n`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });

  const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
  const parsed = tryParseJson(text);
  return NextResponse.json(parsed);
}
