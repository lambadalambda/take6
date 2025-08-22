# 6 Nimmt! Web Game - Implementation Plan

## Current Status 🎯

### ✅ Completed
- **Core Game Engine**: Fully functional with TDD
- **AI Bots**: EasyBot (random) and SmartBot (strategic) implemented
- **UI Components**: All major components working with animations
- **Game Flow**: Complete single-player experience
- **State Management**: Zustand integration complete
- **Testing**: 176 tests passing
- **Major Refactor**: Cleaned up vestigial code, simplified architecture

### 🔶 In Progress / Partially Complete
- **Advanced Bot AI**: SmartBot is good but could use probability calculations
- **Polish**: Visual feedback done, but missing sound and full accessibility

### 📝 Remaining Tasks
1. **Sound Effects**: Add audio feedback for card placement, penalties, etc.
2. **Accessibility**: 
   - Keyboard navigation
   - Screen reader support
   - High contrast mode
3. **Advanced AI Features**:
   - Probability calculations for opponent hands
   - Better opponent modeling
4. **E2E Testing**: Playwright tests for full game flows
5. **Cross-browser Testing**: Verify on Safari, Firefox, Edge
6. **Performance**: Bundle size optimization (currently functional but not optimized)

### 🚀 Future Enhancements (Phase 5+)
- Multiplayer support with WebSocket
- Different player counts (2-10 players)
- Tournament mode
- Statistics tracking
- Mobile app

## Project Overview
A browser-based implementation of the 6 Nimmt! card game featuring single-player mode against 3 AI opponents, with architecture supporting future multiplayer capabilities.

## Technology Stack

### Core Technologies
- **Framework**: React 19 + Next.js 15 (App Router)
  - Rationale: Excellent ecosystem, strong TypeScript support, built-in optimizations, easy deployment
  - React 19's new features: improved performance, better suspense
  - Server Components ready for future multiplayer backend
  - Built-in API routes for future WebSocket/REST endpoints
  - Turbopack for faster builds
- **Language**: TypeScript
  - Type safety for game logic and better IDE support
- **State Management**: Zustand
  - Lightweight, TypeScript-friendly, works great with React
  - Simple API, no boilerplate, excellent devtools
- **Styling**: Tailwind CSS + CSS Modules
  - Rapid prototyping with utility classes, component-specific styles with modules
- **Testing**: 
  - Jest + React Testing Library for unit/component tests
  - Playwright for E2E tests
  - Testing utilities for hooks and state management

### Future Backend (Phase 2)
- **Runtime**: Node.js with Express or Fastify
- **WebSocket**: Socket.io for real-time multiplayer
- **Database**: PostgreSQL or MongoDB for game history/user data

## Architecture Design

### Directory Structure
```
take6/
├── src/
│   ├── engine/           # Core game logic (framework-agnostic)
│   │   ├── game.ts       # Main game engine
│   │   ├── card.ts       # Card model and utilities
│   │   ├── player.ts     # Player model
│   │   ├── board.ts      # Game board logic
│   │   ├── rules.ts      # Rule validation
│   │   └── types.ts      # TypeScript types/interfaces
│   ├── ai/               # Bot implementations
│   │   ├── bot.ts        # Base bot interface
│   │   ├── easyBot.ts    # Random moves
│   │   ├── mediumBot.ts  # Basic strategy
│   │   └── hardBot.ts    # Advanced strategy
│   ├── components/       # React components
│   │   ├── GameBoard.tsx
│   │   ├── PlayerHand.tsx
│   │   ├── CardRow.tsx
│   │   ├── Card.tsx
│   │   └── ScoreBoard.tsx
│   ├── stores/           # State management
│   │   └── gameStore.ts
│   ├── utils/            # Helper functions
│   └── app/              # Next.js app directory
│       ├── layout.tsx
│       ├── page.tsx
│       └── globals.css
├── tests/
│   ├── unit/            # Unit tests for engine & AI
│   ├── component/       # Component tests
│   └── e2e/             # End-to-end tests
├── docs/
│   ├── rules.md
│   ├── plan.md
│   └── architecture.md
└── package.json
```

### Core Design Patterns

#### 1. Game Engine (Model)
- **Immutable State**: Game state is immutable, all changes return new state
- **Command Pattern**: All game actions as commands (for undo/replay support)
- **Event-Driven**: Emit events for game state changes
- **Pure Functions**: Game logic as pure functions for easy testing

#### 2. Separation of Concerns
- Engine layer: Pure game logic, no UI dependencies
- AI layer: Separate bot strategies, pluggable architecture
- Presentation layer: UI components only handle display/interaction
- State layer: Centralized state management

## Implementation Phases

### Phase 1: Core Game Engine (Week 1)
**TDD Approach - Write tests first!**

1. **Card System** (Day 1) ✅
   - [x] Card class with number and penalty points
   - [x] Deck creation and shuffling
   - [x] Card comparison utilities
   - Tests: Card creation, penalty calculation, deck integrity

2. **Board Logic** (Day 2) ✅
   - [x] Row management (4 rows, max 5 cards each)
   - [x] Card placement rules
   - [x] Row taking logic (6th card, too-low card)
   - Tests: Valid placements, row overflow, edge cases

3. **Game Flow** (Day 3) ✅
   - [x] Game initialization
   - [x] Round management
   - [x] Turn resolution (simultaneous reveal, ordered placement)
   - [x] Scoring system
   - Tests: Full game scenarios, scoring accuracy

4. **Player Management** (Day 4) ✅
   - [x] Player model (hand, score, selected card)
   - [x] Action validation
   - [x] Turn management
   - Tests: Player actions, hand management

### Phase 2: AI Implementation (Week 1-2)
**TDD Approach - Define bot behavior through tests**

1. **Bot Interface** (Day 5) ✅
   - [x] Abstract bot class
   - [x] Decision-making interface
   - [x] Game state analysis utilities

2. **Easy Bot** (Day 5) ✅
   - [x] Random valid card selection
   - [x] Random row selection when needed (automatic now)
   - Tests: Always returns valid moves

3. **Medium Bot** (Day 6) ✅ (SmartBot implemented)
   - [x] Avoid being 6th card
   - [x] Prefer rows with fewer penalties
   - [x] Basic card value assessment
   - Tests: Strategic decision validation

4. **Hard Bot** (Day 7) 🔶 (Partially - SmartBot has advanced strategy)
   - [x] Card counting (track played cards)
   - [ ] Probability calculations
   - [ ] Opponent hand estimation
   - [x] Minimax-style lookahead (simplified version)
   - Tests: Optimal play scenarios

### Phase 3: UI Development (Week 2)

1. **Base Components** (Day 8-9) ✅
   - [x] Card component with animations
   - [x] Row display with card positioning
   - [x] Player hand with selection
   - [x] Score display

2. **Game Flow UI** (Day 10) ✅
   - [x] Game initialization screen
   - [x] Turn phases visualization
   - [x] Animation system for card movements
   - [x] Victory/defeat screens

3. **Polish** (Day 11) 🔶 (Partially complete)
   - [ ] Sound effects
   - [x] Visual feedback for actions
   - [x] Responsive design (basic)
   - [ ] Accessibility features

### Phase 4: Integration & Testing (Week 2-3)

1. **Integration** (Day 12) ✅
   - [x] Connect engine to UI
   - [x] State management setup
   - [x] Bot integration

2. **Testing** (Day 13) ✅
   - [ ] E2E test scenarios
   - [x] Unit testing (176 tests passing!)
   - [ ] Cross-browser testing

3. **Optimization** (Day 14) ✅
   - [x] Bundle optimization (Next.js handles this)
   - [x] Performance profiling (basic)
   - [x] Code review and refactoring (major refactor completed)

## Bot Strategy Details

### Easy Bot
```typescript
// Pseudo-code
selectCard() {
  return randomChoice(hand);
}
```

### Medium Bot
```typescript
// Pseudo-code
selectCard() {
  // Avoid cards that would be 6th in a row
  const safeCards = hand.filter(card => !wouldBe6thCard(card));
  if (safeCards.length > 0) return randomChoice(safeCards);
  
  // Otherwise, choose card that goes to row with fewest penalties
  return cardWithLeastPenaltyRisk(hand);
}
```

### Hard Bot
```typescript
// Pseudo-code
selectCard() {
  // Consider all possible outcomes
  const outcomes = simulateAllCards(hand);
  
  // Factor in opponent likely moves
  const opponentMoves = predictOpponentCards();
  
  // Choose card with best expected value
  return minimaxDecision(outcomes, opponentMoves);
}
```

## Testing Strategy

### Unit Tests (Engine & AI)
- Each game rule as a test case
- Edge cases (empty rows, all cards too low, etc.)
- Bot decision validation
- Performance benchmarks

### Component Tests
- Component rendering
- User interactions
- State updates
- Animation triggers

### E2E Tests
- Complete game flow
- Bot games to completion
- UI responsiveness
- Error handling

## Future Enhancements (Phase 5+)

### Multiplayer Support
- WebSocket integration
- Room/lobby system
- Spectator mode
- Chat functionality

### Features
- Different player counts (2-10)
- Tournament mode
- Statistics tracking
- Replay system
- Custom rule variants
- Mobile app (React Native/Capacitor)

### Monetization (Optional)
- Cosmetic card backs
- Avatar customization
- Premium bot opponents
- Ad-supported free tier

## Development Setup

### Prerequisites
```bash
# Node.js 18+ required
node --version

# Create Next.js project
npx create-next-app@latest take6-game --typescript --tailwind --app --no-src-dir

# Install additional dependencies
npm install zustand
npm install -D @testing-library/react @testing-library/jest-dom jest-environment-jsdom
```

### Commands
```bash
# Development
npm run dev          # Start Next.js dev server (with Turbopack: npm run dev --turbo)
npm run test        # Run tests
npm run test:watch  # TDD mode
npm run lint        # Code linting
npm run type-check  # TypeScript checking

# Production
npm run build       # Build for production
npm run start       # Start production server
```

## Key Implementation Considerations

1. **State Management**: Keep game state centralized and immutable
2. **Animation Timing**: Ensure animations don't block game logic
3. **Bot Thinking Time**: Add artificial delay for bot moves (UX)
4. **Accessibility**: Keyboard navigation, screen reader support
5. **Performance**: Lazy load components, optimize re-renders
6. **Error Handling**: Graceful degradation, error boundaries
7. **Browser Support**: Test on Chrome, Firefox, Safari, Edge

## Success Metrics

- [ ] Game completes without errors
- [ ] Bots provide appropriate challenge levels
- [ ] UI is responsive and intuitive
- [ ] Performance: <100ms response time for actions
- [ ] Test coverage: >80% for engine, >60% overall
- [ ] Bundle size: <500KB initial load

## Timeline Summary

- **Week 1**: Core engine + Basic AI (TDD)
- **Week 2**: UI development + Advanced AI
- **Week 3**: Integration, testing, and polish
- **Week 4+**: Future enhancements

## Next Steps

1. Review and approve this plan
2. Set up project with chosen framework
3. Begin TDD implementation of game engine
4. Iterate based on testing and feedback