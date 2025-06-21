# Coding Standards

This document outlines the coding standards and best practices for the Local Data Lister project.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript Standards](#typescript-standards)
- [React Standards](#react-standards)
- [Node.js/Express Standards](#nodejsexpress-standards)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Code Formatting](#code-formatting)
- [Documentation Standards](#documentation-standards)
- [Performance Guidelines](#performance-guidelines)
- [Security Guidelines](#security-guidelines)

## General Principles

### Code Quality

- **Readability**: Code should be self-documenting and easy to understand
- **Maintainability**: Code should be easy to modify and extend
- **Testability**: Code should be designed for easy testing
- **Performance**: Code should be efficient and optimized
- **Security**: Code should follow security best practices

### DRY Principle

Don't Repeat Yourself. Extract common functionality into reusable functions, components, or utilities.

### Single Responsibility Principle

Each function, component, or class should have one reason to change.

## TypeScript Standards

### Type Safety

- Use strict TypeScript configuration
- Avoid `any` type - use proper typing
- Use union types for multiple possible values
- Use generics for reusable components and functions

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
}

function getUserById<T extends User>(id: string): Promise<T | null> {
  // Implementation
}

// Bad
function getUser(id: any): any {
  // Implementation
}
```

### Interface Design

- Use interfaces for object shapes
- Use type aliases for unions and complex types
- Keep interfaces focused and cohesive

```typescript
// Good
interface ApiResponse<T> {
  data: T;
  status: "success" | "error";
  message?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

type UserResponse = ApiResponse<User>;

// Bad
interface UserApiResponse {
  data: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  message?: string;
}
```

### Error Handling

- Use proper error types
- Implement custom error classes
- Use try-catch blocks appropriately

```typescript
// Good
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new ApiError("User not found", 404);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Failed to fetch user", 500);
  }
}
```

## React Standards

### Component Structure

- Use functional components with hooks
- Keep components focused and single-purpose
- Use proper prop typing
- Implement proper error boundaries

```typescript
// Good
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  isLoading?: boolean;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const handleEdit = useCallback(() => {
    onEdit(user);
  }, [user, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(user.id);
  }, [user.id, onDelete]);

  if (isLoading) {
    return <UserCardSkeleton />;
  }

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <div className="user-card-actions">
        <button onClick={handleEdit}>Edit</button>
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};

export default React.memo(UserCard);
```

### Hooks Usage

- Use custom hooks for reusable logic
- Follow hooks naming convention (use prefix)
- Use proper dependency arrays
- Avoid infinite re-renders

```typescript
// Good
const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
};

// Bad
const useUser = (userId: string) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserById(userId).then(setUser);
    setLoading(false);
  }); // Missing dependency array

  return { user, loading };
};
```

### State Management

- Use local state for component-specific data
- Use context for shared state across components
- Use proper state updates
- Avoid prop drilling

```typescript
// Good
const UserContext = createContext<UserContextType | undefined>(undefined);

const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const addUser = useCallback((user: User) => {
    setUsers((prev) => [...prev, user]);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  }, []);

  const value = useMemo(
    () => ({
      users,
      loading,
      addUser,
      updateUser,
    }),
    [users, loading, addUser, updateUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
```

## Node.js/Express Standards

### API Design

- Follow RESTful principles
- Use proper HTTP status codes
- Implement proper error handling
- Use middleware for common functionality

```typescript
// Good
app.get("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        message: "Invalid user ID format",
      });
    }

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json(user);
  } catch (error) {
    logger.error("Error fetching user:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// Bad
app.get("/api/users/:id", (req, res) => {
  const id = req.params.id;
  getUserById(id).then((user) => {
    res.json(user);
  });
});
```

### Middleware Usage

- Use middleware for authentication, validation, logging
- Keep middleware focused and reusable
- Implement proper error handling in middleware

```typescript
// Good
const validateUser = (req: Request, res: Response, next: NextFunction) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: "Name and email are required",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  next();
};

const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Unhandled error:", error);

  res.status(500).json({
    message: "Internal server error",
  });
};

app.post("/api/users", validateUser, createUser);
app.use(errorHandler);
```

### Async/Await

- Use async/await for asynchronous operations
- Implement proper error handling
- Use Promise.all for parallel operations

```typescript
// Good
async function createUserWithProfile(userData: UserData) {
  try {
    const user = await createUser(userData);
    const profile = await createProfile(user.id, userData.profile);

    return { user, profile };
  } catch (error) {
    logger.error("Error creating user with profile:", error);
    throw new ApiError("Failed to create user", 500);
  }
}

// Parallel operations
async function fetchUserData(userId: string) {
  const [user, posts, followers] = await Promise.all([
    getUserById(userId),
    getUserPosts(userId),
    getUserFollowers(userId),
  ]);

  return { user, posts, followers };
}
```

## File Organization

### Directory Structure

```
src/
├── components/          # Reusable React components
│   ├── common/         # Shared components
│   ├── forms/          # Form components
│   └── layout/         # Layout components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── constants/          # Application constants
├── services/           # API services
└── styles/             # CSS/SCSS files
```

### File Naming

- Use kebab-case for file names
- Use PascalCase for component names
- Use descriptive names that indicate purpose

```
user-card.tsx           # Component file
use-user-data.ts        # Hook file
api-client.ts           # Service file
user-types.ts           # Type definitions
constants.ts            # Constants file
```

## Naming Conventions

### Variables and Functions

- Use camelCase for variables and functions
- Use descriptive names that indicate purpose
- Use boolean names that start with is, has, can, should

```typescript
// Good
const userList = [];
const isLoading = true;
const hasPermission = false;
const canEdit = true;

function getUserById(id: string) {}
function isValidEmail(email: string) {}
function shouldShowButton(condition: boolean) {}

// Bad
const ul = [];
const loading = true;
const permission = false;
const edit = true;

function get(id: string) {}
function valid(email: string) {}
function show(condition: boolean) {}
```

### Constants

- Use UPPER_SNAKE_CASE for constants
- Use descriptive names

```typescript
// Good
const API_BASE_URL = "https://api.example.com";
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT = 5000;

// Bad
const url = "https://api.example.com";
const max = 3;
const timeout = 5000;
```

### CSS Classes

- Use kebab-case for CSS class names
- Use BEM methodology for complex components

```css
/* Good */
.user-card {
}
.user-card__title {
}
.user-card__title--large {
}
.user-card__actions {
}

/* Bad */
.userCard {
}
.user_card {
}
.userCardTitle {
}
```

## Code Formatting

### ESLint Configuration

Use the following ESLint rules:

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "react/recommended",
    "react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Documentation Standards

### JSDoc Comments

- Use JSDoc for complex functions
- Document parameters, return values, and exceptions
- Keep comments up to date

```typescript
/**
 * Fetches a user by their ID from the API
 * @param id - The unique identifier of the user
 * @param options - Optional configuration for the request
 * @returns Promise that resolves to the user data or null if not found
 * @throws {ApiError} When the API request fails
 */
async function getUserById(
  id: string,
  options?: RequestOptions
): Promise<User | null> {
  // Implementation
}
```

### README Files

- Include setup instructions
- Document API endpoints
- Provide usage examples
- List dependencies and requirements

### Code Comments

- Use comments to explain why, not what
- Keep comments concise and relevant
- Update comments when code changes

```typescript
// Good
// Skip validation for admin users to improve performance
if (user.role === "admin") {
  return true;
}

// Bad
// Check if user is admin
if (user.role === "admin") {
  return true;
}
```

## Performance Guidelines

### React Performance

- Use React.memo for expensive components
- Use useMemo for expensive calculations
- Use useCallback for function props
- Avoid unnecessary re-renders

```typescript
// Good
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map((item) => expensiveProcessing(item));
  }, [data]);

  const handleUpdate = useCallback(
    (id: string) => {
      onUpdate(id);
    },
    [onUpdate]
  );

  return (
    <div>
      {processedData.map((item) => (
        <Item key={item.id} item={item} onUpdate={handleUpdate} />
      ))}
    </div>
  );
});
```

### Backend Performance

- Use connection pooling for databases
- Implement caching strategies
- Use pagination for large datasets
- Optimize database queries

```typescript
// Good
const getUsers = async (page: number, limit: number) => {
  const offset = (page - 1) * limit;

  const [users, total] = await Promise.all([
    db.query("SELECT * FROM users LIMIT ? OFFSET ?", [limit, offset]),
    db.query("SELECT COUNT(*) as total FROM users"),
  ]);

  return {
    users,
    total: total[0].total,
    page,
    totalPages: Math.ceil(total[0].total / limit),
  };
};
```

## Security Guidelines

### Input Validation

- Validate all user inputs
- Sanitize data before processing
- Use parameterized queries
- Implement rate limiting

```typescript
// Good
const validateUserInput = (data: any): UserData => {
  const { name, email, age } = data;

  if (!name || typeof name !== "string" || name.length < 2) {
    throw new ValidationError("Name must be at least 2 characters");
  }

  if (!email || !isValidEmail(email)) {
    throw new ValidationError("Invalid email format");
  }

  if (age && (typeof age !== "number" || age < 0 || age > 150)) {
    throw new ValidationError("Invalid age");
  }

  return { name, email, age };
};
```

### Authentication & Authorization

- Use secure authentication methods
- Implement proper session management
- Use HTTPS in production
- Validate user permissions

```typescript
// Good
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const requireRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};
```

### Data Protection

- Encrypt sensitive data
- Use environment variables for secrets
- Implement proper logging
- Follow GDPR compliance

```typescript
// Good
const encryptPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

## Conclusion

Following these coding standards ensures:

- **Consistency** across the codebase
- **Maintainability** for future development
- **Quality** and reliability
- **Security** and performance
- **Team collaboration** and code reviews

Remember to review and update these standards regularly as the project evolves.
