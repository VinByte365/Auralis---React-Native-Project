# Google Sign-In Setup Guide for Auralis

## Overview

This guide explains how to set up Google Sign-In for the Auralis mobile app with Firebase and backend integration.

## Backend Setup

### 1. Firebase Admin SDK

The backend already has Firebase Admin SDK installed. The configuration is in `backend/configs/firebase.js`.

**Environment Variable Required:**

```env
FIREBASE_SERVICE_ACCOUNT='{your-json-service-account-key}'
```

The service account JSON is already configured in your `.env`.

### 2. Google Auth Endpoint

- **Route:** `POST /api/v1/auth/google`
- **Location:** `backend/routes/authRoute.js`
- **Handler:** `backend/services/authService.js` → `googleAuth()`

**Request Body:**

```json
{
  "idToken": "firebase-id-token-from-mobile",
  "email": "user@example.com",
  "name": "User Name",
  "photoURL": "https://...",
  "firebaseUid": "firebase-uid"
}
```

**Response:**

```json
{
  "user": {
    "userId": "mongodb-user-id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "status": "active",
    "avatar": { "url": "..." }
  },
  "token": "jwt-auth-token"
}
```

### 3. Features

- ✅ Firebase ID token verification
- ✅ Account linking by email (if user exists with same email, links to existing account)
- ✅ Auto-activation of new Google users
- ✅ Activity logging for Google sign-ins
- ✅ JWT token generation for app sessions

---

## Mobile Setup

### 1. Firebase Configuration

**Step 1: Get Firebase Web Config**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `singularity-9b3ba`
3. Go to Project Settings → Web apps
4. Copy the config object

**Step 2: Create `.env` file in mobile directory**

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyABC123...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=singularity-9b3ba.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=singularity-9b3ba
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=singularity-9b3ba.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=117617340758...
EXPO_PUBLIC_FIREBASE_APP_ID=1:117617340758:web:abc123...

API_BASE_URL=http://your-backend-url
```

### 2. Google Services File (Android Only)

The app is configured to use `google-services.json` for Android.

**To get this file:**

1. Go to Firebase Console → Project Settings
2. Download `google-services.json`
3. Place it in the root of the `mobile/` directory

### 3. Mobile App Architecture

**Files Created/Updated:**

| File                                        | Purpose                              |
| ------------------------------------------- | ------------------------------------ |
| `mobile/src/services/googleAuthService.js`  | Firebase Google Sign-In logic        |
| `mobile/src/redux/thunks/authThunk.js`      | Redux thunk for Google Sign-In       |
| `mobile/src/redux/slices/authSlice.js`      | Redux state handling for Google auth |
| `mobile/src/hooks/AuthHooks.js`             | Hook with `googleSignInHandler`      |
| `mobile/src/screens/auth/LoginScreen.js`    | "Continue with Google" button        |
| `mobile/src/screens/auth/RegisterScreen.js` | "Continue with Google" button        |
| `mobile/.env.example`                       | Environment variables template       |

### 4. How It Works (User Flow)

```
1. User clicks "Continue with Google" button
   ↓
2. Firebase login dialog opens (Google account selection)
   ↓
3. User selects/signs in to Google account
   ↓
4. Firebase returns ID token + user info
   ↓
5. Mobile app sends ID token to backend (/api/v1/auth/google)
   ↓
6. Backend verifies token with Firebase Admin SDK
   ↓
7. Backend checks if user exists by email:
   - If YES: Link account (update Firebase UID)
   - If NO: Create new user account
   ↓
8. Backend generates JWT token
   ↓
9. Mobile app stores JWT token
   ↓
10. User is logged in!
```

### 5. Integration in Screens

**LoginScreen:**

```jsx
const { googleSignInHandler, loading } = AuthHooks();

<TouchableOpacity onPress={googleSignInHandler} disabled={loading}>
  <Text>{loading ? "Signing In..." : "Continue with Google"}</Text>
</TouchableOpacity>;
```

**RegisterScreen:**
Same implementation - new users are auto-created with Google account.

---

## Testing

### Test Google Sign-In Locally

**Step 1: Set up environment**

```bash
# Mobile
cd mobile
cp .env.example .env
# Edit .env with your Firebase credentials

# Backend
# Verify FIREBASE_SERVICE_ACCOUNT is set in .env
```

**Step 2: Start the app**

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Mobile
cd mobile
npm start
```

**Step 3: Test Flow**

1. Open app on physical device (Firebase requires real device for Google Sign-In)
2. Navigate to Login screen
3. Click "Continue with Google"
4. Select Google account
5. Verify user is logged in and redirected to home screen

### Troubleshooting

**Issue: "Firebase not initialized"**

- Solution: Verify `.env` has all `EXPO_PUBLIC_FIREBASE_*` variables
- Check that config matches your Firebase project

**Issue: "Invalid token"**

- Solution: Token may have expired, request new one
- Check backend Firebase Admin SDK initialization

**Issue: Expo Go doesn't work**

- Solution: Firebase on mobile requires `dev build`, not Expo Go
- Build with: `eas build --platform ios --profile preview`

\*\*Issue: "Account does not exist" error from backend

- Solution: Check if Firebase ID token is being sent correctly
- Backend logs: Check `console.error("Google Auth Error:", error)`

---

## Account Linking

Google Sign-In supports **email-based linking**:

**Scenario 1: User registered with email first**

```
1. User signs up with email: "user@gmail.com"
2. Later, signs in with Google using "user@gmail.com"
3. ✅ Accounts are linked (one user account)
4. User can sign in with either method
```

**Scenario 2: User signs in with Google first**

```
1. User clicks "Continue with Google"
2. New account created linked to Firebase UID
3. User email stored: "user@gmail.com"
4. User can later sign in with password if registered
```

---

## Security Notes

### Token Verification

- Backend verifies Firebase ID tokens using `admin.auth().verifyIdToken()`
- Tokens are cryptographically signed by Firebase
- Backend validates token signature matches Firebase keys

### Password-less Auth

- Google users don't have passwords
- Account can only be signed into via Google
- To enable password login, admin can reset password

### Account Security

- Users can change email in profile
- Use strong password for email/password accounts
- OAuth tokens are short-lived (1 hour)

---

## API Reference

### Endpoint: POST `/api/v1/auth/google`

**Headers:**

```
Content-Type: application/json
```

**Body:**

```json
{
  "idToken": "firebase-id-token",
  "email": "user@example.com",
  "name": "John Doe",
  "photoURL": "https://...",
  "firebaseUid": "firebase-uid"
}
```

**Success Response (200):**

```json
{
  "user": {
    "userId": "ObjectId",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "status": "active",
    "avatar": { "url": "..." }
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Response (401/400):**

```json
{
  "success": false,
  "error": "Invalid token" | "Missing ID token" | "Failed to create/fetch user"
}
```

---

## Next Steps

1. **Get Firebase credentials:**
   - Go to Firebase Console
   - Download `google-services.json` (Android)
   - Copy Web config

2. **Update `.env` in mobile:**
   - Add all `EXPO_PUBLIC_FIREBASE_*` variables
   - Verify backend URL

3. **Test on device:**
   - Build dev build: `eas build --platform android --profile preview`
   - Test Google Sign-In flow

4. **Monitor:** Check activity logs in `backend/models/activityLogsModel.js`

---

## Support

For issues, check:

- Backend logs: `backend/server.js` console output
- Mobile logs: Expo dev console
- Firebase Console: Authentication tab → Sign-in method
