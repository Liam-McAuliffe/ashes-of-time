# Ashes of Time

A post-apocalyptic survival game built with Next.js, React 19, and AI-generated narrative content.

![Ashes of Time Game](https://via.placeholder.com/800x400?text=Ashes+of+Time)

## 🎮 Game Overview

Ashes of Time is a narrative-driven survival game set in a harsh post-apocalyptic world. Players must manage resources, make difficult decisions, and keep their group of survivors alive as long as possible in a brutal environment.

### 📜 Game Rules

1. **Resource Management**:
   - Food and water are consumed daily by each living survivor
   - If either resource reaches zero, it's game over
   - Resources can be acquired through events, hunting, and gathering

2. **Survival Mechanics**:
   - Each survivor has health, status effects, and may have companions
   - Status effects can be positive (Hopeful) or negative (Injured, Sick)
   - Companions provide bonuses (hunting yield, gathering success, healing)
   - When all survivors die, it's game over

3. **Daily Cycle**:
   - Each day brings a new event with multiple choices
   - Choices can cost resources and affect survivors 
   - After making a choice, the game advances to the next day
   - Per day, you can perform one hunting action and one gathering action

4. **Actions**:
   - **Hunting**: Mini-game that provides food
   - **Gathering Water**: Mini-game that provides water
   - Both actions cost health points from the survivor performing them

5. **Companions**:
   - Can be found through events
   - Provide specific bonuses to their paired survivor
   - Must be named when acquired

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test
```

## 🧰 Tech Stack

- **Next.js 15**: React framework with server components
- **React 19**: Core UI library
- **Redux Toolkit**: State management 
- **TypeScript**: Type safety
- **TailwindCSS 4**: Utility-first CSS
- **Framer Motion**: Animation library
- **AI Services**: For narrative generation (Gemini API)
- **Jest & React Testing Library**: Testing framework

## 🔧 Development Guidelines

### Project Structure

```
src/
├── app/               # Next.js app router
├── components/        # React components
│   ├── game/          # Game-specific components
│   └── ui/            # Reusable UI components
├── context/           # React contexts (e.g., Tooltip)
├── hooks/             # Custom React hooks
├── services/          # External services (AI, etc.)
├── store/             # Redux store
│   ├── slices/        # Redux slices
│   └── selectors/     # Redux selectors
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

### State Management

- Redux is used for global state management
- Game state is normalized with separate slices for different concerns
- Use selectors for accessing state to optimize rendering
- State persistence is handled with redux-persist

### Coding Standards

- Follow TypeScript best practices with proper typing
- Use functional components with hooks
- Implement memoization for performance optimization
- Maintain proper JSDoc comments for all functions and components
- Follow the container/presentational component pattern when possible

### Performance Considerations

- Use React.memo for components that render often but change rarely
- Implement virtualization for long lists (react-window)
- Use optimized context for tooltips and other UI elements
- Apply debouncing for events that fire frequently

## 🏗️ Architecture Overview

### Core Game Loop

1. The game begins with initial state (day 1, basic resources)
2. Every day, an event is fetched from the AI service with context
3. The player chooses an action, which triggers state updates
4. Resource costs/gains are applied and survivor statuses are updated
5. The game checks for game-over conditions
6. The day advances and the cycle repeats

### State Structure

- **Game State**: Day, resources, event text, choices, game status
- **Survivors**: List of survivors with health, statuses, companions
- **Event History**: Records of past events for context

### Key Components

- **EventDisplay**: Shows current event narrative
- **ChoiceList**: Displays available choices
- **SurvivorDisplay**: Shows survivor status
- **ResourceDisplay**: Shows current resources
- **Mini-games**: Interactive components for hunting and gathering

### External Services

- **AI Service**: Generates game events based on current game state
- Uses the Gemini API to create contextual events and choices

## 🧠 Design Principles

1. **Immersive Storytelling**: Focus on creating a compelling narrative
2. **Player Agency**: Meaningful choices with consequences
3. **Resource Tension**: Create interesting trade-offs between survival and risk
4. **Progressive Complexity**: Layer mechanics as the game progresses

## 🔄 Contribution Guidelines

1. Create feature branches from `main`
2. Follow the existing code style and structure
3. Add comprehensive tests for new features
4. Submit PRs with clear descriptions of changes
5. Ensure all tests pass before requesting review

## 📝 License

MIT
