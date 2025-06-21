# Contributing to Local Data Lister

Thank you for your interest in contributing to Local Data Lister! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team.

## Getting Started

### Prerequisites

- Node.js (v18.14.0 or higher)
- npm (v9.0.0 or higher)
- Git (v2.30.0 or higher)
- TypeScript knowledge
- React knowledge (for frontend contributions)

### Setup

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/Local-Data-Lister.git
   cd Local-Data-Lister
   ```
3. **Set up the development environment**

   ```bash
   # Backend setup
   cd backend
   npm install
   cp .env.example .env
   # Add your RAPIDAPI_KEY to .env

   # Frontend setup
   cd ../frontend
   npm install
   ```

4. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Branch Naming Convention

Use the following prefixes for branch names:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

Examples:

- `feature/user-authentication`
- `fix/search-bug`
- `docs/api-documentation`
- `refactor/component-structure`

### Commit Message Convention

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Types:

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

Examples:

```
feat: add user authentication system
fix(api): resolve search endpoint timeout issue
docs: update API documentation
test: add unit tests for search component
```

## Code Standards

### TypeScript

- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type - use proper typing
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUserById(id: string): Promise<User | null> {
  // Implementation
}

// Bad
function getUser(id: any): any {
  // Implementation
}
```

### React (Frontend)

- Use functional components with hooks
- Follow React best practices
- Use proper prop typing
- Implement proper error boundaries
- Use React.memo for performance optimization

```typescript
// Good
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={() => onEdit(user)}>Edit</button>
    </div>
  );
};

export default React.memo(UserCard);
```

### Node.js/Express (Backend)

- Use async/await for asynchronous operations
- Implement proper error handling
- Use middleware for common functionality
- Follow RESTful API design principles
- Implement proper logging

```typescript
// Good
app.get("/api/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    logger.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
```

### File Organization

- Use consistent file naming (kebab-case for files, PascalCase for components)
- Group related files in appropriate directories
- Keep files focused and single-purpose
- Use index files for clean imports

```
src/
├── components/
│   ├── UserCard/
│   │   ├── UserCard.tsx
│   │   ├── UserCard.test.tsx
│   │   └── index.ts
│   └── index.ts
├── hooks/
├── pages/
└── utils/
```

## Testing Guidelines

### Test Coverage Requirements

- **Backend**: Minimum 80% coverage
- **Frontend**: Minimum 70% coverage
- **Critical paths**: 100% coverage

### Writing Tests

#### Backend Tests (Jest)

```typescript
describe("User API", () => {
  describe("GET /api/users/:id", () => {
    it("should return user when valid ID is provided", async () => {
      const response = await request(app).get("/api/users/123").expect(200);

      expect(response.body).toHaveProperty("id", "123");
    });

    it("should return 404 when user not found", async () => {
      await request(app).get("/api/users/nonexistent").expect(404);
    });
  });
});
```

#### Frontend Tests (React Testing Library)

```typescript
describe("UserCard Component", () => {
  it("should render user information correctly", () => {
    const user = { id: "1", name: "John Doe", email: "john@example.com" };
    const onEdit = jest.fn();

    render(<UserCard user={user} onEdit={onEdit} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
  });

  it("should call onEdit when edit button is clicked", () => {
    const user = { id: "1", name: "John Doe", email: "john@example.com" };
    const onEdit = jest.fn();

    render(<UserCard user={user} onEdit={onEdit} />);

    fireEvent.click(screen.getByText("Edit"));
    expect(onEdit).toHaveBeenCalledWith(user);
  });
});
```

### Running Tests

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run test:coverage
```

## Pull Request Process

### Before Submitting

1. **Ensure tests pass**

   ```bash
   npm test
   npm run test:coverage
   ```

2. **Check code quality**

   ```bash
   npm run lint
   npm run format
   ```

3. **Update documentation** if needed

4. **Test your changes** thoroughly

### Pull Request Template

```markdown
## Description

Brief description of the changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows project standards
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design tested

## Screenshots (if applicable)

Add screenshots for UI changes

## Additional Notes

Any additional information
```

### Review Process

1. **Self-review** your changes
2. **Request review** from team members
3. **Address feedback** from reviewers
4. **Maintainer approval** required for merge
5. **Squash commits** if requested

## Issue Reporting

### Bug Reports

Use the bug report template and include:

- **Description** of the bug
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Environment** (OS, browser, Node.js version)
- **Screenshots** if applicable

### Feature Requests

Include:

- **Description** of the feature
- **Use case** and benefits
- **Proposed implementation** (if any)
- **Mockups** or examples

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention is needed

## Communication

### Team Communication

- **Daily standups** for progress updates
- **Weekly reviews** for code quality
- **Slack/Discord** for quick questions
- **GitHub Issues** for detailed discussions

### Code Reviews

- Be constructive and respectful
- Focus on the code, not the person
- Provide specific, actionable feedback
- Use inline comments for detailed explanations

## Getting Help

- Check existing documentation
- Search existing issues
- Ask in team chat
- Create a new issue if needed

## Recognition

Contributors will be recognized in:

- Project README
- Release notes
- Contributor hall of fame

Thank you for contributing to Local Data Lister! 🚀
