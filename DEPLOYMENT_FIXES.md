# 🚨 CoreFlow360 Deployment Fixes

## 🚨 **CRITICAL ISSUES TO FIX**

### **Issue 1: Internal Server Error on Signup**
**Problem**: "Internal server error" when creating account
**Root Cause**: Missing environment variables in Vercel

### **Issue 2: Domain Configuration**
**Problem**: 404 errors on custom domain
**Root Cause**: DNS not properly configured

## 🔧 **IMMEDIATE FIXES**

### **Step 1: Fix Environment Variables**

Go to **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

**Add these EXACT variables:**

```bash
# Database (CRITICAL)
DATABASE_URL="postgresql://postgres:Ernijs121291!@db.hoopabvygbofvptnlyzj.supabase.co:5432/postgres"

# Authentication (CRITICAL)
NEXTAUTH_URL="https://coreflow360.com"
NEXTAUTH_SECRET="your-32-character-secret-here"

# Environment
NODE_ENV="production"
```

**Generate NEXTAUTH_SECRET:**
```bash
# Run this command to generate a secure secret
openssl rand -base64 32
```

### **Step 2: Test Environment Variables**

After adding environment variables, test them:

1. **Test URL**: `https://coreflow360.com/api/test-env`
2. **Expected Response**:
```json
{
  "status": "success",
  "environment": {
    "NODE_ENV": "production",
    "DATABASE_URL": "SET",
    "NEXTAUTH_URL": "https://coreflow360.com",
    "NEXTAUTH_SECRET": "SET"
  },
  "database": "connected"
}
```

### **Step 3: Fix Domain Configuration**

#### **Option A: Use Vercel URL (Immediate)**
Your app works at: `https://core-flow360-v3makhj3a-ernijsansons-projects.vercel.app`

#### **Option B: Fix Custom Domain**

1. **In Vercel Dashboard**:
   - Go to **Settings** → **Domains**
   - Remove `www.coreflow360.com`
   - Add `coreflow360.com` (without www)

2. **In Domain Registrar**:
   Add these DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.19.76
   TTL: 3600
   ```

3. **Wait 24-48 hours** for DNS propagation

## 🧪 **TESTING CHECKLIST**

### **Before Testing**
- [ ] Environment variables added to Vercel
- [ ] Database connection verified
- [ ] Domain configuration updated

### **Test URLs**
1. **Health Check**: `https://coreflow360.com/api/health`
2. **Environment Test**: `https://coreflow360.com/api/test-env`
3. **Landing Page**: `https://coreflow360.com`
4. **Signup Page**: `https://coreflow360.com/auth/signup`

### **Expected Results**
- ✅ Health check returns "healthy"
- ✅ Environment test shows all variables "SET"
- ✅ Landing page loads without 404
- ✅ Signup form works without "Internal server error"

## 🚀 **DEPLOYMENT COMMANDS**

### **Redeploy After Environment Variables**
```bash
# Commit and push changes
git add .
git commit -m "Add environment test endpoint"
git push origin master
```

### **Verify Deployment**
1. Check Vercel dashboard for successful build
2. Test all endpoints listed above
3. Verify signup functionality works

## 🔍 **TROUBLESHOOTING**

### **If Still Getting Internal Server Error**
1. **Check Vercel Logs**: Go to **Functions** tab in Vercel dashboard
2. **Verify DATABASE_URL**: Test connection manually
3. **Check NEXTAUTH_SECRET**: Ensure it's 32+ characters
4. **Test Database**: Run `npx prisma db push` locally

### **If Domain Still Shows 404**
1. **Use Vercel URL**: `https://core-flow360-v3makhj3a-ernijsansons-projects.vercel.app`
2. **Check DNS**: Use https://dnschecker.org
3. **Wait Longer**: DNS changes can take 48+ hours
4. **Contact Support**: If issues persist

## 📞 **SUPPORT RESOURCES**

### **Vercel Support**
- **Documentation**: https://vercel.com/docs
- **Community**: https://github.com/vercel/vercel/discussions
- **Status**: https://vercel-status.com

### **Database Support**
- **Supabase**: Check connection in Supabase dashboard
- **Prisma**: https://www.prisma.io/docs

---

## 🎯 **IMMEDIATE ACTION PLAN**

1. **Add environment variables to Vercel** (CRITICAL)
2. **Test with Vercel URL** (Immediate access)
3. **Fix domain configuration** (24-48 hour process)
4. **Verify all functionality** (After environment variables)

**Your app is working - we just need to configure it properly!** 🚀
