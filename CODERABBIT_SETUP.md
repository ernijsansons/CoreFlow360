# CodeRabbit AI Code Review Setup

This guide will help you set up CodeRabbit AI-powered code review for the CoreFlow360 project.

## What is CodeRabbit?

CodeRabbit is an AI-powered code review tool that automatically analyzes your pull requests and provides intelligent feedback on:
- Code quality and maintainability
- Security vulnerabilities
- Performance optimizations
- Best practices
- Testing coverage
- Accessibility compliance

## Installation Steps

### 1. Install CodeRabbit GitHub App

1. **Visit CodeRabbit**: Go to [coderabbit.ai](https://coderabbit.ai)
2. **Sign in**: Click "Get Started" and authorize with your GitHub account
3. **Install App**: 
   - Select your GitHub account
   - Choose the `CoreFlow360` repository
   - Grant the necessary permissions

### 2. Configure Repository Settings

The repository is already configured with:
- `.coderabbit.yaml` - Main configuration file
- `.github/workflows/coderabbit.yml` - GitHub Actions workflow

### 3. Set Up API Keys (Optional)

For enhanced functionality, you can add these secrets to your GitHub repository:

1. Go to your repository settings
2. Navigate to "Secrets and variables" → "Actions"
3. Add the following secrets:
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `ANTHROPIC_API_KEY` - Your Anthropic API key
   - `CODERABBIT_API_KEY` - Your CodeRabbit API key

## Configuration Details

### Main Configuration (`.coderabbit.yaml`)

The configuration includes:

- **Review Settings**: Automatic review on all pull requests
- **AI Focus Areas**: Code quality, security, performance, best practices
- **Custom Instructions**: Tailored for CoreFlow360's AI-first ERP platform
- **Security Scanning**: Vulnerability detection, secrets scanning
- **Performance Analysis**: Bundle size checks, anti-pattern detection
- **Testing Suggestions**: Coverage analysis, missing test detection
- **Accessibility Checks**: WCAG compliance, screen reader compatibility

### GitHub Actions Workflow

The workflow automatically:
- Triggers on pull request creation/updates
- Runs AI code review
- Posts review comments
- Provides summary feedback

## Features

### 🔍 **Comprehensive Code Review**
- Inline comments on specific code lines
- Summary comments with overall assessment
- Constructive feedback with actionable suggestions

### 🛡️ **Security Scanning**
- Vulnerability detection
- Secrets and API keys exposure
- Dependency security analysis
- Input validation checks

### ⚡ **Performance Analysis**
- Bundle size impact assessment
- Performance anti-pattern detection
- Optimization suggestions
- Resource usage analysis

### 🧪 **Testing Focus**
- Test coverage analysis
- Missing test suggestions
- Test quality improvements
- Edge case identification

### ♿ **Accessibility Compliance**
- WCAG guidelines checking
- Screen reader compatibility
- Keyboard navigation support
- Color contrast analysis

### 🔧 **Language-Specific Rules**
- TypeScript strict mode enforcement
- React hooks rules compliance
- Next.js best practices
- Database migration validation

## Usage

### Automatic Review
Once installed, CodeRabbit will automatically:
1. Review every pull request
2. Add inline comments for issues
3. Provide summary feedback
4. Suggest improvements

### Manual Review
You can also trigger reviews manually:
1. Comment `/review` on any pull request
2. CodeRabbit will analyze the changes
3. Provide detailed feedback

### Custom Instructions
The AI is configured with custom instructions for CoreFlow360:
- Focus on AI-first ERP platform requirements
- Emphasize enterprise-grade security
- Consider scalability and performance
- Maintain high code quality standards

## Review Examples

### Code Quality Feedback
```
💡 **Suggestion**: Consider extracting this complex logic into a separate function for better maintainability.

```typescript
// Before
const processData = (data) => {
  // 50 lines of complex logic
}

// After
const validateInput = (data) => { /* validation logic */ }
const transformData = (data) => { /* transformation logic */ }
const processData = (data) => {
  const validated = validateInput(data);
  return transformData(validated);
}
```
```

### Security Feedback
```
⚠️ **Security Issue**: This API endpoint lacks input validation, which could lead to injection attacks.

**Recommendation**: Add comprehensive input validation:

```typescript
import { z } from 'zod';

const inputSchema = z.object({
  userId: z.string().uuid(),
  data: z.object({
    // define your schema
  })
});

export async function POST(request: Request) {
  const body = await request.json();
  const validated = inputSchema.parse(body);
  // process validated data
}
```
```

### Performance Feedback
```
🚀 **Performance**: This component re-renders unnecessarily. Consider using React.memo or useMemo.

```typescript
// Before
const ExpensiveComponent = ({ data }) => {
  const processed = expensiveOperation(data);
  return <div>{processed}</div>;
}

// After
const ExpensiveComponent = React.memo(({ data }) => {
  const processed = useMemo(() => expensiveOperation(data), [data]);
  return <div>{processed}</div>;
});
```
```

## Customization

### Modify Review Focus
Edit `.coderabbit.yaml` to change what the AI focuses on:

```yaml
ai:
  focus:
    - "code_quality"
    - "security"
    - "performance"
    # Add or remove focus areas
```

### Custom Rules
Add project-specific rules:

```yaml
custom_rules:
  - name: "Business Logic"
    pattern: "src/lib/business/**"
    instructions: "Review business logic for correctness and edge cases"
```

### Language-Specific Settings
Configure rules for specific languages:

```yaml
languages:
  typescript:
    strict: true
    no_any: true
```

## Troubleshooting

### Common Issues

1. **Review Not Triggering**
   - Check GitHub App installation
   - Verify repository permissions
   - Ensure workflow file is in `.github/workflows/`

2. **API Key Errors**
   - Verify API keys are correctly set in GitHub secrets
   - Check API key permissions and quotas

3. **Configuration Issues**
   - Validate YAML syntax in `.coderabbit.yaml`
   - Check file paths and patterns

### Support

- **Documentation**: [docs.coderabbit.ai](https://docs.coderabbit.ai)
- **GitHub Issues**: [github.com/coderabbitai/ai-pr-agent](https://github.com/coderabbitai/ai-pr-agent)
- **Community**: [discord.gg/coderabbit](https://discord.gg/coderabbit)

## Best Practices

### For Developers
1. **Review AI Feedback**: Always read and consider AI suggestions
2. **Address Critical Issues**: Fix security and performance issues promptly
3. **Learn from Patterns**: Use feedback to improve coding practices
4. **Ask Questions**: Use `/ask` command for clarification

### For Teams
1. **Set Expectations**: Define what feedback to prioritize
2. **Customize Rules**: Adapt to your team's coding standards
3. **Regular Reviews**: Use AI feedback for team learning
4. **Continuous Improvement**: Refine configuration based on feedback

## Integration with Existing Workflow

CodeRabbit integrates seamlessly with:
- **GitHub Pull Requests**: Automatic review on PR creation
- **GitHub Actions**: CI/CD pipeline integration
- **Code Quality Tools**: ESLint, Prettier, TypeScript
- **Security Tools**: Dependabot, CodeQL
- **Testing Tools**: Jest, Playwright, Vitest

## Next Steps

1. **Install the GitHub App** following the steps above
2. **Create a test PR** to see CodeRabbit in action
3. **Review the feedback** and address any issues
4. **Customize the configuration** based on your needs
5. **Share with your team** and establish review processes

---

*CodeRabbit will help maintain high code quality and catch issues early in the development process, ensuring CoreFlow360 remains a world-class AI-first ERP platform.*
