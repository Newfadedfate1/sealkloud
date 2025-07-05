# Testing Guide for SealKloud Helpdesk

This guide covers the testing infrastructure and best practices for the SealKloud Helpdesk application.

## 🧪 Testing Infrastructure

### Frontend Testing (React + TypeScript)
- **Framework**: Jest + React Testing Library
- **Location**: `src/` directory
- **Configuration**: `jest.config.js` (root)
- **Setup**: `src/setupTests.ts`

### Backend Testing (Node.js + Express)
- **Framework**: Jest + Supertest
- **Location**: `server/` directory
- **Configuration**: `server/jest.config.js`
- **Setup**: `server/__tests__/setup.js`

## 📁 Test Structure

```
├── src/
│   ├── components/
│   │   ├── Login/
│   │   │   └── __tests__/
│   │   │       └── LoginForm.test.tsx
│   │   └── Dashboard/
│   │       └── __tests__/
│   │           └── TicketTable.test.tsx
│   └── utils/
│       └── test-utils.tsx
├── server/
│   ├── __tests__/
│   │   ├── setup.js
│   │   └── auth.test.js
│   └── jest.config.js
└── jest.config.js
```

## 🚀 Running Tests

### Frontend Tests
```bash
# Run all frontend tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Backend Tests
```bash
# Navigate to server directory
cd server

# Run all backend tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Combined Testing
```bash
# Run both frontend and backend tests
npm run test:all
```

## 📝 Writing Tests

### Frontend Component Tests

#### Basic Structure
```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../utils/test-utils';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  const mockProps = {
    // Define mock props
  };

  beforeEach(() => {
    // Setup before each test
  });

  it('should render correctly', () => {
    render(<ComponentName {...mockProps} />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    render(<ComponentName {...mockProps} />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText('Updated Text')).toBeInTheDocument();
    });
  });
});
```

#### Testing Best Practices
1. **Use semantic queries** (getByRole, getByLabelText) over getByTestId
2. **Test user behavior** rather than implementation details
3. **Use waitFor** for asynchronous operations
4. **Mock external dependencies** (API calls, localStorage)
5. **Test accessibility** with keyboard navigation and screen readers

### Backend API Tests

#### Basic Structure
```javascript
const request = require('supertest');
const app = require('../app');

describe('API Endpoint', () => {
  beforeEach(() => {
    // Setup test database or mocks
  });

  it('should return correct response', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'test' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});
```

#### Testing Best Practices
1. **Mock database calls** to avoid test dependencies
2. **Test all HTTP methods** (GET, POST, PUT, DELETE)
3. **Validate request/response schemas**
4. **Test error conditions** and edge cases
5. **Use proper status codes** and error messages

## 🎯 Test Coverage Goals

### Frontend Coverage
- **Components**: 90%+
- **Utilities**: 95%+
- **Hooks**: 90%+
- **Overall**: 85%+

### Backend Coverage
- **Routes**: 90%+
- **Middleware**: 85%+
- **Utilities**: 95%+
- **Overall**: 85%+

## 🔧 Test Utilities

### Frontend Test Utils (`src/utils/test-utils.tsx`)
- Custom render function with providers
- Mock data (tickets, users)
- Common test helpers
- API mocking

### Backend Test Utils (`server/__tests__/setup.js`)
- Environment setup
- Database mocking
- Console output suppression
- Global test configuration

## 📊 Coverage Reports

After running tests with coverage, you can find reports in:
- **Frontend**: `coverage/` directory
- **Backend**: `server/coverage/` directory

Open `coverage/lcov-report/index.html` in your browser to view detailed coverage reports.

## 🐛 Debugging Tests

### Common Issues
1. **Async operations**: Use `waitFor` or `act`
2. **Mocking**: Ensure mocks are properly set up
3. **Environment**: Check test environment variables
4. **Cleanup**: Use `afterEach` to clean up state

### Debug Commands
```bash
# Run specific test file
npm test -- LoginForm.test.tsx

# Run tests with verbose output
npm test -- --verbose

# Run tests in debug mode
npm test -- --detectOpenHandles
```

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
      - run: cd server && npm ci && npm test
```

## 📚 Additional Resources

- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🎉 Next Steps

1. **Add more component tests** for all major components
2. **Implement E2E tests** using Playwright or Cypress
3. **Add performance tests** for critical user flows
4. **Set up visual regression testing** for UI components
5. **Implement contract testing** for API endpoints 