# 🔧 Vercel Environment Variables Setup

## Critical Environment Variables Required

Add these in **Vercel Dashboard → Project Settings → Environment Variables**:

### 1. **Database Configuration**
```bash
DATABASE_URL="file:./prisma/dev.db"
```

### 2. **Authentication**
```bash
NEXTAUTH_URL="https://coreflow360.vercel.app"
NEXTAUTH_SECRET="coreflow360-production-secret-key-32chars-minimum-security"
```

### 3. **Node Environment**
```bash
NODE_ENV="production"
```

## 🚀 Steps to Add Environment Variables in Vercel

1. Go to: https://vercel.com/dashboard
2. Select your **CoreFlow360** project
3. Click **Settings** tab
4. Click **Environment Variables** in sidebar
5. Click **Add New** for each variable above
6. Set **Environment** to: **Production**, **Preview**, and **Development**
7. Click **Save**

## 🔄 After Adding Variables

1. **Redeploy**: Go to **Deployments** tab
2. Click **⋯** next to latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## ✅ Verify Setup

After redeployment, test:
- Health check: `https://coreflow360.vercel.app/api/health`
- Should return: `{"status": "healthy", ...}`

## 🔑 Admin Login After Setup

```
Email: ernijs.ansons@gmail.com
Password: Ernijs121291!
URL: https://coreflow360.vercel.app/auth/signin
```