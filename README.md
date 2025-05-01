# Ashes of Time

A post-apocalyptic survival game built with Next.js and Gemini AI.

![Ashes of Time Game](https://via.placeholder.com/800x400?text=Ashes+of+Time)

## Project Overview

Ashes of Time is a narrative-driven survival game set in a post-apocalyptic world. Players must manage resources, make tough decisions, and try to survive as long as possible in a harsh environment.

### Key Features

- Resource management (food, water)
- Health and status effects for survivors
- Daily events with multiple choices
- Mini-games for hunting and gathering resources
- Companions that can be recruited to help
- Auto-save functionality

## Development Improvements

### TypeScript Implementation

- Migrated from JavaScript to TypeScript for better type safety
- Added comprehensive type definitions for game state, actions, and components
- Configured proper tsconfig.json for Next.js compatibility

### State Management

- Implemented React Context for global state management
- Split large reducer into smaller, more focused modules
- Added save/load game functionality using localStorage

### UI Enhancements

- Added framer-motion for smooth animations and transitions
- Created reusable animation components (FadeIn, AnimatedNumber)
- Improved responsiveness for various screen sizes
- Enhanced visual feedback for resource changes

### Code Quality Improvements

- Added Jest and React Testing Library for component testing
- Created sample tests for core components
- Implemented proper error handling throughout the application
- Added accessibility attributes for better screen reader support

### Build & Development Setup

- Added proper scripts for development, building, and testing
- Configured ESLint and TypeScript for better code quality
- Optimized package.json dependencies

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm build

# Start production server
npm start

# Run tests
npm test
```

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- TailwindCSS 4
- Framer Motion
- Gemini AI API for narrative generation
- Jest & React Testing Library

## Future Improvements

- Add more companions and interaction options
- Implement more mini-games for resource gathering
- Add sound effects and music
- Create more environment-specific events and challenges
- Offline support with ServiceWorker

## License

MIT
