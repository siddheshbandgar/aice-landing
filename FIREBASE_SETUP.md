# Firebase Setup Instructions

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard
4. Enable **Google Analytics** (optional but recommended)

## Step 2: Enable Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for now - we'll secure it later)
4. Select a location (choose closest to your users)
5. Click **Enable**

## Step 3: Get Firebase Configuration

1. In Firebase Console, click the **⚙️ Settings icon** → **Project settings**
2. Scroll down to **Your apps** section
3. Click **</> (Web)** icon to add a web app
4. Register your app (nickname: "AICE Landing")
5. Copy the **firebaseConfig** object

## Step 4: Create Environment File

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 5: Secure Firestore Rules (IMPORTANT!)

1. Go to **Firestore Database** → **Rules** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write to newsletter_subscribers collection
    match /newsletter_subscribers/{email} {
      allow read: if request.auth != null; // Only authenticated users can read
      allow create: if true; // Anyone can create (subscribe)
      allow update: if false; // No updates allowed
      allow delete: if request.auth != null; // Only authenticated users can delete
    }
  }
}
```

**For testing (less secure, but works immediately):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // Allow all for testing
    }
  }
}
```

⚠️ **Important:** The test mode rules are insecure. Update them before going to production!

## Step 6: Test the Connection

1. Restart your dev server:

   ```bash
   npm run dev
   ```

2. Try subscribing with a test email
3. Check Firebase Console → Firestore → `newsletter_subscribers` collection
4. You should see the document with all user data!

## Troubleshooting

- **"Firebase: Error (auth/configuration-not-found)"**: Check your `.env.local` file exists and has correct values
- **"Permission denied"**: Update Firestore rules (Step 5)
- **"Network error"**: Check your internet connection and Firebase project is active

## Production Checklist

- [ ] Update Firestore rules to be more secure
- [ ] Enable Firebase App Check (optional, for bot protection)
- [ ] Set up Firebase Analytics (optional)
- [ ] Configure custom domain (optional)
