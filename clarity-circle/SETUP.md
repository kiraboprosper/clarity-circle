# Clarity Circle — Setup Guide

## Prerequisites
- Node.js 18+
- Firebase project
- RevenueCat account

## 1. Clone & Install
```bash
npm install
```

## 2. Firebase Setup
1. Create a Firebase project at console.firebase.google.com
2. Enable: Authentication (Email/Password + Google), Firestore, Storage
3. Copy your Firebase config into `.env.local`
4. Deploy Firestore rules: `firebase deploy --only firestore:rules`
5. Deploy Storage rules: `firebase deploy --only storage`

## 3. Environment Variables
Rename `.env.local` and fill in all values:
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_REVENUECAT_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. RevenueCat
1. Create a RevenueCat project
2. Add your app
3. Create products: `clarity_plus_monthly` ($0.99) and `business_monthly` ($8.99)
4. Add your API key to `.env.local`

## 5. Printify
1. Connect your Printify store in the admin panel
2. Add products via Admin → Products

## 6. Create First Admin
1. Sign up for an account
2. In Firebase Console → Firestore → users → find your document
3. Set `role: "admin"`

## 7. Run Locally
```bash
npm run dev
```

## 8. Deploy
```bash
npm run build
# Then deploy to Vercel, Firebase Hosting, or your preferred host
```

---

## Route Structure
```
/                           Landing page
/login                      Sign in
/signup                     Create account
/onboarding                 Onboarding flow
/feed                       Social feed
/habits                     Habit tracker
/challenges                 Challenges list
/chat                       Direct messages
/store                      Merch store
/profile/[uid]              User profile
/settings                   Account settings
/admin                      Admin dashboard (admin only)
/admin/users                User management
/admin/challenges           Challenge management
/admin/products             Product management
/admin/reports              Content moderation
```

## Points Economy
| Event                | Points |
|---------------------|--------|
| Account created      | 50     |
| Onboarding completed | 100    |
| Daily login          | 5      |
| Habit completed      | 10     |
| Comment posted       | 5      |
| Post created         | 10     |
| Challenge completed  | 200–500|
| Referral             | 100    |

5,000 points = $5 store discount
