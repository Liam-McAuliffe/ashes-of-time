# AI Integration in Ashes of Time

This document explains how AI technology is integrated into the Ashes of Time game to create a dynamic and adaptive narrative experience.

## Overview

Ashes of Time leverages AI to generate contextual events, choices, and narrative content based on the current game state. This creates a unique storytelling experience that adapts to player decisions and game progression.

## AI Technology

The game uses the Gemini AI model from Google to generate narrative content. This large language model is capable of creative text generation based on prompts and context.

## Integration Architecture

### Components

1. **AI Service**: A dedicated service that interfaces with the Gemini API
2. **Context Builder**: Prepares game state as context for AI requests
3. **Prompt Templates**: Pre-defined prompt structures for consistent AI responses
4. **Response Parser**: Processes and validates AI-generated content

### Data Flow

```
Game State → Context Builder → AI Service → Gemini API → Response Parser → Game Update
```

## Implementation Details

### Context Preparation

The game sends the following context to the AI:

```typescript
interface PromptContext {
  day: number;               // Current game day
  food: number;              // Current food amount
  water: number;             // Current water amount
  survivors: Survivor[];     // All survivors and their status
  theme: string;             // Game theme (e.g., "Nuclear Winter")
  eventHistory: EventHistoryEntry[]; // Recent events for continuity
}
```

This context allows the AI to understand the current game situation and generate relevant content.

### Prompt Engineering

Prompts to the AI are carefully structured to ensure consistent, game-appropriate responses. A typical prompt includes:

1. **System instructions**: Define the tone, constraints, and format requirements
2. **Game context**: Current game state information
3. **Request**: Specific instructions for the type of content needed

Example prompt structure:

```
[SYSTEM INSTRUCTIONS]
You are generating content for a survival game called "Ashes of Time". 
Create an event with 3-4 choices that makes sense for the current game state.
Each choice should have clear consequences and resource costs.

[GAME CONTEXT]
Day: {day}
Food: {food}
Water: {water}
Survivors: {survivors with statuses}
Theme: {theme}
Recent events: {eventHistory}

[REQUEST]
Generate an event that the survivors encounter today, with 3-4 possible choices.
Each choice should include:
- Action text
- Resource costs (food/water)
- Outcome text
- Effects on resources and survivors
```

### Response Format

The AI returns structured data that includes:

```typescript
interface EventResponse {
  text: string;       // Main event narrative
  choices: GameChoice[]; // Available player choices
}

interface GameChoice {
  action: string;     // What the player can do
  cost?: {            // Required resources
    food?: number;
    water?: number;
  };
  outcome: string;    // What happens when chosen
  foodChange?: number;     // Resource changes
  waterChange?: number;
  survivorChanges?: SurvivorChange[]; // Effects on survivors
}
```

### Content Validation

All AI-generated content goes through validation to ensure:

1. **Format correctness**: All required fields are present
2. **Game balance**: Resource costs and rewards are reasonable
3. **Narrative consistency**: Events align with game world and previous events
4. **Safety filters**: Content adheres to appropriate standards

## Development Considerations

### Error Handling

If the AI service fails or returns invalid content:

1. The game uses fallback events from a predefined pool
2. Error logging captures context for debugging
3. Players receive appropriate messaging without breaking immersion

### Throttling and Optimization

To manage API costs and latency:

1. Requests are batched when possible
2. Content is cached to reduce duplicate requests
3. Generation happens asynchronously with loading indicators
4. Fallback to pre-generated content is available when needed

### Testing

The AI integration includes:

1. **Unit tests**: Test the parsing and validation logic
2. **Mock tests**: Use predefined responses to test game reactions
3. **Integration tests**: Test the full request/response cycle with test API keys
4. **Prompt regression tests**: Ensure prompts consistently produce valid responses

## Future Improvements

Planned enhancements to the AI integration:

1. **Memory improvements**: Better tracking of narrative threads and player choices
2. **Character consistency**: More detailed modeling of NPC personalities 
3. **Adaptive difficulty**: Dynamic adjustment of challenges based on player performance
4. **Multi-modal content**: Integration of AI-generated visuals to match events
5. **Player language adaptation**: Matching the narrative style to player preferences

## Conclusion

The AI integration in Ashes of Time creates a dynamic narrative experience that responds to player choices and game state. By carefully structuring prompts and validating responses, the game maintains a consistent world while offering novel and engaging content for each playthrough. 