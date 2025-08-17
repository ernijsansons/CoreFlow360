# Vercel Environment Variables Setup

## Required Environment Variables

Add these to your Vercel project settings (Settings → Environment Variables):

### Core Variables (REQUIRED)
```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-key-min-32-characters-long
```

### API Keys (Add as needed)
```
# Claude API
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

# V0.dev API
V0_API_KEY=v1:MS3Gm5Vv3EG7dAuPajXm4NQk:oH3hIrFY63W8fi9PAxPQ1QwU

# GitHub Token (only if your app needs to access GitHub API)
GITHUB_TOKEN=ghp_YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
```

### Optional but Recommended
```
# Redis for caching
REDIS_URL=redis://default:password@host:6379

# Email service
EMAIL_FROM=noreply@yourdomain.com
RESEND_API_KEY=re_your_api_key

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
```

## How to Add in Vercel:

1. Go to your Vercel dashboard
2. Select your CoreFlow360 project
3. Go to Settings → Environment Variables
4. Add each variable with its value
5. Select which environments (Production, Preview, Development)
6. Click Save

## Important Notes:

- The GitHub Personal Access Token (GITHUB_TOKEN) is only needed if your application makes GitHub API calls
- For deployment, Vercel already has access to your repo through the GitHub integration
- Make sure NEXTAUTH_URL matches your actual Vercel domain
- Generate a secure NEXTAUTH_SECRET with: `openssl rand -base64 32`