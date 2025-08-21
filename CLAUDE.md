# Project Preferences and Guidelines

## Programming Style
- **Functional Programming**: Prefer functional programming over OOP
  - Use pure functions instead of classes
  - Use types/interfaces instead of classes
  - Favor immutability and function composition

## Development Approach
- **Test-Driven Development (TDD)**: Strict TDD methodology
  1. Write tests first
  2. Create skeleton functions that return neutral elements (e.g., empty arrays, false, 0)
  3. Run tests to see meaningful failures
  4. Implement the actual logic
  5. Ensure all tests pass
  6. Refactor if needed

## Version Control
- **Small, Frequent Commits**: Keep commits focused and atomic
  - Commit after each completed feature/module
  - Don't batch multiple features in one commit
  - Use descriptive commit messages

## Technology Stack
- **Framework**: React 19 + Next.js 15 (not Vue)
- **Language**: TypeScript
- **State Management**: Zustand
- **Testing**: Jest + React Testing Library
- **Styling**: Tailwind CSS

## Testing Requirements
- Always run tests before committing
- Aim for high test coverage (80%+ for engine code)
- Write comprehensive tests covering edge cases
- Use the test:watch mode during development

## Code Quality
- Run linting and type checking before commits:
  - `npm run lint`
  - `npm run type-check`