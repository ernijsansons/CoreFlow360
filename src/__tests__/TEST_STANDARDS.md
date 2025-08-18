# CoreFlow360 Test Standards Guide

## Error Handling Standards

### 1. Use Standard Error Helpers
```typescript
import { expectAsyncError, TestErrorMessages, createTestError } from '@/tests/utils/error-helpers'

// For async functions that should throw
await expectAsyncError(
  async () => await someAsyncFunction(),
  TestErrorMessages.UNAUTHORIZED
)

// For sync functions that should throw
expectSyncError(
  () => someSyncFunction(),
  'Expected error message'
)
```

### 2. Consistent Error Messages
Use predefined error messages from `TestErrorMessages`:
```typescript
// Good
throw new Error(TestErrorMessages.TENANT_MISMATCH)

// Bad
throw new Error('Cannot access other tenant data')
```

### 3. Mock Implementation Errors
```typescript
mockFunction.mockImplementation(async (args) => {
  if (!args.requiredField) {
    throw createTestError(
      TestErrorType.VALIDATION,
      TestErrorMessages.MISSING_REQUIRED_FIELD('requiredField')
    )
  }
  // ... implementation
})
```

### 4. Testing Error Responses
```typescript
// For API responses
const response = await apiCall()
validateErrorResponse(response, 403, TestErrorMessages.FORBIDDEN)

// For Prisma/database errors
await expect(
  prisma.model.create({ data: invalidData })
).rejects.toThrow(TestErrorMessages.VALIDATION_FAILED)
```

## Accessibility Standards

### 1. ARIA Attributes
- All interactive elements must have proper ARIA labels
- Use `aria-describedby` for additional context
- Ensure `aria-live` regions for dynamic content

### 2. Keyboard Navigation
- Test tab order
- Verify all interactive elements are keyboard accessible
- Test keyboard shortcuts

### 3. Screen Reader Support
- Verify heading hierarchy
- Check landmark regions
- Ensure form labels are properly associated

## Security Standards

### 1. No Hardcoded Secrets
- Use environment variables via `testConfig`
- Document required env vars in `.env.test.example`
- Never commit actual secrets

### 2. Input Validation
- Test all input boundaries
- Verify SQL injection prevention
- Check XSS protection

### 3. Authentication/Authorization
- Test role-based access
- Verify permission checks
- Test token validation

## Performance Standards

### 1. Test Timeouts
- Use appropriate timeouts for async operations
- Mock long-running operations
- Test timeout scenarios

### 2. Resource Cleanup
- Always clean up in `afterEach`
- Reset mocks between tests
- Clear timers and intervals

### 3. Parallel Testing
- Ensure tests can run in parallel
- No shared state between tests
- Use unique identifiers

## Code Quality Standards

### 1. Test Structure
```typescript
describe('Feature Name', () => {
  // Setup
  beforeEach(() => {
    // Test setup
  })

  afterEach(() => {
    // Cleanup
  })

  describe('Specific Functionality', () => {
    it('should do something specific', () => {
      // Arrange
      const input = setupTestData()
      
      // Act
      const result = performAction(input)
      
      // Assert
      expect(result).toBe(expected)
    })
  })
})
```

### 2. Naming Conventions
- Descriptive test names
- Use 'should' for test descriptions
- Group related tests with describe blocks

### 3. Mock Management
- Reset mocks in beforeEach/afterEach
- Use type-safe mocks
- Document mock behavior