# Local Data Lister

## Testing Setup

### 1. Unit & Integration Tests (Jest)

- Run all tests:
  ```sh
  npm test
  ```
- Run tests in watch mode:
  ```sh
  npm run test:watch
  ```
- Run tests with coverage:
  ```sh
  npm run test:coverage
  ```

### 2. Frontend Component Tests (React Testing Library)

- Place tests in `src/` or `tests/` directories with `.test.tsx` or `.test.ts` extensions.
- Custom matchers are available via `@testing-library/jest-dom`.

### 3. End-to-End (E2E) Tests (Cypress)

- Open Cypress UI:
  ```sh
  npm run cypress:open
  ```
- Run Cypress tests in headless mode:
  ```sh
  npm run cypress:run
  ```
- E2E specs go in `cypress/e2e/`.

### 4. Test Data

- Place reusable test data in `tests/` or as fixtures in `cypress/fixtures/`.

### 5. Configuration

- Jest config: `jest.config.js`
- Cypress config: `cypress.config.js`
- TypeScript config: `tsconfig.json`

---

For more details, see the TODO.md and individual config files.
