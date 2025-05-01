import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

function tryParseJson(text) {
  if (!text) return { description: 'No response received.', choices: null };

  // Check if text is already a valid JSON object (could happen with some models)
  if (typeof text === 'object' && text !== null) {
    if (
      typeof text.description === 'string' &&
      (!text.choices || Array.isArray(text.choices))
    ) {
      return text;
    }
  }

  try {
    let cleanText = text;

    const jsonBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch?.[1]) {
      cleanText = jsonBlockMatch[1].trim();
    }

    const jsonStart = cleanText.indexOf('{');
    const jsonEnd = cleanText.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const jsonString = cleanText.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonString);

      if (
        typeof parsed.description === 'string' &&
        (!parsed.choices || Array.isArray(parsed.choices))
      ) {
        const description = parsed.description;
        if (
          description.includes('{') &&
          description.includes('}') &&
          (description.includes('"description"') ||
            description.includes('"choices"'))
        ) {
          return {
            description:
              'The day brings new challenges. (Error: Event description contained invalid formatting)',
            choices: parsed.choices || null,
          };
        }

        return parsed;
      }

      console.warn('Parsed JSON has invalid structure:', parsed);
      return {
        description: 'Received unclear instructions from headquarters.',
        choices: null,
      };
    }
  } catch (e) {
    console.error('Failed to parse AI response as JSON:', e);

    if (
      text.includes('{') &&
      text.includes('}') &&
      (text.includes('"description"') || text.includes('"choices"'))
    ) {
      return {
        description:
          'Radio transmission garbled. Try advancing to the next day.',
        choices: null,
      };
    }

    return { description: text, choices: null };
  }

  return {
    description: text.length > 500 ? text.substring(0, 500) + '...' : text,
    choices: null,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { promptContext } = body;

    if (!promptContext) {
      return NextResponse.json(
        { error: 'Missing promptContext in request body.' },
        { status: 400 }
      );
    }

    const currentDay = promptContext.day || 1;
    const currentFood = promptContext.food ?? 'unknown';
    const currentWater = promptContext.water ?? 'unknown';
    const gameTheme = promptContext.theme || 'Standard Post-Apocalypse';
    const previousEventOutcome =
      promptContext.previousDay ||
      'First day follow the overall theme. No previous event. Create a story.';

    const currentSurvivors =
      Array.isArray(promptContext.survivors) &&
      promptContext.survivors.length > 0
        ? promptContext.survivors
        : [
            {
              id: 'player',
              name: 'You',
              health: 100,
              statuses: [],
              companion: null,
            },
          ];

    const survivorDetails = currentSurvivors
      .map((s) => {
        let detail = `- ${s.name} (Health: ${s.health}`;
        if (s.statuses.length > 0) {
          detail += `, Statuses: [${s.statuses.join(', ')}]`;
        }

        if (s.companion) {
          detail += `, Companion: ${s.companion.name} (${s.companion.type})`;
        }
        detail += ')';
        return detail;
      })
      .join('\n');
    const survivorCount = currentSurvivors.length;
    const survivorNames = currentSurvivors.map((s) => s.name);

    const prompt = `
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
    * **Outcome of Previous Event:** ${previousEventOutcome}

    **Task:**
    1.  Generate a **detailed narrative event** (3-5 sentences) that fits within the **${gameTheme}** setting.
        * The event should feel like a natural progression or consequence of the previous day's outcome and the current situation.
        * COMPANIONS ARE THE PETS AND HELPERS OF THE SURVIVORS. THEY ARE NOT HUMAN!
        * **Crucially, this event MUST be distinct** from previous events and offer fresh challenges or opportunities.
        * Consider the current day number and how it might affect the narrative within the context of the ${gameTheme} theme.

    2.  Provide **2-3 distinct choices** related to the event.
        * Choices must be logical actions survivors could take in response to the event description.
        * Choices should offer meaningful trade-offs (e.g., risk vs. reward, resource cost vs. potential gain, short-term benefit vs. long-term consequence).
        * Outcomes and effects should be plausible consequences of the choice made.
        * **Survivor Limit Rule:** If the current survivor count is 5 or more (currently ${survivorCount}), **DO NOT** generate any choices that have an effect of adding a new survivor ('target': 'new').
        * **New Survivor/Companion Guidance:**
            * Occasionally (around a 5-10% chance per day, perhaps slightly increasing as days pass or if the survivor count is low), consider generating a choice that *could* lead to encountering a potential new survivor (if count < 5) or a potential companion (if the targeted survivor doesn't already have one).
            * Do *not* force these encounters; they should arise naturally from the event narrative (e.g., investigating a noise, answering a distress call, finding a stray).
            * If adding a new survivor, try to balance genders and use varied, somewhat common names.
            * If adding a companion, suggest a type (e.g., dog, cat, robot part, or many more) and a generic initial name (e.g., "Stray Dog", "Feral Cat", "Damaged Drone").
            * MUST ENCOUNTER A COMPANION OR A SURVIVOR BY DAY 5!
            * EACH DAY REVIEW EACH STATUS AND DETERMINE IF THEY ARE STILL VALID. IF NOT, REMOVE THEM!
            * REMEBER TO ADD OTHER PEOPLE TO THE PARTY. THEY ARE NOT ALONE! THIS MAKE IT MORE ENGAGIN FOR THE USER!

    3.  **Output Format:**
        Respond ONLY with a single, valid JSON object matching this exact structure. Do NOT include any text, explanations, or markdown formatting before or after the JSON block.

        \`\`\`json
        {
        "description": "...",
        "choices": [
            {
            "id": "choice_1", // Use unique IDs like choice_1, choice_2, etc.
            "text": "...",    // Clear description of the action
            "cost": { "food": 0, "water": 0 }, // Resource cost (can be 0)
            "outcome": "...", // Narrative result of the choice
            "effects": {
                "food": 0,       // Net change in food
                "water": 0,      // Net change in water
                "survivorChanges": [
                // Array of changes. Target 'player', 'random', 'all', or specific names: ${survivorNames.join(
                  ', '
                )}
                // Examples:
                // { "target": "player", "healthChange": -10 },
                // { "target": "random", "addStatus": "injured" }, // Common statuses: injured, sick, fatigued, bleeding, hopeful, scared
                // { "target": "${survivorNames[0]}", "removeStatus": "sick" },
                // { "target": "all", "healthChange": 5, "removeStatus": "fatigued" },
                // { "target": "new", "name": "Maya", "health": 75, "statuses": [] }, // ONLY IF survivor count < 5, make this rare/situational
                // { "target": "player", "addCompanion": { "type": "cat", "name": "Feral Cat" } }, // ONLY IF target has no companion, make rare/situational
                ]
            }
            }
        ]
        }
        \`\`\`
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    const text = response.text;
    const parsedResponse = tryParseJson(text);

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Error in Gemini API route:', error);
    return NextResponse.json(
      { error: 'Failed to generate event.' },
      { status: 500 }
    );
  }
}
