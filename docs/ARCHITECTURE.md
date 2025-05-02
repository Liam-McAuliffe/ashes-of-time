# Ashes of Time - Architecture Documentation

This document provides a detailed explanation of the architecture and implementation details of the Ashes of Time game.

## Table of Contents

1. [System Overview](#system-overview)
2. [State Management](#state-management)
3. [Component Structure](#component-structure)
4. [Game Logic](#game-logic)
5. [AI Integration](#ai-integration)
6. [Performance Optimizations](#performance-optimizations)
7. [Data Flow](#data-flow)
8. [Testing Strategy](#testing-strategy)

## System Overview

Ashes of Time is a React-based game built with Next.js 15 and Redux Toolkit. The application uses a component-based architecture with hooks for state management and side effects.

### Key Technologies

- **Next.js 15**: For server-side rendering and routing
- **React 19**: Core UI library with hooks
- **Redux Toolkit**: For centralized state management
- **TypeScript**: For static type checking
- **TailwindCSS**: For responsive UI styling
- **Framer Motion**: For animations and transitions

### Folder Structure

```
src/
├── app/                 # Next.js app router components
│   ├── api/             # API routes for backend functionality
│   ├── page.tsx         # Main game page component
│   ├── layout.tsx       # Root layout component
│   └── providers.tsx    # Provider wrappers
├── components/          # React components
│   ├── game/            # Game-specific components
│   └── ui/              # Reusable UI components
├── context/             # React contexts
├── hooks/               # Custom React hooks
├── services/            # External services (AI, API)
├── store/               # Redux store
│   ├── slices/          # Redux slices
│   └── selectors/       # Redux selectors
├── types/               # TypeScript types
└── utils/               # Utility functions
```

## State Management

The game uses Redux Toolkit for global state management, with a normalized structure for efficiency and maintainability.

### Redux Store Structure

#### Game Slice

The primary slice handles the main game state:
- Day counter
- Resources (food, water)
- Event text and choices
- Loading and error states
- Game over condition

#### Game State Interface

```typescript
interface GameState {
  day: number;
  food: number;
  water: number;
  survivors: Survivor[];
  foodChange: number;
  waterChange: number;
  eventText: string;
  currentChoices: GameChoice[] | null;
  lastOutcome: string;
  isLoading: boolean;
  error: string | null;
  isGameOver: boolean;
  gameOverMessage: string;
  isNamingCompanion: boolean;
  companionToNameInfo: { survivorId: string; companion: Companion } | null;
  theme: string;
  eventHistory: EventHistoryEntry[];
  huntPerformedToday: boolean;
  gatherPerformedToday: boolean;
}
```

### State Persistence

Game state is persisted using redux-persist to allow players to continue their game across browser sessions.

## Component Structure

The application follows a modular component architecture with a mix of container and presentational components.

### Core Game Components

1. **GamePage**: Main container component that orchestrates the game
2. **EventDisplay**: Shows the current event narrative
3. **ChoiceList**: Displays available choices with costs
4. **SurvivorDisplay**: Shows the status of all survivors
5. **ResourceDisplay**: Shows current resource levels
6. **PlayerActions**: Provides access to hunting and gathering activities

### Mini-Games

1. **HuntingMiniGame**: Interactive game for acquiring food
2. **GatherWaterMiniGame**: Interactive game for acquiring water

### UI Components

1. **Tooltip**: Enhanced tooltip implementation with performance optimizations
2. **AnimatedNumber**: Animated counter for resource changes
3. **ActorSelectionModal**: Modal for selecting survivors for actions

## Game Logic

The core game logic is implemented in utility functions and Redux slice reducers.

### Key Game Mechanics

1. **Event Generation**: AI-generated events based on game state
2. **Choice Resolution**: Applying the effects of player choices
3. **Resource Management**: Tracking and consuming resources
4. **Status Effects**: Applying and removing status effects on survivors
5. **Game Over Conditions**: Checking for game-ending conditions

### Status Effects System

Status effects can be positive or negative and affect gameplay:

- Dehydrated: Increased water consumption
- Malnourished: Small health drain
- Injured: Passive health loss
- Companion Bond: Health regeneration

## AI Integration

The game uses AI to generate contextual events and narrative content.

### AI Service

The aiService module interfaces with the Gemini API to generate game events. It sends the current game state as context and receives narrative text and possible choices.

```typescript
interface PromptContext {
  day: number;
  food: number;
  water: number;
  survivors: Survivor[];
  theme: string;
  eventHistory: EventHistoryEntry[];
}

interface EventResponse {
  text: string;
  choices: GameChoice[];
}
```

### Context-Aware Generation

The AI service receives the current game state as context, including:
- Current day
- Available resources
- Survivor statuses
- Recent event history
- Game theme

This allows the AI to generate cohesive narrative that responds to the player's situation.

## Performance Optimizations

Several optimizations ensure smooth gameplay:

### Component Memoization

- React.memo for components that render frequently but change rarely
- useMemo for expensive calculations
- useCallback for stable event handlers

### Virtualization

- react-window for rendering long lists efficiently
- Only rendering visible items in scrollable containers

### Tooltip Optimization

- Context-based tooltip system to prevent unnecessary re-renders
- Debouncing for hover events to reduce render thrashing
- Proper cleanup of event listeners and timeouts

## Data Flow

The game follows a unidirectional data flow pattern:

1. **User Interaction**: Player selects a choice or performs an action
2. **Action Dispatch**: Action is dispatched to the Redux store
3. **State Update**: Reducers update the game state
4. **Re-render**: UI components react to state changes
5. **Side Effects**: Thunks handle async operations (e.g., AI event generation)

### Example Flow: Making a Choice

1. Player clicks a choice in the ChoiceList component
2. The `applyChoice` action is dispatched
3. The reducer applies resource costs and survivor changes
4. The game state is updated with the choice outcome
5. The UI reflects the new state (resources, survivor status)
6. The `fetchEvent` thunk is dispatched to get the next event

## Testing Strategy

The application uses Jest and React Testing Library for testing.

### Test Categories

1. **Unit Tests**: Testing individual utility functions and hooks
2. **Component Tests**: Testing React components in isolation
3. **Integration Tests**: Testing component interactions
4. **Redux Tests**: Testing reducers, actions, and selectors

### Testing Approaches

- Mock AI service responses for deterministic tests
- Test game logic with predefined game states
- Simulate user interactions to test component behavior
- Use snapshot testing for UI stability 