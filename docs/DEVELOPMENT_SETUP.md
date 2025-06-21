# Development Setup Guide

## Prerequisites

Before setting up the Local Data Lister project, ensure you have the following installed:

- **Node.js** (v18.14.0 or higher)
- **npm** (v9.0.0 or higher)
- **Git** (v2.30.0 or higher)
- **TypeScript** (v5.0.0 or higher)

## Project Structure

```
Local-Data-Lister/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── index.ts        # Main server file
│   │   └── logger.ts       # Winston logging
│   ├── tests/              # Backend tests
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React TypeScript application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── main.tsx        # App entry point
│   ├── public/             # Static assets
│   ├── package.json
│   └── tsconfig.json
├── shared/                 # Shared TypeScript types
│   └── types.ts
└── docs/                   # Project documentation
```

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Local-Data-Lister
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your RAPIDAPI_KEY

# Run development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

### Backend (.env)

```env
# API Configuration
RAPIDAPI_KEY=your_rapidapi_key_here
PORT=3001

# Logging
LOG_LEVEL=info
NODE_ENV=development
```

### Frontend (.env)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001
VITE_APP_NAME=Local Data Lister
```

## Development Workflow

### 1. Starting Development Servers

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### 2. Running Tests

**Backend Tests:**

```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Run tests with coverage
```

**Frontend Tests:**

```bash
cd frontend
npm test                   # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage
```

### 3. Code Quality

**Backend:**

```bash
cd backend
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
```

**Frontend:**

```bash
cd frontend
npm run lint              # Run ESLint
npm run format            # Format code with Prettier
```

## Database Setup

This project uses external APIs (RapidAPI) for data, so no local database setup is required.

## API Configuration

### RapidAPI Setup

1. Sign up at [RapidAPI](https://rapidapi.com)
2. Subscribe to "Search Nearby Places" API
3. Get your API key
4. Add the key to your `.env` file

### API Endpoints

- `GET /api/nearby` - Get nearby places
  - Query params: `latitude`, `longitude`, `keyword`
  - Returns: Array of nearby places

## Troubleshooting

### Common Issues

**Backend won't start:**

- Check if port 3001 is available
- Verify RAPIDAPI_KEY is set in .env
- Ensure all dependencies are installed

**Frontend won't start:**

- Check if port 5173 is available
- Verify all dependencies are installed
- Check for TypeScript errors

**API calls failing:**

- Verify RAPIDAPI_KEY is valid
- Check network connectivity
- Ensure backend server is running

**Tests failing:**

- Run `npm install` to ensure all dependencies
- Check if test environment variables are set
- Verify test data files exist

### Debug Mode

**Backend Debug:**

```bash
cd backend
DEBUG=* npm run dev
```

**Frontend Debug:**

```bash
cd frontend
npm run dev -- --debug
```

## IDE Configuration

### VS Code Extensions (Recommended)

- **TypeScript and JavaScript Language Features**
- **ESLint**
- **Prettier - Code formatter**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Performance Monitoring

### Backend Monitoring

- Winston logging for request/response tracking
- Error monitoring and reporting
- API response time monitoring

### Frontend Monitoring

- React DevTools for component performance
- Network tab for API call monitoring
- Lighthouse for performance audits

## Security Considerations

- API keys are stored in environment variables
- CORS is configured for development
- Input validation on all API endpoints
- Rate limiting for API calls
- HTTPS required for production

## Next Steps

After setup, you can:

1. Run the development servers
2. Test the API endpoints
3. Explore the frontend application
4. Run the test suite
5. Start contributing to the project
