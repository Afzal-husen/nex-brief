# Testing Patterns

**Analysis Date:** 2026-09-09

## Test Framework

**Current Status:**
- Neither the frontend nor the backend currently has automated testing frameworks installed or configured.
- No test files exist in the repository at present.

**Frontend Setup (Recommended):**
- Runner: Vitest or Jest with React Testing Library.
- E2E: Playwright for full user-flow browser testing.
- Commands to introduce:
  ```bash
  npm test                 # Run unit/integration tests
  npm run test:watch       # Watch mode
  npm run test:e2e         # End-to-end tests
  ```

**Backend Setup (Recommended):**
- Runner: `pytest` with `pytest-asyncio` (if async framework like FastAPI is chosen).
- Commands to introduce:
  ```bash
  pytest                   # Run test suite
  pytest -v                # Verbose mode
  pytest --cov             # Test coverage
  ```

## Test File Organization

**Frontend Conventions (to establish):**
- Unit & component tests colocated with source:
  ```
  src/
    components/
      button.tsx
      button.test.tsx
  ```
- E2E tests in a dedicated root directory:
  ```
  tests/
    auth.spec.ts
    home.spec.ts
  ```

**Backend Conventions (to establish):**
- Dedicated `backend/tests/` directory:
  ```
  backend/
    tests/
      test_main.py
      test_api.py
  ```

## Mocking & Fixtures

- Frontend: MSW (Mock Service Worker) for API network mocking or `vi.fn()` / `jest.fn()`.
- Backend: `unittest.mock` or `pytest-mock` fixtures.

---

*Testing analysis: 2026-09-09*
*Update as test harnesses and suites are implemented*
