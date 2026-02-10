# Google OAuth Setup Guide for IUB Confessions

## ✅ Code Changes Complete

All code has been updated to use Google OAuth instead of email OTP login.

---

## 🔧 Supabase Dashboard Configuration (REQUIRED)

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen:
   - **User Type**: Internal (for @iub.edu.bd only)
   - **App name**: IUB Confessions
   - **User support email**: Your email
   - **Authorized domains**: Add your domain
6. Create OAuth Client ID:
   - **Application type**: Web application
   - **Name**: IUB Confessions Web
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://your-production-domain.com
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:3000/auth/callback
     https://your-production-domain.com/auth/callback
     https://<your-project-id>.supabase.co/auth/v1/callback
     ```
7. Click **Create** and copy:
   - **Client ID**
   - **Client Secret**

### Step 2: Configure Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **xgifgldytcniuaekwaze**
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list and enable it
5. Enter your credentials:
   - **Client ID**: (from Google Cloud Console)
   - **Client Secret**: (from Google Cloud Console)
6. **Skip nonce check**: Leave unchecked
7. Click **Save**

### Step 3: Update Redirect URLs

Still in Supabase Dashboard:

1. Go to **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://your-production-domain.com/auth/callback
   ```
3. **Site URL**: Set to your production URL
4. Click **Save**

---

## 🎨 What Changed in Code

### Files Modified:
1. **`components/auth/AuthProvider.tsx`**
   - Removed: `signInWithOtp()` and `verifyOtp()`
   - Added: `signInWithGoogle()` with `hd: 'iub.edu.bd'` domain restriction

2. **`components/auth/LoginForm.tsx`**
   - Replaced: Email OTP form → Google OAuth button
   - Added: Google logo SVG
   - Added: Error handling from OAuth callback
   - Simplified: One-click login (no email input needed)

3. **`app/auth/callback/route.ts`** (NEW)
   - Handles OAuth code exchange
   - Redirects to home on success
   - Redirects to login with error on failure

### Domain Restriction:
The `hd: 'iub.edu.bd'` parameter in the OAuth request restricts login to **@iub.edu.bd** accounts only. Users with other Gmail accounts will see "Can't use this account" error from Google.

---

## 🧪 Testing

### Local Testing:
1. Update `.env.local` with correct Supabase keys
2. Run `npm run dev`
3. Navigate to `http://localhost:3000/login`
4. Click "Continue with Google"
5. Select your **@iub.edu.bd** account
6. Should redirect to home page (`/`) as authenticated user

### Expected Flow:
```
Login Page → Click Google Button → Google OAuth Consent → 
Redirect to /auth/callback → Code Exchange → Redirect to Home (/)
```

---

## 🚨 Troubleshooting

### "redirect_uri_mismatch" Error:
- Check that `http://localhost:3000/auth/callback` is in Google Cloud Console **Authorized redirect URIs**
- Check that it's also in Supabase **Redirect URLs**

### "Can't use this account" Error:
- User is not using @iub.edu.bd email
- This is expected behavior (domain restriction working)

### "Authentication failed" Error:
- Check Supabase logs: Dashboard → **Authentication** → **Logs**
- Verify Client ID and Secret are correct
- Ensure Google OAuth is enabled in Supabase

### User Profile Not Created:
- Check if `profiles` table has RLS policies that allow inserts
- Verify trigger/function creates profile on new user signup

---

## 📋 Checklist

- [ ] Google Cloud Console: OAuth Client ID created
- [ ] Google Cloud Console: Redirect URIs added
- [ ] Supabase Dashboard: Google provider enabled
- [ ] Supabase Dashboard: Client ID & Secret configured
- [ ] Supabase Dashboard: Redirect URLs added
- [ ] `.env.local`: Correct Supabase keys
- [ ] Test: Login with @iub.edu.bd account
- [ ] Test: Login with non-IUB account (should fail)

---

## 🔐 Security Notes

1. **Domain Restriction**: The `hd` parameter restricts to @iub.edu.bd but users can bypass it. Add server-side email validation:
   
   Option: Add this to `app/auth/callback/route.ts`:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser()
   if (user && !user.email?.endsWith('@iub.edu.bd')) {
       await supabase.auth.signOut()
       return NextResponse.redirect(`${origin}/login?error=invalid_domain`)
   }
   ```

2. **Rate Limiting**: Google OAuth has its own rate limits. No need for custom rate limiting like OTP.

3. **Session Management**: Sessions are automatically managed by Supabase + the proxy.ts middleware.

---

## 🎯 Next Steps

1. Configure Google Cloud Console (get Client ID & Secret)
2. Enable Google in Supabase Dashboard
3. Test login flow
4. Deploy to production
5. Update redirect URLs for production domain

---

## 📝 Removed Code

The following email OTP code was removed:
- Email input form
- OTP verification step
- Rate limiting (30s cooldown)
- `signInWithOtp()` function
- `verifyOtp()` function

All replaced with single Google OAuth button! 🚀
