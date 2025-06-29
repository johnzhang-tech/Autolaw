# Multi-Provider OAuth Integration Guide

## Overview
This guide provides step-by-step instructions for integrating Google, Microsoft, and Yahoo OAuth with the existing Replit Auth system.

## Current Implementation Status

### ✅ Completed Features
- **Replit Auth**: Fully working OIDC integration
- **Email/Password Auth**: Complete local authentication with bcrypt
- **Enhanced AuthModal**: Mobile-first UI with branded provider buttons
- **Session Management**: Unified session handling across all providers
- **Database Schema**: Extended user table with provider tracking
- **Backend Routes**: All OAuth endpoints configured

### 🔄 Pending (OAuth Keys Required)
- Google OAuth activation
- Microsoft OAuth activation
- Yahoo OAuth (requires implementation)

## Backend Implementation

### 1. Authentication Strategies

The backend supports 4 authentication methods:

```typescript
// Replit OIDC (Active)
app.get("/api/login") // Replit Auth
app.get("/api/callback") // Replit callback

// Google OAuth (Ready - needs keys)
app.get("/api/auth/google") // Initiates Google OAuth
app.get("/api/auth/google/callback") // Google callback

// Microsoft OAuth (Ready - needs keys)
app.get("/api/auth/microsoft") // Initiates Microsoft OAuth
app.get("/api/auth/microsoft/callback") // Microsoft callback

// Local Email/Password (Active)
app.post("/api/auth/login") // Email/password login
app.post("/api/auth/register") // User registration
```

### 2. User Session Format

All authentication methods create a unified session format:

```typescript
{
  claims: {
    sub: "provider_userId", // Unique user identifier
    email: "user@example.com",
    given_name: "First",
    family_name: "Last", 
    picture: "profile_image_url"
  },
  access_token: "token", // OAuth access token
  refresh_token: "refresh", // OAuth refresh token (if available)
  expires_at: 1234567890 // Session expiration timestamp
}
```

### 3. Database Schema

The users table includes provider tracking:

```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  provider VARCHAR DEFAULT 'replit', -- 'replit', 'google', 'microsoft', 'local'
  password_hash VARCHAR, -- For local auth only
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Frontend Implementation

### 1. AuthModal Component

Mobile-first authentication modal with:
- Branded OAuth provider buttons (Google, Microsoft, Replit)
- Email/password forms with validation
- Responsive design with pure white background
- Form validation using React Hook Form + Zod
- Loading states and error handling

### 2. Usage

```typescript
import { AuthModal } from "@/components/AuthModal";

// In your component
const [isAuthOpen, setIsAuthOpen] = useState(false);
const [mode, setMode] = useState<"signin" | "signup">("signin");

<AuthModal 
  isOpen={isAuthOpen}
  onClose={() => setIsAuthOpen(false)}
  defaultMode={mode}
/>
```

## OAuth Provider Setup

### Google OAuth Setup

1. **Google Cloud Console** (console.cloud.google.com)
   - Create new project or select existing
   - Enable Google+ API and People API
   - Navigate to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Authorized redirect URIs: `https://your-domain.replit.app/api/auth/google/callback`
   - Copy Client ID and Client Secret

2. **Environment Variables**
   ```
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

### Microsoft OAuth Setup

1. **Azure Portal** (portal.azure.com)
   - Navigate to "Azure Active Directory" → "App registrations"
   - "New registration"
   - Name: Your app name
   - Redirect URI: `https://your-domain.replit.app/api/auth/microsoft/callback`
   - Register application

2. **Configure Authentication**
   - Go to "Authentication" → "Add a platform" → "Web"
   - Add redirect URI if not set during registration
   - Enable "Access tokens" and "ID tokens"

3. **Create Client Secret**
   - Go to "Certificates & secrets" → "New client secret"
   - Copy the secret value (only shown once)

4. **Environment Variables**
   ```
   MICROSOFT_CLIENT_ID=your_application_id
   MICROSOFT_CLIENT_SECRET=your_client_secret_value
   ```

### Yahoo OAuth Setup (Future Implementation)

Yahoo OAuth requires additional implementation:

1. **Yahoo Developer Console** (developer.yahoo.com)
   - Create new app
   - OAuth redirect URI: `https://your-domain.replit.app/api/auth/yahoo/callback`

2. **Backend Implementation Needed**
   ```typescript
   // Add to server/replitAuth.ts
   import { Strategy as YahooStrategy } from "passport-yahoo-oauth";
   
   passport.use(new YahooStrategy({
     consumerKey: process.env.YAHOO_CLIENT_ID,
     consumerSecret: process.env.YAHOO_CLIENT_SECRET,
     callbackURL: "/api/auth/yahoo/callback"
   }, async (token, tokenSecret, profile, done) => {
     // Implementation similar to Google/Microsoft
   }));
   ```

## Security Features

### 1. Session Management
- Secure HTTP-only cookies
- PostgreSQL session store
- 1-week session expiration
- Session refresh for OAuth tokens

### 2. Password Security
- bcrypt hashing with 12 rounds
- Minimum 8-character password requirement
- Password confirmation validation

### 3. Input Validation
- Zod schemas for all forms
- Server-side validation for all endpoints
- SQL injection protection via Drizzle ORM
- CSRF protection via session cookies

## Error Handling

### 1. Frontend Error States
- Network errors with retry options
- Validation errors with field-specific messages
- OAuth failures redirect to login with error messages
- Loading states for all async operations

### 2. Backend Error Responses
```typescript
// Standard error format
{
  message: "Human-readable error message",
  code?: "ERROR_CODE", // Optional error code
  details?: any // Additional error details
}
```

## Testing Authentication

### 1. Email/Password Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 2. Email/Password Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'
```

### 3. OAuth Flow Testing
- Navigate to `/api/auth/google` (will fail without keys)
- Navigate to `/api/auth/microsoft` (will fail without keys)
- Navigate to `/api/login` (Replit Auth - should work)

## Deployment Checklist

### Environment Variables
```bash
# Required for all auth
DATABASE_URL=postgresql://...
SESSION_SECRET=your_secure_session_secret
REPL_ID=your_repl_id
REPLIT_DOMAINS=your-domain.replit.app

# Optional OAuth providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

### Database Migration
```bash
npm run db:push
```

### Testing Authentication Flow
1. Visit landing page
2. Click "Get Started" or "Sign In"
3. Test email/password registration
4. Test email/password login
5. Test Replit Auth (if in Replit environment)
6. Test OAuth providers (once keys are added)

## Troubleshooting

### Common Issues

1. **OAuth Redirect Mismatch**
   - Ensure redirect URIs in provider console match exactly
   - Include `https://` protocol
   - No trailing slashes

2. **Session Issues**
   - Check DATABASE_URL is set correctly
   - Verify sessions table exists
   - Ensure SESSION_SECRET is set

3. **CORS Issues**
   - Ensure `trust proxy` is set for production
   - Check domain configuration in OAuth providers

### Debug Mode
Enable debug logging in development:
```typescript
// Add to server/index.ts
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
  });
}
```

## Future Enhancements

1. **Two-Factor Authentication**
   - SMS verification
   - TOTP authenticator apps
   - Backup codes

2. **Social Providers**
   - GitHub OAuth
   - LinkedIn OAuth
   - Apple Sign In

3. **Enterprise Features**
   - SAML integration
   - Active Directory
   - Single Sign-On (SSO)

4. **Account Management**
   - Password reset flow
   - Email verification
   - Account linking/unlinking