# Testing Strategy

## Overview

Testing ensures the reliability and quality of the application. The project uses unit, integration, and end-to-end (E2E) tests.

## Tools Used

- **Backend:** Jest
- **Frontend:** React Testing Library, Cypress

## Types of Tests

- **Unit tests:** For data models, utility functions, and components
- **Integration tests:** For API endpoints and user flows
- **E2E tests:** For full user journeys (Cypress)

## How to Run Tests

### Backend

```sh
cd backend
npm test
```

### Frontend

```sh
cd frontend
npm test
```

### E2E (Frontend)

```sh
cd frontend
npx cypress open
```

## Coverage Goals

- Target: 80%+ for backend and frontend
